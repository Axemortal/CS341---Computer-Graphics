<<<<<<< HEAD
import {
  textureData,
  lightToCamView,
} from "../../cg_libraries/cg_render_utils.js";
import { ResourceManager } from "../../scene_resources/resource_manager.js";
import { ShaderRenderer } from "./shader_renderer.js";

export class TerrainShaderRenderer extends ShaderRenderer {
  /**
   * Dedicated blinn_phong shader for terrain rendering.
   * The main difference is, that it assigned different color to
   * the object based on the altitude of the fragment
   * @param {*} regl
   * @param {ResourceManager} resourceManager
   */
  constructor(regl, resourceManager) {
    super(regl, resourceManager, `terrain.vert.glsl`, `terrain.frag.glsl`);
  }

  /**
   * Render all objects that have a "terrain" material.
   * @param {*} sceneState
   */
  render(sceneState) {
    const scene = sceneState.scene;

    let ambientFactor = scene.ambientFactor;

    scene.lights.forEach((light) => {
      const inputs = [];
      // Transform light position into camera space
      const lightPositionCam = lightToCamView(
        light.position,
        scene.camera.mat.view
      );

      for (const object of scene.objects) {
        if (this.excludeObject(object)) continue;

        const mesh = this.resourceManager.getMesh(object.meshReference);
        const { texture, isTextured } = textureData(
          object,
          this.resourceManager
        );

        const { matModelView, matModelViewProjection, matNormalsModelView } =
          scene.camera.objectMatrices.get(object);

        inputs.push({
          mesh: mesh,

          matModelViewProjection: matModelViewProjection,
          matModelView: matModelView,
          matNormalsModelView: matNormalsModelView,

          lightPosition: lightPositionCam,
          lightColor: light.color,

          ambientFactor: ambientFactor,

          materialTexture: texture,
          isTextured: isTextured,

          materialWaterColor: object.material.water_color,
          materialWaterShininess: object.material.water_shininess,
          materialGrassColor: object.material.grass_color,
          materialGrassShininess: object.material.grass_shininess,
          materialPeakColor: object.material.peak_color,
          materialPeakShininess: object.material.peak_shininess,
        });
      }

      this.pipeline(inputs);
      // Set to 0 the ambient factor so it is only taken into account once during the first light render
      ambientFactor = 0;
    });
  }

  excludeObject(object) {
    // Exclude all non terrain objects
    return !object.material.properties.includes("terrain");
  }

  depth() {
    // Use z-buffer
    return {
      enable: true,
      mask: true,
      func: "<=",
    };
  }

  blend() {
    // Additive blend mode
    return {
      enable: true,
      func: {
        src: 1,
        dst: 1,
      },
    };
  }

  uniforms(regl) {
    return {
      // View (camera) related matrix
      mat_model_view_projection: regl.prop("matModelViewProjection"),
      mat_model_view: regl.prop("matModelView"),
      mat_normals_model_view: regl.prop("matNormalsModelView"),

      // Light data
      light_position: regl.prop("lightPosition"),
      light_color: regl.prop("lightColor"),

      // Ambient factor
      ambient_factor: regl.prop("ambientFactor"),

      // Material data
      material_texture: regl.prop("materialTexture"),
      is_textured: regl.prop("isTextured"),

      water_color: regl.prop("materialWaterColor"),
      water_shininess: regl.prop("materialWaterShininess"),
      grass_color: regl.prop("materialGrassColor"),
      grass_shininess: regl.prop("materialGrassShininess"),
      peak_color: regl.prop("materialPeakColor"),
      peak_shininess: regl.prop("materialPeakShininess"),
    };
  }
}
=======
import {texture_data, light_to_cam_view} from "../../cg_libraries/cg_render_utils.js"
import { ResourceManager } from "../../scene_resources/resource_manager.js";
import {ShaderRenderer} from "./shader_renderer.js"


export class TerrainShaderRenderer extends ShaderRenderer {

    /**
     * Dedicated blinn_phong shader for terrain rendering.
     * The main difference is, that it assigned different color to
     * the object based on the altitude of the fragment
     * @param {*} regl 
     * @param {ResourceManager} resource_manager 
     */
    constructor(regl, resource_manager){
        super(
            regl, 
            resource_manager, 
            `terrain.vert.glsl`, 
            `terrain.frag.glsl`
        );
    }
    
    /**
     * Render all objects that have a "terrain" material.
     * @param {*} scene_state 
     */
    render(scene_state){

        const scene = scene_state.scene;
        const inputs = [];

        let ambient_factor = scene.ambient_factor;

        scene.lights.forEach(light => {
            // Transform light position into camera space
            const light_position_cam = light_to_cam_view(light.position, scene.camera.mat.view);

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
                    mat_model_view: mat_model_view,
                    mat_normals_model_view: mat_normals_model_view,

                    light_position: light_position_cam,
                    light_color: light.color,

                    ambient_factor : ambient_factor,

                    material_texture: texture,
                    is_textured: is_textured,

                    material_water_color: obj.material.water_color,
                    material_water_shininess: obj.material.water_shininess,
                    material_grass_color: obj.material.grass_color,
                    material_grass_shininess: obj.material.grass_shininess,
                    material_peak_color: obj.material.peak_color,
                    material_peak_shininess: obj.material.peak_shininess
                });

            }

            this.pipeline(inputs);
            // Set to 0 the ambient factor so it is only taken into account once during the first light render
            ambient_factor = 0;
        });
    }

    exclude_object(obj){
        // Exclude all non terrain objects
        return !obj.material.properties.includes('terrain');
    }

    depth(){
        // Use z-buffer
        return {
            enable: true,
            mask: true,
            func: '<=',
        };
    }

    blend(){
        // Additive blend mode
        return {
            enable: true,
            func: {
                src: 1,
                dst: 1,
            },
        };
    }

    uniforms(regl){
        return{
            // View (camera) related matrix
            mat_model_view_projection: regl.prop('mat_model_view_projection'),
            mat_model_view: regl.prop('mat_model_view'),
            mat_normals_model_view: regl.prop('mat_normals_model_view'),
    
            // Light data
            light_position: regl.prop('light_position'),
            light_color: regl.prop('light_color'),

            // Ambient factor
            ambient_factor: regl.prop('ambient_factor'),
    
            // Material data
            material_texture: regl.prop('material_texture'),
            is_textured: regl.prop('is_textured'),

            water_color: regl.prop('material_water_color'),
            water_shininess: regl.prop('material_water_shininess'),
            grass_color: regl.prop('material_grass_color'),
            grass_shininess: regl.prop('material_grass_shininess'),
            peak_color: regl.prop('material_peak_color'),
            peak_shininess: regl.prop('material_peak_shininess')
        };
    }
}

>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
