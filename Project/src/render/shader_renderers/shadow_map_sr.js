import { ResourceManager } from "../../scene_resources/resource_manager.js";
import { ShaderRenderer } from "./shader_renderer.js";

export class ShadowMapShaderRenderer extends ShaderRenderer {
  /**
   * Used to compute distance of a fragment from the eyes
   * of the camera. It has application in generating the
   * shadows cube map.
   * @param {*} regl
   * @param {ResourceManager} resourceManager
   */
  constructor(regl, resourceManager) {
    super(
      regl,
      resourceManager,
      `shadow_map.vert.glsl`,
      `shadow_map.frag.glsl`
    );
  }

  /**
   * Render the scene in greyscale using the distance between the camera and the fragment.
   * From black (distance = 0) to white.
   * @param {*} sceneState
   */
  render(sceneState) {
    const scene = sceneState.scene;
    const inputs = [];

    for (const obj of scene.objects) {
      const mesh = this.resourceManager.getMesh(obj.meshReference);

      const { matModelView, matModelViewProjection } =
        scene.camera.objectMatrices.get(obj);

      inputs.push({
        mesh: mesh,

        matModelViewProjection: matModelViewProjection,
        matModelView: matModelView,
      });
    }

    this.pipeline(inputs);
  }

  cull() {
    return { enable: true }; // don't draw back face
  }

  uniforms(regl) {
    return {
      // View (camera) related matrix
      mat_model_view_projection: regl.prop("matModelViewProjection"),
      mat_model_view: regl.prop("matModelView"),
    };
  }
}
