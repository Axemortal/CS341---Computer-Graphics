
import { TurntableCamera } from "../scene_resources/camera.js"
import * as MATERIALS from "../render/materials.js"
import { makeSphereUV } from "../cg_libraries/cg_mesh.js"
import { runWFC } from '../scene_resources/wfc_solver.js';
import { Scene } from "./scene.js";
import { ResourceManager } from "../scene_resources/resource_manager.js";

export class CityScene extends Scene {

  /**
   * A scene to be completed, used for the introductory tutorial
   * @param {ResourceManager} resource_manager 
   */
  constructor(resource_manager){
    super();
    
    this.resource_manager = resource_manager;

    this.initialize_scene();
    this.initialize_actor_actions();
  }

  /**
   * Scene setup
   */
  async initialize_scene(){
    const identityRot = [0, 0, 0, 1];

    // add sky dome
    this.resource_manager.addProceduralMesh("mesh_sphere_env_map", makeSphereUV(16));
    this.objects.push({
      translation: [0, 0, 0],
      scale: [80,80,80],
      rotation: identityRot,
      meshReference: 'mesh_sphere_env_map',
      material: MATERIALS.sunset_sky
    });

    // Single building parameters
    const offset = [0, 0, 0];
    const dims = [10, 7, 9]; // width, depth, height

    // Run WFC for one building
    const [sizeX, sizeY, sizeZ] = dims;
      const grid = await runWFC(sizeX, sizeY, sizeZ);

    // Track bounding box
    const box = {
      minX: Infinity, maxX: -Infinity,
      minY: Infinity, maxY: -Infinity,
      minZ: Infinity, maxZ: -Infinity
    };

    // Place tiles and update bounds
    grid.forEach((col, x) => {
      col.forEach((row, y) => {
        row.forEach((tile, z) => {
          if (!tile) return;
          const wx = offset[0] + x;
          const wy = offset[1] + y;
          const wz = offset[2] + z;
    
          box.minX = Math.min(box.minX, wx);
          box.maxX = Math.max(box.maxX, wx);
          box.minY = Math.min(box.minY, wy);
          box.maxY = Math.max(box.maxY, wy);
          box.minZ = Math.min(box.minZ, wz);
          box.maxZ = Math.max(box.maxZ, wz);
    
          this.objects.push({
            translation: [wx, wy, wz],
            scale: [1, 1, 1],
            meshReference: tile.model,
            rotation: tile.rotation, // <-- Use rotation from WFC variant
            material: MATERIALS.futuristic_concrete
          });
        });
      });
    });    

    // Add lights around this single building
    const lightDist = 6; // Increased from 4 for wider light spread
    const cx = (box.minX + box.maxX) / 2;
    const cy = (box.minY + box.maxY) / 2;
    const topZ = box.maxZ;
    const midZ = (box.minZ + box.maxZ) / 2;
    const bottomZ = box.minZ;

    // Existing lights with adjusted intensity
    this.lights.push({ position: [cx, cy, topZ + lightDist], color: [0.9, 0.9, 0.9] }); // Brighter roof light

    // Side lights with increased brightness
    this.lights.push({ position: [box.maxX + lightDist, cy, midZ], color: [0.9, 0.9, 0.9] });
    this.lights.push({ position: [box.minX - lightDist, cy, midZ], color: [0.9, 0.9, 0.9] });
    this.lights.push({ position: [cx, box.maxY + lightDist, midZ], color: [0.9, 0.9, 0.9] });
    this.lights.push({ position: [cx, box.minY - lightDist, midZ], color: [0.9, 0.9, 0.9] });

    // Add corner lights at mid-height for better coverage
    this.lights.push({ position: [box.maxX + lightDist*0.7, box.maxY + lightDist*0.7, midZ], color: [0.7, 0.7, 0.8] });
    this.lights.push({ position: [box.maxX + lightDist*0.7, box.minY - lightDist*0.7, midZ], color: [0.7, 0.7, 0.8] });
    this.lights.push({ position: [box.minX - lightDist*0.7, box.maxY + lightDist*0.7, midZ], color: [0.7, 0.7, 0.8] });
    this.lights.push({ position: [box.minX - lightDist*0.7, box.minY - lightDist*0.7, midZ], color: [0.7, 0.7, 0.8] });

    // Add lower lights to illuminate the base
    this.lights.push({ position: [cx, cy, bottomZ - lightDist*0.5], color: [0.6, 0.6, 0.7] });

    // Add accent lights with slight color tint for visual interest
    this.lights.push({ position: [box.maxX + lightDist*0.5, cy, topZ - 2], color: [0.7, 0.7, 0.9] }); // Slight blue tint
    this.lights.push({ position: [box.minX - lightDist*0.5, cy, topZ - 2], color: [0.7, 0.7, 0.9] });

    console.log("Single building loaded.");
    console.log("Objects:", this.objects.length, "Lights:", this.lights.length);
  }

  initialize_actor_actions() { }
  initialize_ui_params() { }
}