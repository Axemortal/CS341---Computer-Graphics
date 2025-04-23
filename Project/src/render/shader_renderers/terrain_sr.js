import {
  textureData,
  lightToCamView,
} from "../../cg_libraries/cg_render_utils.js";
import { ResourceManager } from "../../scene_resources/resource_manager.js";
import { ShaderRenderer } from "./shader_renderer.js";

export class TerrainShaderRenderer extends ShaderRenderer {
  /**
   * Dedicated blinn_phong shader for terrain rendering.
   * The main difference is, that it assigned different color to
   * the object based on the altitude of the fragment
   * @param {*} regl
   * @param {ResourceManager} resourceManager
   */
  constructor(regl, resourceManager) {
    super(regl, resourceManager, `terrain.vert.glsl`, `terrain.frag.glsl`);
  }

  /**
   * Render all objects that have a "terrain" material.
   * @param {*} sceneState
   */
  render(sceneState) {
    const scene = sceneState.scene;

    let ambientFactor = scene.ambientFactor;

    scene.lights.forEach((light) => {
      const inputs = [];
      // Transform light position into camera space
      const lightPositionCam = lightToCamView(
        light.position,
        scene.camera.mat.view
      );

      for (const object of scene.objects) {
        if (this.excludeObject(object)) continue;

        const mesh = this.resourceManager.getMesh(object.meshReference);
        const { texture, isTextured } = textureData(
          object,
          this.resourceManager
        );

        const { matModelView, matModelViewProjection, matNormalsModelView } =
          scene.camera.objectMatrices.get(object);

        inputs.push({
          mesh: mesh,

          matModelViewProjection: matModelViewProjection,
          matModelView: matModelView,
          matNormalsModelView: matNormalsModelView,

          lightPosition: lightPositionCam,
          lightColor: light.color,

          ambientFactor: ambientFactor,

          materialTexture: texture,
          isTextured: isTextured,

          materialWaterColor: object.material.water_color,
          materialWaterShininess: object.material.water_shininess,
          materialGrassColor: object.material.grass_color,
          materialGrassShininess: object.material.grass_shininess,
          materialPeakColor: object.material.peak_color,
          materialPeakShininess: object.material.peak_shininess,
        });
      }

      this.pipeline(inputs);
      // Set to 0 the ambient factor so it is only taken into account once during the first light render
      ambientFactor = 0;
    });
  }

  excludeObject(object) {
    // Exclude all non terrain objects
    return !object.material.properties.includes("terrain");
  }

  depth() {
    // Use z-buffer
    return {
      enable: true,
      mask: true,
      func: "<=",
    };
  }

  blend() {
    // Additive blend mode
    return {
      enable: true,
      func: {
        src: 1,
        dst: 1,
      },
    };
  }

  uniforms(regl) {
    return {
      // View (camera) related matrix
      mat_model_view_projection: regl.prop("matModelViewProjection"),
      mat_model_view: regl.prop("matModelView"),
      mat_normals_model_view: regl.prop("matNormalsModelView"),

      // Light data
      light_position: regl.prop("lightPosition"),
      light_color: regl.prop("lightColor"),

      // Ambient factor
      ambient_factor: regl.prop("ambientFactor"),

      // Material data
      material_texture: regl.prop("materialTexture"),
      is_textured: regl.prop("isTextured"),

      water_color: regl.prop("materialWaterColor"),
      water_shininess: regl.prop("materialWaterShininess"),
      grass_color: regl.prop("materialGrassColor"),
      grass_shininess: regl.prop("materialGrassShininess"),
      peak_color: regl.prop("materialPeakColor"),
      peak_shininess: regl.prop("materialPeakShininess"),
    };
  }
}
