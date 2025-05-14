// city_scene.js
import { Scene } from "./scene.js";
import { setupCityScene, updateInstancedObjectsVisibility } from "../scene_resources/scene_setup.js";
import { createSlider, createButton, clearOverlay } from "../cg_libraries/cg_web.js";

export class CityScene extends Scene {
  /** @param {ResourceManager} resource_manager */
  constructor(resource_manager) {
    super();
    // Dimensions for WFC grids
    this.centralDims = [10, 5, 4];
    this.smallDims   = [3, 3, 3];

    // Core scene data
    this.resource_manager     = resource_manager;
    this.objects              = [];
    this.lights               = [];
    this.instancedObjects     = {};
    this.cameraPosition       = [0, 0, 0];
    this.lastCameraUpdateTime = 0;
    this.visibilityDistance   = 30;
    this.billboardLODDistances= { high:15, medium:25, low:35 };

    // Initialize scene
    this.initialize_scene();
    this.initialize_actor_actions();
  }

  /**
   * Orchestrate WFC-based scene setup
   */
  async initialize_scene() {
    await setupCityScene(
      this.resource_manager,
      this,
      this.centralDims,
      this.smallDims
    );
    updateInstancedObjectsVisibility(this);
  }

  /**
   * Rebuild the city when parameters change
   */
  async reloadCityScene() {
    // Clear previous data
    this.objects = [];
    this.lights  = [];
    this.instancedObjects = {};

    // Re-run setup
    await setupCityScene(
      this.resource_manager,
      this,
      this.centralDims,
      this.smallDims
    );
    updateInstancedObjectsVisibility(this);
  }

  /**
   * Frame update: camera-driven culling
   */
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

  /**
   * Placeholder for actor actions
   */
  initialize_actor_actions() {}

  /**
   * Create UI controls for adjustable parameters
   */
  initialize_ui_params() {
    // Clear existing UI
    clearOverlay();

    // Visibility distance
    createSlider(
      "Visibility Distance",
      [10, 50],
      (v) => {
        this.visibilityDistance = Number(v);
        updateInstancedObjectsVisibility(this);
      }
    );

    // Central block dimensions (update values and reload)
    createSlider(
      "Central Width",
      [1, 20],
      (v) => { this.centralDims[0] = Number(v); this.reloadCityScene(); }
    );
    createSlider(
      "Central Depth",
      [1, 20],
      (v) => { this.centralDims[1] = Number(v); this.reloadCityScene(); }
    );
    createSlider(
      "Central Height",
      [1, 10],
      (v) => { this.centralDims[2] = Number(v); this.reloadCityScene(); }
    );

    // Surrounding block dimensions (update values and reload)
    createSlider(
      "Small Width",
      [1, 10],
      (v) => { this.smallDims[0] = Number(v); this.reloadCityScene(); }
    );
    createSlider(
      "Small Depth",
      [1, 10],
      (v) => { this.smallDims[1] = Number(v); this.reloadCityScene(); }
    );
    createSlider(
      "Small Height",
      [1, 10],
      (v) => { this.smallDims[2] = Number(v); this.reloadCityScene(); }
    );
    createSlider(
      "Small Width",
      [1, 10],
      (v) => { this.smallDims[0] = Number(v); }
    );
    createSlider(
      "Small Depth",
      [1, 10],
      (v) => { this.smallDims[1] = Number(v); }
    );
    createSlider(
      "Small Height",
      [1, 10],
      (v) => { this.smallDims[2] = Number(v); }
    );

    // Reload button to apply changes
    createButton(
      "Reload City Scene",
      () => { this.reloadCityScene(); }
    );
  }
}
