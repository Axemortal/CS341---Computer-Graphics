import { ShaderRenderer } from "./shader_renderer.js";

export class NormalsShaderRenderer extends ShaderRenderer {
  /**
   * Its render function can be used to render a scene with the normals shader
   * @param {*} regl
   * @param {ResourceManager} resourceManager
   */
  constructor(regl, resourceManager) {
    super(regl, resourceManager, `normals.vert.glsl`, `normals.frag.glsl`);
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

      const { matModelView, matModelViewProjection, matNormalsModelView } =
        scene.camera.objectMatrices.get(obj);

      inputs.push({
        mesh: mesh,

        matModelViewProjection: matModelViewProjection,
        matNormalsModelView: matNormalsModelView,
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
      mat_normals_model_view: regl.prop("matNormalsModelView"),
    };
  }
}
