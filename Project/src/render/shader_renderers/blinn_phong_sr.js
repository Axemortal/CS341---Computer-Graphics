import {
  textureData,
  lightToCamView,
} from "../../cg_libraries/cg_render_utils.js";
import { ResourceManager } from "../../scene_resources/resource_manager.js";
import { ShaderRenderer } from "./shader_renderer.js";

export class BlinnPhongShaderRenderer extends ShaderRenderer {
  /**
   * Its render function can be used to render a scene with the blinn-phong model
   * @param {*} regl
   * @param {ResourceManager} resourceManager
   */
  constructor(regl, resourceManager) {
    super(
      regl,
      resourceManager,
      `blinn_phong.vert.glsl`,
      `blinn_phong.frag.glsl`
    );
  }

  /**
   * Render the objects of the sceneState with its shader
   * @param {*} sceneState
   */
  render(sceneState, { positionTexture, normalTexture }) {
    const scene = sceneState.scene;

    const texWidth = positionTexture._texture.width;
    const texHeight = positionTexture._texture.height;
    const texSize = [texWidth, texHeight];

    let ambientFactor = scene.ambientFactor;

    // For every light in the scene we render the blinn-phong contributions
    // Results will be added on top of each other (see this.blend())
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

        const { matModelViewProjection } =
          scene.camera.objectMatrices.get(object);

        // Data passed to the pipeline to be used by the shader
        inputs.push({
          mesh: mesh,

          matModelViewProjection: matModelViewProjection,

          materialTexture: texture,
          isTextured: isTextured,
          materialBaseColor: object.material.color,
          materialShininess: object.material.shininess,

          light_position: lightPositionCam,
          light_color: light.color,
          ambientFactor: ambientFactor,

          positionTexture: positionTexture,
          normalTexture: normalTexture,
          texSize: texSize,
        });
      }

      this.pipeline(inputs);
      // Set the ambient factor to 0 so it is only taken into account once during the first light render
      ambientFactor = 0;
    });
  }

  excludeObject(obj) {
    // Do not shade objects that use other dedicated shader
    return obj.material.properties.includes("no_blinn_phong");
  }

  depth() {
    // Use z buffer
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

      // Light data
      light_position: regl.prop("light_position"),
      light_color: regl.prop("light_color"),

      // Ambient factor
      ambient_factor: regl.prop("ambientFactor"),

      // Material data
      material_texture: regl.prop("materialTexture"),
      is_textured: regl.prop("isTextured"),
      material_base_color: regl.prop("materialBaseColor"),
      material_shininess: regl.prop("materialShininess"),

      position_texture: regl.prop("positionTexture"),
      normal_texture: regl.prop("normalTexture"),

      tex_size: regl.prop("texSize"),
    };
  }
}
