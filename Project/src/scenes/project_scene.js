import * as MATERIALS from "../render/materials.js";
import { Scene } from "./scene.js";
import { makeSphereUV } from "../cg_libraries/cg_mesh.js";
import { ResourceManager } from "../scene_resources/resource_manager.js";
import { quat } from "../../lib/gl-matrix_3.3.0/esm/index.js";
import { createDropdown, createSlider, createButton, clearOverlay } from "../cg_libraries/cg_web.js";
import { setupCityScene, updateInstancedObjectsVisibility } from "../scene_resources/scene_setup.js";

export class ProjectScene extends Scene {
  /** @param {ResourceManager} resourceManager */ 
  constructor(resourceManager) {
    super();
    // WFC grid dims
    this.centralDims = [2, 2, 2];
    this.smallDims   = [1, 1, 1];
    this.showSmall   = false;

    // Core managers
    this.resourceManager = resourceManager;
    this.static_objects  = [];
    this.dynamic_objects = [];

    // Scene data
    this.objects          = [];
    this.lights           = [];
    this.instancedObjects = {};
    this.cameraPosition   = [0,0,0];
    this.lastCameraUpdateTime = 0;
    this.visibilityDistance   = 30;

    // Initialize
    this.initialize_scene();
    this.initialize_actor_actions();
    this.UIParams.renderTexture = null;
    this.UIParams.maxDistance = 15;
    this.UIParams.thickness = 0.1;
    this.UIParams.resolution = 0.65;
    this.UIParams.steps = 8;
  }

  /**
   * Set up both static demo objects and WFC-based city
   */
  async initialize_scene() {
    // Add static sky and demo meshes
    this.lights.push({ position: [0,3,5], color: [1,0.8,0.7] });
    this.resourceManager.addProceduralMesh("mesh_sphere_env_map", makeSphereUV(16));
    this.static_objects.push({
      translation: [0,0,0], scale:[100,100,100], rotation:[0,0,0,1],
      meshReference: "mesh_sphere_env_map", material: MATERIALS.sunset_sky
    });

    // Donut + plane
    let rotQ = quat.create(); quat.fromEuler(rotQ,90,0,0);
    this.dynamic_objects.push(
      { translation:[0,2,2], scale:[1,1,1], rotation:rotQ, meshReference:"donut.obj", material:MATERIALS.BasicColors.gray },
      { translation:[0,0,3.5], scale:[100,1,100], rotation:rotQ, meshReference:"plane.obj", material:MATERIALS.mirror },
      { translation:[0,0,5], scale:[0.0006,0.0006,0.0006], rotation:rotQ, meshReference:"khalifa.obj", material:MATERIALS.mirror }
    );

    const pine_positions = [
      [-3, 4, 0.3],
      [3, 5, 0.3],
      [0, 7, 0.3],
    ];
    const pine_materials = [
      MATERIALS.BasicColors.red,
      MATERIALS.BasicColors.blue,
      MATERIALS.pine,
    ];

    for (let i = 0; i < pine_positions.length; i++) {
      this.dynamic_objects.push({
        translation: pine_positions[i],
        scale: [0.8, 0.8, 0.8],
        rotation: [0, 0, 0, 1],
        meshReference: "pine.obj",
        material: pine_materials[i],
      });
    }

    // Merge static/dynamic
    this.objects = this.static_objects.concat(this.dynamic_objects);

    // Now add WFC-generated city blocks
    const smallDims = this.showSmall ? this.smallDims : [0,0,0];
    await setupCityScene(this.resourceManager, this, this.centralDims, smallDims);
    updateInstancedObjectsVisibility(this);
    // Preserve static and dynamic demo objects
    this.objects = this.static_objects.concat(this.dynamic_objects, this.objects);
  }

  /**
   * Rebuild scene when params change
   */
  async reloadScene() {
    // Clear all
    this.objects = [];
    this.lights  = [];
    this.instancedObjects = {};
    this.static_objects  = [];
    this.dynamic_objects = [];

    // Re-init
    await this.initialize_scene();
  }

  /**
   * Rebuild city after parameter changes
   */
  async reloadCityScene() {
    // Clear previous data
    this.objects = [];
    this.lights  = [];
    this.instancedObjects = {};

    this.static_objects  = [];
    this.dynamic_objects = [];

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
   * Frame update: culling
   */
  update(dt,camera) {
    if(camera?.position) {
      this.cameraPosition = camera.position;
      const now = performance.now();
      if(now - this.lastCameraUpdateTime > 100) {
        updateInstancedObjectsVisibility(this);
        // Preserve static and dynamic demo objects
        this.objects = this.static_objects.concat(this.dynamic_objects, this.objects);
        this.lastCameraUpdateTime = now;
      }
    }
  }

  initialize_actor_actions() {}

  /**
   * Build UI: combines WFC toggles and existing dropdown
   */
  initializeUIParams() {
    clearOverlay();
    // Dropdown for render texture
    createDropdown(
      "Render Texture",
      ["default","position","normals","base","reflectionUV","reflectionColor","reflectionBlur","reflections","shadows"],
      v=>{ this.UIParams.renderTexture = v; }
    );
    // WFC controls
    createSlider("Central Width",  [1,20], v=>{ this.centralDims[0]=Number(v); this.reloadScene(); });
    createSlider("Central Depth",  [1,20], v=>{ this.centralDims[1]=Number(v); this.reloadScene(); });
    createSlider("Central Height", [1,10], v=>{ this.centralDims[2]=Number(v); this.reloadScene(); });
    const toggleLabel = () => this.showSmall?"Hide Small":"Show Small";
    const btn = createButton(toggleLabel(), ()=>{ this.showSmall=!this.showSmall; btn.querySelector('button').textContent=toggleLabel(); this.reloadScene(); });
    createSlider("Small Width",    [1,10], v=>{ this.smallDims[0]=Number(v); this.reloadScene(); });
    createSlider("Small Depth",    [1,10], v=>{ this.smallDims[1]=Number(v); this.reloadScene(); });
    createSlider("Small Height",   [1,10], v=>{ this.smallDims[2]=Number(v); this.reloadScene(); });

    // Reload button
    createButton(
      "Reload City Scene",
      () => { this.reloadCityScene(); }
    );
    createSlider(
      "SSR Ray Marching Max Distance",
      [0, 25],
      (value) => {
        this.UIParams.maxDistance = parseFloat(value);
      },
      this.UIParams.maxDistance
    );
    createSlider(
      "SSR Thickness Threshold",
      [0, 0.5],
      (value) => {
        this.UIParams.thickness = parseFloat(value);
      },
      this.UIParams.thickness,
      0.01
    );
    createSlider(
      "SSR Resolution",
      [0, 1],
      (value) => {
        this.UIParams.resolution = parseFloat(value);
      },
      this.UIParams.resolution,
      0.01
    );
    createSlider(
      "SSR Steps",
      [0, 32],
      (value) => {
        this.UIParams.steps = parseInt(value);
      },
      this.UIParams.steps
    );
  }
}