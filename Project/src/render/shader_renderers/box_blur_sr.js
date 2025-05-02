import { vec2 } from "../../../lib/gl-matrix_3.3.0/esm/index.js";
import { ShaderRenderer } from "./shader_renderer.js";

export class BoxBlurShaderRenderer extends ShaderRenderer {
  /**
   * Its render function can be used to blur a scene
   * @param {*} regl
   * @param {ResourceManager} resourceManager
   */
  constructor(regl, resourceManager) {
    super(
      regl,
      resourceManager,
      `pass_through.vert.glsl`,
      `box_blur.frag.glsl`
    );
  }

  /**
   * Render the objects of the sceneState with its shader
   * @param {*} sceneState
   */
  render(sceneState, { colorTexture }) {
    const scene = sceneState.scene;
    const inputs = [];

    const texWidth = colorTexture._texture.width;
    const texHeight = colorTexture._texture.height;
    const texSize = [texWidth, texHeight];

    const size = 6;
    const seperation = 1;

    for (const object of scene.objects) {
      const mesh = this.resourceManager.getMesh(object.meshReference);

      const { matModelViewProjection } =
        scene.camera.objectMatrices.get(object);

      inputs.push({
        mesh: mesh,

        matModelViewProjection: matModelViewProjection,

        colorTexture: colorTexture,
        texSize: texSize,
        parameters: vec2.fromValues(size, seperation),
      });
    }

    this.pipeline(inputs);
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

      color_texture: regl.prop("colorTexture"),
      tex_size: regl.prop("texSize"),
      parameters: regl.prop("parameters"),
    };
  }
}
