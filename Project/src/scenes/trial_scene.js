
import { TurntableCamera } from "../scene_resources/camera.js"
import * as MATERIALS from "../render/materials.js"
import { makePlane } from "../cg_libraries/cg_mesh.js"
import { 
  createSlider, 
  createButtonWithHotkey, 
  createHotkeyAction 
} from "../cg_libraries/cg_web.js";
import { Scene } from "./scene.js";
import { ResourceManager } from "../scene_resources/resource_manager.js";
import { worley_material } from "../render/materials.js";
import { ProceduralTextureGenerator } from "../render/procedural_texture_generator.js";

export class TrialScene extends Scene {

  /**
   * A scene to be completed, used for the introductory tutorial
   * @param {ResourceManager} resourceManager 
   */
  constructor(regl, resourceManager){
    super();

    this.regl = regl;
    this.resourceManager = resourceManager;
    this.proceduralTextureGenerator = new ProceduralTextureGenerator(regl, resourceManager);
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
    
    this.resourceManager.addProceduralMesh("plane", makePlane());
    this.resourceManager.addProceduralMesh("plane2", makePlane());
    this.proceduralTextureGenerator.generate_worley_texture(
        "worley_texture",
        {
          viewer_position: [0, 0],
          viewer_scale: 1.0,
          width: 512,
          height: 512,
          u_time: 0 // Will update in update()
        }
      );
    worley_material.texture = "worley_texture";
    this.dynamic_objects.push({
        translation: [0, 0, 0],
        rotation: [0, 0, 0, 1],
        scale: [2, 2, 2],
        meshReference: "plane",
        material: worley_material,
      });

      this.proceduralTextureGenerator.generate_worley_texture(
        "worley_texture2",
        {
          viewer_position: [0, 0],
          viewer_scale: 1.0,
          width: 512,
          height: 512,
          u_time: 5 // Will update in update()
        }
      );
      this.dynamic_objects.push({
        translation: [5, 0, 0],
        rotation: [0, 0, 0, 1],
        scale: [2, 2, 2],
        meshReference: "plane2",
        material: worley_material,
      });
  
      this.objects = this.dynamic_objects;
  
  }

  update(dt, time) {
    // Regenerate the texture for animation
    this.proceduralTextureGenerator.generate_worley_texture(
      "worley_texture",
      {
        viewer_position: [0, 0],
        viewer_scale: 1.0,
        width: 512,
        height: 512,
        u_time: time
      }
    );
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
  initialize_ui_params() {
  }
  

}