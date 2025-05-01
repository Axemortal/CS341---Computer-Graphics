import { ShaderRenderer } from "./shader_renderer.js";

export class NormalsShaderRenderer extends ShaderRenderer {

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