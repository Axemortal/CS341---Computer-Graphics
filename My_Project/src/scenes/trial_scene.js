
import { TurntableCamera } from "../scene_resources/camera.js"
import * as MATERIALS from "../render/materials.js"
import { cg_mesh_make_plane } from "../cg_libraries/cg_mesh.js"
import { cg_mesh_make_uv_sphere } from "../cg_libraries/cg_mesh.js";

import { 
  create_slider, 
  create_button_with_hotkey, 
  create_hotkey_action 
} from "../cg_libraries/cg_web.js";
import { Scene } from "./scene.js";
import { ResourceManager } from "../scene_resources/resource_manager.js";
import { ProceduralTextureGenerator } from "../render/procedural_texture_generator.js";
import { noise_functions } from "../render/shader_renderers/noise_sr.js";

export class TrialScene extends Scene {

  /**
   * A scene to be completed, used for the introductory tutorial
   * @param {ResourceManager} resource_manager 
   */
  constructor(regl, resource_manager){
    super();

    this.regl = regl;
    this.resource_manager = resource_manager;
    this.dynamic_objects = [];

    this.initialize_scene();
    this.initialize_actor_actions();
  }

  /**
   * Scene setup
   */
  initialize_scene(){

    // TODO

    this.lights.push({
        position: [0.0, -2.0, 2.5],
        color: [1.0, 1.0, 0.9]
      });
      
    // Create texture generator with stored regl instance
    this.texture_generator = new ProceduralTextureGenerator(
    this.regl,
    this.resource_manager
    );

    this.resource_manager.add_procedural_mesh("plane", cg_mesh_make_plane());

    // Generate noise texture
    this.texture_generator.compute_texture(
        'procedural_worley',
        noise_functions.worley,
        { width: 1024, height: 1024 }
    );
    
    const worley_texture = this.resource_manager.resources['procedural_worley'].texture;
    MATERIALS.neon_billboard.uniforms.u_worley_texture = worley_texture;

    this.dynamic_objects.push({
    translation: [0, 0, 0],
    scale: [2, 2, 2],
    mesh_reference: "plane",
    material: MATERIALS.neon_billboard,
    });

    
    this.objects = this.dynamic_objects;
  }
  /**
   * Initialize the evolve function that describes the behaviour of each actor 
   */
  initialize_actor_actions(){
    }

  /**
   * Initialize custom scene-specific UI parameters to allow interactive control of selected scene elements.
   * This function is called in main() if the scene is active.
   */
  initialize_ui_params(){

    // TODO
    create_hotkey_action("Preset view", "1", () => {
        this.camera.set_preset_view({
          distance_factor : 0.3,
          angle_z : 0,
          angle_y : -Math.PI/2,
          look_at : [0, 0, 0]
        })
      });
      

  }

}