import { TurntableCamera } from "../scene_resources/camera.js";
import * as MATERIALS from "../render/materials.js";
import { makePlane, makeSphereUV } from "../cg_libraries/cg_mesh.js";
import { quat } from "../../lib/gl-matrix_3.3.0/esm/index.js";
import {
  createSlider,
  createButtonWithHotkey,
  createHotkeyAction,
  createDropdown,
  createButton,
  clearOverlay
} from "../cg_libraries/cg_web.js";
import { Scene } from "./scene.js";
import { ResourceManager } from "../scene_resources/resource_manager.js";
import { worley_material } from "../render/materials.js";
import { zippy_material } from "../render/materials.js";
import { square_material } from "../render/materials.js";
import { ProceduralTextureGenerator } from "../render/procedural_texture_generator.js";
import { setupCityScene, updateInstancedObjectsVisibility, MODEL_MATERIAL_MAP } from "../scene_resources/scene_setup.js";


export class TrialScene extends Scene {
  /**
   * A scene to be completed, used for the introductory tutorial
   * @param {ResourceManager} resourceManager
   */
  constructor(regl, resourceManager) {
    super();

    this.regl = regl;
    this.resourceManager = resourceManager;
    this.proceduralTextureGenerator = new ProceduralTextureGenerator(
      regl,
      resourceManager
    );

    // WFC grid dims
    this.centralDims = [2, 2, 2];
    this.smallDims   = [1, 1, 1];
    this.showSmall   = false;

    // Core managers
    this.static_objects  = [];
    this.dynamic_objects = [];

    // Scene data
    this.objects          = [];
    this.lights           = [];
    this.instancedObjects = {};
    this.cameraPosition   = [0,0,0];
    this.lastCameraUpdateTime = 0;
    this.visibilityDistance   = 30;


    this.initialize_scene();
    this.initialize_actor_actions();
  }

  /**
   * Scene setup
   */
  async initialize_scene() {
    this.lights.push({
      position: [0.0, -2.0, 2.5],
      color: [0.5, 1.0, 0.9],
    });

    this.resourceManager.addProceduralMesh("mesh_sphere_env_map", makeSphereUV(16));
    this.static_objects.push({
      translation: [0,0,0], scale:[100,100,100], rotation:[0,0,0,1],
      meshReference: "mesh_sphere_env_map", material: MATERIALS.sunset_sky
    });

    this.addWaterPlane();

    this.proceduralTextureGenerator.generate_worley_texture("worley_texture", {
      viewer_position: [0, 0],
      viewer_scale: 1.0,
      width: 512,
      height: 512,
      u_time: 0, // Will update in update()
      apply_bloom: true
    });
    worley_material.texture = "worley_texture";

    this.proceduralTextureGenerator.generate_zippy_texture("zippy_texture", {
      viewer_position: [0, 0],
      viewer_scale: 1.0,
      width: 512,
      height: 512,
      u_time: 0, // Will update in update()
      apply_bloom: true
    });
    zippy_material.texture = "zippy_texture";
    this.proceduralTextureGenerator.generate_square_texture("square_texture", {
      viewer_position: [0, 0],
      viewer_scale: 1.0,
      width: 512,
      height: 512,
      u_time: 0, // Will update in update()
      apply_bloom: true
    });
    square_material.texture = "square_texture";

    // Now add WFC-generated city blocks
    const smallDims = this.showSmall ? this.smallDims : [0,0,0];
    await setupCityScene(this.resourceManager, this, this.centralDims, smallDims);
    updateInstancedObjectsVisibility(this);

    this.objects = this.static_objects.concat(this.dynamic_objects, this.objects);
  }

  updateSceneState(dt, time) {
    // Regenerate the texture for animation
    this.proceduralTextureGenerator.generate_worley_texture("worley_texture", {
      viewer_position: [0, 0],
      viewer_scale: 1.0,
      width: 512,
      height: 512,
      u_time: time,
      apply_bloom: true
    });
    this.proceduralTextureGenerator.generate_zippy_texture("zippy_texture", {
      viewer_position: [0, 0],
      viewer_scale: 1.0,
      width: 512,
      height: 512,
      u_time: time, // Will update in update()
      apply_bloom: true
    });
    this.proceduralTextureGenerator.generate_square_texture("square_texture", {
      viewer_position: [0, 0],
      viewer_scale: 1.0,
      width: 512,
      height: 512,
      u_time: time, // Will update in update()
      apply_bloom: true
    });
  }

  addWaterPlane() {
    let rotQ = quat.create();
    quat.fromEuler(rotQ, 90, 0, 0);
  
    this.dynamic_objects.push({
      translation: [0, 0, -2],
      scale: [100, 1, 100],
      rotation: rotQ,
      meshReference: "plane.obj",
      material: MATERIALS.mirror
    });
  }
  

  async reloadScene() {
    // Clear all
    this.objects = [];
    this.lights  = [];
    this.instancedObjects = {};
    this.static_objects  = [];
    this.dynamic_objects = [];

    // Re-init
    this.addWaterPlane();
    await this.initialize_scene();
  }

  async reloadCityScene() {
    // Clear previous data
    this.objects = [];
    this.lights  = [];
    this.instancedObjects = {};

    this.static_objects  = [];
    this.dynamic_objects = [];

    // Re-run
    this.addWaterPlane();
    const smallDims = this.showSmall ? this.smallDims : [0, 0, 0];
    await setupCityScene(
      this.resourceManager,
      this,
      this.centralDims,
      smallDims
    );
    updateInstancedObjectsVisibility(this);
  }
  /**
   * Initialize the evolve function that describes the behaviour of each actor
   */
  initialize_actor_actions() {}

  /**
   * Initialize custom scene-specific UI parameters to allow interactive control of selected scene elements.
   * This function is called in main() if the scene is active.
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

    createDropdown(
      "Assign Texture For City Block 1",
      ["Default","Worley", "Square", "Zippy"],
      (v) => {
        switch(v) {
          case "Default":
            MODEL_MATERIAL_MAP["city_block1.obj"];
            break;
          case "Worley":
            MODEL_MATERIAL_MAP["city_block1.obj"] = worley_material;
            break;
          case "Zippy":
            MODEL_MATERIAL_MAP["city_block1.obj"] = zippy_material;
            break;
          case "Square":
            MODEL_MATERIAL_MAP["city_block1.obj"] = square_material;
            break;
        }
        this.reloadScene(); // Optional: To apply the change immediately
      }
    );

    createDropdown(
      "Assign Texture For City Block 2",
      ["Default","Worley", "Square", "Zippy"],
      (v) => {
        switch(v) {
          case "Default":
            MODEL_MATERIAL_MAP["city_block2.obj"];
            break;
          case "Worley":
            MODEL_MATERIAL_MAP["city_block2.obj"] = worley_material;
            break;
          case "Zippy":
            MODEL_MATERIAL_MAP["city_block2.obj"] = zippy_material;
            break;
          case "Square":
            MODEL_MATERIAL_MAP["city_block2.obj"] = square_material;
            break;
        }
        this.reloadScene(); // Optional: To apply the change immediately
      }
    );

    createDropdown(
      "Assign Texture For City Block 3",
      ["Default", "Worley", "Square", "Zippy"],
      (v) => {
        switch(v) {
          case "Default":
            MODEL_MATERIAL_MAP["city_block3.obj"];
            break;
          case "Worley":
            MODEL_MATERIAL_MAP["city_block3.obj"] = worley_material;
            break;
          case "Zippy":
            MODEL_MATERIAL_MAP["city_block3.obj"] = zippy_material;
            break;
          case "Square":
            MODEL_MATERIAL_MAP["city_block3.obj"] = square_material;
            break;
        }
        this.reloadScene(); // Optional: To apply the change immediately
      }
    );

    createDropdown(
      "Assign Texture For City Block 4",
      ["Default","Worley", "Square", "Zippy"],
      (v) => {
        switch(v) {
          case "Default":
            MODEL_MATERIAL_MAP["city_block4.obj"];
            break;
          case "Worley":
            MODEL_MATERIAL_MAP["city_block4.obj"] = worley_material;
            break;
          case "Zippy":
            MODEL_MATERIAL_MAP["city_block4.obj"] = zippy_material;
            break;
          case "Square":
            MODEL_MATERIAL_MAP["city_block4.obj"] = square_material;
            break;
        }
        this.reloadScene(); // Optional: To apply the change immediately
      }
    );

  }
}
