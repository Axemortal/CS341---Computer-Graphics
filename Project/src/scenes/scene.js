<<<<<<< HEAD
import { TurntableCamera } from "../scene_resources/camera.js";
=======


import { TurntableCamera } from "../scene_resources/camera.js"
import { ResourceManager } from "../scene_resources/resource_manager.js";

>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879

export class Scene {
  /**
   * Create a scene object that can be passed to a SceneRenderer to be displayed on the screen
   */
  constructor() {
<<<<<<< HEAD
    // Scene-specific parameters that can be modified from the UI
    this.UIParams = {};
=======

    // Scene-specific parameters that can be modified from the UI
    this.ui_params = {}
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879

    // A list of all the objects that will be rendred on the screen
    this.objects = [];

    // A set of key-value pairs, each entry represents an object that evolves with time
    this.actors = {};
<<<<<<< HEAD

=======
    
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
    // Camera, turntable by default
    this.camera = new TurntableCamera();

    // Ambient light coefficient
<<<<<<< HEAD
    this.ambientFactor = 0.3;
=======
    this.ambient_factor = 0.7;
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879

    // Point lights
    this.lights = [];
  }

  /**
   * Scene setup
   */
  initialize_scene() {}

  /**
<<<<<<< HEAD
   * Initialize the evolve function that describes the behaviour of each actor
=======
   * Initialize the evolve function that describes the behaviour of each actor 
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
   */
  initialize_actor_actions() {}

  /**
   * Initialize custom scene-specific UI parameters to allow interactive control of selected scene elements.
   * This function is called in main() if the scene is active.
   */
<<<<<<< HEAD
  initializeUIParams() {}
}
=======
  initialize_ui_params() {}
}
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
