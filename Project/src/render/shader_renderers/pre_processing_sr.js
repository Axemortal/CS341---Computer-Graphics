import { ResourceManager } from "../../scene_resources/resource_manager.js";
import { ShaderRenderer } from "./shader_renderer.js";

export class PreprocessingShaderRenderer extends ShaderRenderer {
  /**
   * Used to run a preprocessing pass that will fill the
   * z-buffer and pure black default color to all objects
   * @param {*} regl
   * @param {ResourceManager} resourceManager
   */
  constructor(regl, resourceManager) {
    super(
      regl,
      resourceManager,
      `pass_through.vert.glsl`,
      `pre_processing.frag.glsl`
    );
  }

  /**
   * Fill the z-buffer for all the objects in the scene and
   * color all these objects in pure black
   * @param {*} sceneState
   */
  render(sceneState) {
    const scene = sceneState.scene;
    const inputs = [];

    for (const obj of scene.objects) {
      if (this.excludeObject(obj)) continue;

      const mesh = this.resourceManager.getMesh(obj.meshReference);

      const { matModelViewProjection } = scene.camera.objectMatrices.get(obj);

      inputs.push({
        mesh: mesh,

        matModelViewProjection: matModelViewProjection,
      });
    }

    this.pipeline(inputs);
  }

  // Overwrite the pipeline
  initPipeline() {
    const regl = this.regl;
    return regl({
      attributes: {
        vertex_positions: regl.prop("mesh.vertexPositions"),
      },

      elements: regl.prop("mesh.faces"),

      blend: {
        enable: false,
      },

      uniforms: {
        mat_model_view_projection: regl.prop("matModelViewProjection"),
      },

      vert: this.vertShader,
      frag: this.fragShader,
    });
  }
}
