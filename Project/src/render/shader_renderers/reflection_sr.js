import { ShaderRenderer } from "./shader_renderer.js";

export class ReflectionShaderRenderer extends ShaderRenderer {
  /**
   * Its render function can be used to render a scene with screen space reflection
   * @param {*} regl
   * @param {ResourceManager} resourceManager
   */
  constructor(regl, resourceManager) {
    super(
      regl,
      resourceManager,
      `pass_through.vert.glsl`,
      `reflection.frag.glsl`
    );
  }

  /**
   * Render the objects of the sceneState with its shader
   * @param {*} sceneState
   */
  render(sceneState, { reflectionColorTexture, reflectionBlurTexture }) {
    const scene = sceneState.scene;
    const inputs = [];

    const texWidth = reflectionColorTexture._texture.width;
    const texHeight = reflectionColorTexture._texture.height;
    const texSize = [texWidth, texHeight];

    for (const object of scene.objects) {
      if (this.excludeObject(object)) continue;

      const mesh = this.resourceManager.getMesh(object.meshReference);

      const { matModelViewProjection } =
        scene.camera.objectMatrices.get(object);

      inputs.push({
        mesh: mesh,

        matModelViewProjection: matModelViewProjection,

        materialShininess: object.material.shininess,

        reflectionColorTexture: reflectionColorTexture,
        reflectionBlurTexture: reflectionBlurTexture,
        texSize: texSize,
      });
    }

    this.pipeline(inputs);
  }

  excludeObject(object) {
    return !object.material.properties.includes("reflective");
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

      material_shininess: regl.prop("materialShininess"),

      reflection_color_texture: regl.prop("reflectionColorTexture"),
      reflection_blur_texture: regl.prop("reflectionBlurTexture"),

      tex_size: regl.prop("texSize"),
    };
  }
}
