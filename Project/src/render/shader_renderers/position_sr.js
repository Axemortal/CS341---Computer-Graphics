import { ShaderRenderer } from "./shader_renderer.js";

export class PositionShaderRenderer extends ShaderRenderer {
  /**
   * Its render function can be used to store the positions of the pixels in the z-buffer
   * @param {*} regl
   * @param {ResourceManager} resourceManager
   */
  constructor(regl, resourceManager) {
    super(regl, resourceManager, `position.vert.glsl`, `position.frag.glsl`);
  }

  /**
   * Render the objects of the sceneState with its shader
   * @param {*} sceneState
   */
  render(sceneState) {
    const scene = sceneState.scene;
    const inputs = [];

    for (const obj of scene.objects) {
      if (this.excludeObject(obj)) continue;

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

  excludeObject(obj) {
    return obj.material.properties.includes("environment");
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
    };
  }
}
