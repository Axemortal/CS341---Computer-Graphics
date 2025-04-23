import { ShaderRenderer } from "./shader_renderer.js";

export class TextureShaderRenderer extends ShaderRenderer {
  /**
   * Its render function can be used to store the positions of the pixels in the z-buffer
   * @param {*} regl
   * @param {ResourceManager} resourceManager
   */
  constructor(regl, resourceManager) {
    super(regl, resourceManager, `pass_through.vert.glsl`, `texture.frag.glsl`);
  }

  /**
   * Render the objects of the sceneState with its shader
   * @param {*} sceneState
   */
  render(sceneState, texture) {
    const scene = sceneState.scene;
    const inputs = [];

    const texWidth = texture._texture.width;
    const texHeight = texture._texture.height;
    const texSize = [texWidth, texHeight];

    for (const object of scene.objects) {
      const mesh = this.resourceManager.getMesh(object.meshReference);

      const { matModelView, matModelViewProjection } =
        scene.camera.objectMatrices.get(object);

      inputs.push({
        mesh: mesh,

        matModelViewProjection: matModelViewProjection,
        matModelView: matModelView,

        sampleTexture: texture,
        texSize: texSize,
      });
    }

    this.pipeline(inputs);
  }

  depth() {
    // Use z buffer
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
      mat_model_view: regl.prop("matModelView"),

      sample_texture: regl.prop("sampleTexture"),
      tex_size: regl.prop("texSize"),
    };
  }
}
