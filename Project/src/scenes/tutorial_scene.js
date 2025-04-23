import { Scene } from "./scene.js";
import { ResourceManager } from "../scene_resources/resource_manager.js";

export class TutorialScene extends Scene {
  /**
   * A scene to be completed, used for the introductory tutorial
   * @param {ResourceManager} resourceManager
   */
  constructor(resourceManager) {
    super();

    this.resourceManager = resourceManager;

    this.initialize_scene();
    this.initialize_actor_actions();
  }

  /**
   * Scene setup
   */
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

  /**
   * Initialize custom scene-specific UI parameters to allow interactive control of selected scene elements.
   * This function is called in main() if the scene is active.
   */
  initialize_ui_params() {}
}
