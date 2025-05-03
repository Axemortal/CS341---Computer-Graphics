import { ShaderRenderer } from "./shader_renderer.js";

export class NormalsShaderRenderer extends ShaderRenderer {
<<<<<<< HEAD
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
=======

    /**
    * Its render function can be used to render a scene with the normals shader
    * @param {*} regl 
    * @param {ResourceManager} resource_manager 
    */
    constructor(regl, resource_manager) {
        super(
            regl,
            resource_manager,
            `normals.vert.glsl`,
            `normals.frag.glsl`
        );
    }

    /**
     * Render the objects of the scene_state with its shader
     * @param {*} scene_state 
     */
    render(scene_state) {
        const scene = scene_state.scene;
        const inputs = [];

        for (const obj of scene.objects) {
            if (this.exclude_object(obj)) continue;

            const mesh = this.resource_manager.get_mesh(obj.mesh_reference);

            const {
                mat_model_view,
                mat_model_view_projection,
                mat_normals_model_view
            } = scene.camera.object_matrices.get(obj);

            inputs.push({
                mesh: mesh,

                mat_model_view_projection: mat_model_view_projection,
                mat_model_view: mat_model_view,
                mat_normals_model_view: mat_normals_model_view,
            });
        }

        this.pipeline(inputs);
    }

    exclude_object(obj) {
        return obj.material.properties.includes('environment');
    }

    depth() {
        // Use z buffer
        return {
            enable: true,
            mask: true,
            func: '<=',
        };
    }

    uniforms(regl) {
        return {
            // View (camera) related matrix
            mat_model_view_projection: regl.prop('mat_model_view_projection'),
            mat_model_view: regl.prop('mat_model_view'),
            mat_normals_model_view: regl.prop('mat_normals_model_view'),
        }
    }
}
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
