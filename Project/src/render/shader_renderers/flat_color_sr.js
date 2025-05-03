<<<<<<< HEAD
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
=======
import {texture_data } from "../../cg_libraries/cg_render_utils.js"
import { ShaderRenderer } from "./shader_renderer.js";


export class FlatColorShaderRenderer extends ShaderRenderer {

    /**
     * Its render function can be used to render scene objects with 
     * just a color or a texture (wihtout shading effect)
     * @param {*} regl 
     * @param {ResourceManager} resource_manager 
     */
    constructor(regl, resource_manager){
        super(
            regl, 
            resource_manager, 
            `flat_color.vert.glsl`, 
            `flat_color.frag.glsl`
        );
    }

    /**
     * Render the objects of the scene_state with its shader
     * @param {*} scene_state 
     */
    render(scene_state){

        const scene = scene_state.scene
        const inputs = []

        for (const obj of scene.objects) {

            if(this.exclude_object(obj)) continue;

            const mesh = this.resource_manager.get_mesh(obj.mesh_reference);
            const {texture, is_textured} = texture_data(obj, this.resource_manager);
            
            const { 
                mat_model_view, 
                mat_model_view_projection, 
                mat_normals_model_view 
            } = scene.camera.object_matrices.get(obj);

            inputs.push({
                mesh: mesh,

                mat_model_view_projection: mat_model_view_projection,

                material_texture: texture,
                is_textured: is_textured,
                material_base_color: obj.material.color,
            });
        }

        this.pipeline(inputs);
    }

    exclude_object(obj){
        // Exclude object with environment material: the sky does not cast shadows
        return !obj.material.properties.includes('environment');
    }

    depth(){
        return {
            enable: true,
            mask: true,
            func: '<=',
        };
    }

    uniforms(regl){        
        return {
            // View (camera) related matrix
            mat_model_view_projection: regl.prop('mat_model_view_projection'),
    
            // Material data
            material_texture: regl.prop('material_texture'),
            is_textured: regl.prop('is_textured'),
            material_base_color: regl.prop('material_base_color'),
        };
    }
}
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
