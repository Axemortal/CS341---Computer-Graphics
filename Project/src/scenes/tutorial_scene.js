<<<<<<< HEAD
=======

import { TurntableCamera } from "../scene_resources/camera.js"
import * as MATERIALS from "../render/materials.js"
import { cg_mesh_make_uv_sphere } from "../cg_libraries/cg_mesh.js"

import { 
  create_slider, 
  create_button_with_hotkey, 
  create_hotkey_action 
} from "../cg_libraries/cg_web.js";
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
import { Scene } from "./scene.js";
import { ResourceManager } from "../scene_resources/resource_manager.js";

export class TutorialScene extends Scene {
<<<<<<< HEAD
  /**
   * A scene to be completed, used for the introductory tutorial
   * @param {ResourceManager} resourceManager
   */
  constructor(resourceManager) {
    super();

    this.resourceManager = resourceManager;
=======

  /**
   * A scene to be completed, used for the introductory tutorial
   * @param {ResourceManager} resource_manager 
   */
  constructor(resource_manager){
    super();
    
    this.resource_manager = resource_manager;
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879

    this.initialize_scene();
    this.initialize_actor_actions();
  }

  /**
   * Scene setup
   */
<<<<<<< HEAD
  initialize_scene() {
    this.lights.push({
      position: [0.0, -2.0, 2.5],
      color: [1.0, 1.0, 0.9],
    });
  }

  /**
   * Initialize the evolve function that describes the behaviour of each actor
   */
  initialize_actor_actions() {}
=======
  initialize_scene(){

    // TODO

    this.lights.push({
      position : [0.0 , -2.0, 2.5],
      color: [1.0, 1.0, 0.9]
    });

  }

  /**
   * Initialize the evolve function that describes the behaviour of each actor 
   */
  initialize_actor_actions(){

    // TODO

  }
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879

  /**
   * Initialize custom scene-specific UI parameters to allow interactive control of selected scene elements.
   * This function is called in main() if the scene is active.
   */
<<<<<<< HEAD
  initialize_ui_params() {}
=======
  initialize_ui_params(){

    // TODO

  }

>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
}
