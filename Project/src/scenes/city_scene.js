// city_scene.js
import { Scene } from "./scene.js";
import { setupCityScene, updateInstancedObjectsVisibility } from "../scene_resources/scene_setup.js";

export class CityScene extends Scene {
  /** @param {ResourceManager} resource_manager */
  constructor(resource_manager) {
    super();
    this.resource_manager     = resource_manager;
    this.objects              = [];
    this.lights               = [];
    this.instancedObjects     = {};
    this.cameraPosition       = [0, 0, 0];
    this.lastCameraUpdateTime = 0;
    this.visibilityDistance   = 30;
    this.billboardLODDistances= { high:15, medium:25, low:35 };

    this.initialize_scene();
    this.initialize_actor_actions();
  }

  async initialize_scene() {
    // Delegate everything to scene_setup.js
    await setupCityScene(this.resource_manager, this);
    // Initial visibility cull
    updateInstancedObjectsVisibility(this);
  }

  update(dt, camera) {
    if (camera?.position) {
      this.cameraPosition = camera.position;
      const now = performance.now();
      if (now - this.lastCameraUpdateTime > 100) {
        updateInstancedObjectsVisibility(this);
        this.lastCameraUpdateTime = now;
      }
    }
  }

  initialize_actor_actions() {}

  initialize_ui_params() {
    return {
      visibilityDistance: {
        value: this.visibilityDistance,
        min: 10, max: 50, step: 1,
        onChange: v => {
          this.visibilityDistance = v;
          updateInstancedObjectsVisibility(this);
        }
      }
    };
  }
}
