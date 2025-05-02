import { textureData } from "../../cg_libraries/cg_render_utils.js";
import { ShaderRenderer } from "./shader_renderer.js";

export class FlatColorShaderRenderer extends ShaderRenderer {
  /**
   * Its render function can be used to render scene objects with
   * just a color or a texture (without shading effect)
   * @param {*} regl
   * @param {ResourceManager} resourceManager
   */
  constructor(regl, resourceManager) {
    super(
      regl,
      resourceManager,
      `flat_color.vert.glsl`,
      `flat_color.frag.glsl`
    );
  }

  /**
   * Render the objects of the sceneState with its shader
   * @param {*} sceneState
   */
  render(sceneState) {
    const scene = sceneState.scene;
    const inputs = [];

    for (const object of scene.objects) {
      if (this.excludeObject(object)) continue;

      const mesh = this.resourceManager.getMesh(object.meshReference);
      const { texture, isTextured } = textureData(object, this.resourceManager);

      const { matModelViewProjection } =
        scene.camera.objectMatrices.get(object);

      inputs.push({
        mesh: mesh,

        matModelViewProjection: matModelViewProjection,

        materialTexture: texture,
        isTextured: isTextured,
        materialBaseColor: object.material.color,
      });
    }

    this.pipeline(inputs);
  }

  excludeObject(obj) {
    // Include object with environment material: the sky does not cast shadows
    return !obj.material.properties.includes("environment");
  }

  depth() {
    return {
      enable: true,
      mask: true,
      func: "<=",
    };
  }

  uniforms(regl) {
    return {
      // View (camera) related matrix
      mat_model_view_projection: regl.prop("matModelViewProjection"),

      // Material data
      material_texture: regl.prop("materialTexture"),
      is_textured: regl.prop("isTextured"),
      material_base_color: regl.prop("materialBaseColor"),
    };
  }
}
