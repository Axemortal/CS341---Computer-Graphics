import { Scene } from "./scene.js";
import { setupCityScene, updateInstancedObjectsVisibility } from "../scene_resources/scene_setup.js";
import { createSlider, createButton, clearOverlay } from "../cg_libraries/cg_web.js";

export class CityScene extends Scene {
  /** @param {ResourceManager} resource_manager */
  constructor(resource_manager) {
    super();
    // WFC grid dimensions
    this.centralDims = [2, 2, 2];
    this.smallDims   = [1, 1, 1];
    this.showSmall   = false; // toggle small buildings

    // Core scene data
    this.resource_manager     = resource_manager;
    this.objects              = [];
    this.lights               = [];
    this.instancedObjects     = {};
    this.cameraPosition       = [0, 0, 0];
    this.lastCameraUpdateTime = 0;
    this.visibilityDistance   = 30;
    this.billboardLODDistances= { high:15, medium:25, low:35 };

    // Initialize
    this.initialize_scene();
    this.initialize_actor_actions();
  }

  /**
   * Set up scene with or without small buildings
   */
  async initialize_scene() {
    const smallDims = this.showSmall ? this.smallDims : [0, 0, 0];
    await setupCityScene(
      this.resource_manager,
      this,
      this.centralDims,
      smallDims
    );
    updateInstancedObjectsVisibility(this);
  }

  /**
   * Rebuild city after parameter changes
   */
  async reloadCityScene() {
    // Clear previous data
    this.objects = [];
    this.lights  = [];
    this.instancedObjects = {};

    // Re-run
    const smallDims = this.showSmall ? this.smallDims : [0, 0, 0];
    await setupCityScene(
      this.resource_manager,
      this,
      this.centralDims,
      smallDims
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
   * Build UI controls
   */
  initialize_ui_params() {
    clearOverlay();

    // Visibility distance slider
    createSlider(
      "Visibility Distance",
      [10, 50],
      (v) => {
        this.visibilityDistance = Number(v);
        updateInstancedObjectsVisibility(this);
      }
    );

    // Central block dimensions sliders
    createSlider("Central Width",  [1,20], (v)=>{ this.centralDims[0]=Number(v); this.reloadCityScene(); });
    createSlider("Central Depth",  [1,20], (v)=>{ this.centralDims[1]=Number(v); this.reloadCityScene(); });
    createSlider("Central Height", [1,10], (v)=>{ this.centralDims[2]=Number(v); this.reloadCityScene(); });

    // Toggle small buildings
    const toggleLabel = () => this.showSmall ? "Hide Small Buildings" : "Show Small Buildings";
    // Surrounding block dimensions sliders
    createSlider("Small Width",  [1,10], (v)=>{ this.smallDims[0]=Number(v); this.reloadCityScene(); });
    createSlider("Small Depth",  [1,10], (v)=>{ this.smallDims[1]=Number(v); this.reloadCityScene(); });
    createSlider("Small Height", [1,10], (v)=>{ this.smallDims[2]=Number(v); this.reloadCityScene(); });

    const btnBlock = createButton(toggleLabel(), () => {
      this.showSmall = !this.showSmall;
      btnBlock.querySelector('button').textContent = toggleLabel();
      this.reloadCityScene();
    });

    // Reload button
    createButton(
      "Reload City Scene",
      () => { this.reloadCityScene(); }
    );
  }
}
