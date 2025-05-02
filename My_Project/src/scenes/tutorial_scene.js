
import { TurntableCamera } from "../scene_resources/camera.js"
import * as MATERIALS from "../render/materials.js"
import { cg_mesh_make_uv_sphere } from "../cg_libraries/cg_mesh.js"

import { 
  create_slider, 
  create_button_with_hotkey, 
  create_hotkey_action 
} from "../cg_libraries/cg_web.js";
import { Scene } from "./scene.js";
import { ResourceManager } from "../scene_resources/resource_manager.js";

export class TutorialScene extends Scene {

  /**
   * A scene to be completed, used for the introductory tutorial
   * @param {ResourceManager} resource_manager 
   */
  constructor(resource_manager){
    super();
    
    this.resource_manager = resource_manager;

    this.static_objects = [];
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
      position : [0.0 , -7.0, 0.0],
      color: [1.0, 1.0, 0.9]
    });

    this.resource_manager.add_procedural_mesh("mesh_sphere_env_map", cg_mesh_make_uv_sphere(16));

    const suzanne = {
      translation: [0, 0, 0],
      scale: [5., 5., 5.],
      mesh_reference: "suzanne.obj",
      material: MATERIALS.mirror
    };

    this.dynamic_objects.push(suzanne);
    this.actors["suzanne"] = suzanne;

    this.static_objects.push({
          translation: [0, 0, 0],
          scale: [80., 80., 80.],
          mesh_reference: 'mesh_sphere_env_map',
          material: MATERIALS.sunset_sky
        });

    this.objects = this.static_objects.concat(this.dynamic_objects);
  }

  /**
   * Initialize the evolve function that describes the behaviour of each actor 
   */
  initialize_actor_actions(){

    // TODO
    let t = 0;
    for (const name in this.actors){
      if (name.includes("suzanne")){
        const suzanne = this.actors["suzanne"];
        suzanne.evolve = (dt) => {
          t += dt;
          const scale_factor = 5 + Math.sin(t * 2.0); // oscillates between 4 and 6
          suzanne.scale = [scale_factor, scale_factor, scale_factor];
          suzanne.translation[2] = this.ui_params.obj_height;
        };
      }
    }

  }

  /**
   * Initialize custom scene-specific UI parameters to allow interactive control of selected scene elements.
   * This function is called in main() if the scene is active.
   */
  initialize_ui_params(){

    // TODO

    this.ui_params.obj_height = 0; 
    this.ui_params.is_mirror_active = true;
    this.ui_params.is_normals_active = false;
    create_hotkey_action("Preset view", "1", () => {
      this.camera.set_preset_view({
        distance_factor : 1.0,
        angle_z : -Math.PI / 2,
        angle_y : 0,
        look_at : [0, 0, 0]
      })
    });
    const n_steps_slider = 100;
    const min_obj_height = 0;
    const max_obj_height = 5;

    create_slider("Vertical Displacement ", [0, n_steps_slider], (i)  => {
      this.ui_params.obj_height = min_obj_height + i * (max_obj_height - min_obj_height) / n_steps_slider;
    })

    create_button_with_hotkey("Mirror on/off", 'm', () => {
      this.ui_params.is_mirror_active = !this.ui_params.is_mirror_active;});

    create_button_with_hotkey("Normals: Off", 'n', () => {
      this.ui_params.is_normals_active = !this.ui_params.is_normals_active;
    });
  }
}
