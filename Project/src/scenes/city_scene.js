import { TurntableCamera } from "../scene_resources/camera.js";
import * as MATERIALS from "../render/materials.js";
import { makePlane, makeSphereUV } from "../cg_libraries/cg_mesh.js";
import { runWFC, quatFromAxisAngle } from '../scene_resources/wfc_solver.js';
import { Scene } from "./scene.js";
import { ResourceManager } from "../scene_resources/resource_manager.js";

// Quaternion multiplication helper
function multiplyQuat(a, b) {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz
  ];
}

// Calculate distance between two 3D points
function distance3D(a, b) {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) + 
    Math.pow(a[1] - b[1], 2) + 
    Math.pow(a[2] - b[2], 2)
  );
}

export class CityScene extends Scene {
  /**
   * @param {ResourceManager} resource_manager
   */
  constructor(resource_manager) {
    super();
    this.resource_manager = resource_manager;
    this.objects = [];
    this.lights = [];
    this.instancedObjects = {
      // Track instanced objects by mesh type
      // Each entry will contain: {meshReference, material, instances: [{translation, rotation, scale}]}
    };
    this.cameraPosition = [0, 0, 0];
    this.lastCameraUpdateTime = 0;
    this.frustumPlanes = [];
    this.visibilityDistance = 30; // Max distance to render objects
    this.billboardLODDistances = {
      high: 15,   // Full quality up to this distance
      medium: 25, // Medium quality up to this distance
      low: 35     // Low quality beyond medium distance
    };
    
    this.initialize_scene();
    this.initialize_actor_actions();
  }
  
  async initialize_scene() {
    const identityRot = [0, 0, 0, 1];
    
    // Sky dome
    this.resource_manager.addProceduralMesh(
      "mesh_sphere_env_map",
      makeSphereUV(16)
    );
    this.objects.push({
      translation: [0, 0, 0],
      scale: [80, 80, 80],
      rotation: identityRot,
      meshReference: 'mesh_sphere_env_map',
      material: MATERIALS.sunset_sky,
      priority: 10 // Lowest render priority (render first, at back)
    });
    
    // Prepare plane mesh for billboards
    this.resource_manager.addProceduralMesh("plane", makePlane());
    
    // Single building parameters
    const offset = [0, 0, 0];
    const dims = [10, 3, 5]; // width, depth, height
    const [sizeX, sizeY, sizeZ] = dims;
    
    // Run WFC and get solved grid
    const grid = await runWFC(sizeX, sizeY, sizeZ);
    
    // Track bounding box
    const box = {
      minX: Infinity, maxX: -Infinity,
      minY: Infinity, maxY: -Infinity,
      minZ: Infinity, maxZ: -Infinity
    };
    
    // Material for billboards
    const billboardMat = MATERIALS.pine;
    
    // Prepare instancing collections
    const buildingInstances = {};
    const billboardInstances = {};
    
    // Iterate grid and prepare instanced objects
    for (let x = 0; x < sizeX; x++) {
      for (let y = 0; y < sizeY; y++) {
        for (let z = 0; z < sizeZ; z++) {
          const tile = grid[x][y][z];
          if (!tile) continue;
          const wx = offset[0] + x;
          const wy = offset[1] + y;
          const wz = offset[2] + z;
          
          // Update bounding box
          box.minX = Math.min(box.minX, wx);
          box.maxX = Math.max(box.maxX, wx);
          box.minY = Math.min(box.minY, wy);
          box.maxY = Math.max(box.maxY, wy);
          box.minZ = Math.min(box.minZ, wz);
          box.maxZ = Math.max(box.maxZ, wz);
          
          // Group buildings by mesh reference for instancing
          const key = tile.model;
          if (!buildingInstances[key]) {
            buildingInstances[key] = [];
          }
          
          // Add building instance data
          buildingInstances[key].push({
            translation: [wx, wy, wz],
            rotation: tile.rotation,
            scale: [1, 1, 1],
            originalPos: [wx, wy, wz] // Store original position for distance checks
          });
          
          // Face directions (dx, dy) with yaw rotation (around Y)
          const sideMap = {
            front: { dx: 0,  dy:  1, yaw:   0 },
            right: { dx: 1,  dy:  0, yaw: -Math.PI/2 },
            back:  { dx: 0,  dy: -1, yaw:   Math.PI },
            left:  { dx:-1,  dy:  0, yaw:  Math.PI/2 }
          };
          
          const tiltQuat = quatFromAxisAngle([1,0,0], -Math.PI/2);
          
          // Handle billboards - group them for instancing
          Object.entries(tile.exposedFaces || {}).forEach(([side, isOpen]) => {
            if (!isOpen) return; // only outside faces
            
            const { dx, dy, yaw } = sideMap[side];
            const rot = multiplyQuat(
              quatFromAxisAngle([0,1,0], yaw),
              tiltQuat
            );
            
            // Group billboards by side for instancing
            const billboardKey = `billboard_${side}`;
            if (!billboardInstances[billboardKey]) {
              billboardInstances[billboardKey] = [];
            }
            
            // Add billboard instance data
            billboardInstances[billboardKey].push({
              translation: [wx + dx*0.5, wy + dy*0.5, wz],
              rotation: rot,
              scale: [1, 1, 1],
              originalPos: [wx + dx*0.5, wy + dy*0.5, wz], // Store original position for LOD
              faceType: side
            });
          });
        }
      }
    }
    
    // Add instanced building objects
    for (const [meshRef, instances] of Object.entries(buildingInstances)) {
      this.instancedObjects[meshRef] = {
        meshReference: meshRef,
        material: MATERIALS.futuristic_concrete,
        instances: instances,
        type: 'building',
        priority: 20 // Medium render priority
      };
    }
    
    // Add instanced billboard objects
    for (const [billboardKey, instances] of Object.entries(billboardInstances)) {
      this.instancedObjects[billboardKey] = {
        meshReference: 'plane',
        material: billboardMat,
        instances: instances,
        type: 'billboard',
        priority: 30 // Higher render priority (render last, in front)
      };
    }
    
    // Generate buildings and billboards for initial render
    this.updateInstancedObjectsVisibility();
    
    // Lights setup - reduce number of lights
    const lightDist = 6;
    const cx = (box.minX + box.maxX) / 2;
    const cy = (box.minY + box.maxY) / 2;
    const topZ = box.maxZ;
    const midZ = (box.minZ + box.maxZ) / 2;
    const bottomZ = box.minZ;
    
    // Use fewer lights for better performance
    const lightPositions = [
      [cx, cy, topZ + lightDist], // Top light
      [box.maxX + lightDist, cy, midZ], // Right light
      [box.minX - lightDist, cy, midZ], // Left light
      [cx, box.maxY + lightDist, midZ], // Front light
      [cx, box.minY - lightDist, midZ], // Back light
      [cx, cy, bottomZ - lightDist * 0.5] // Bottom light
    ];
    
    lightPositions.forEach(pos =>
      this.lights.push({ position: pos, color: [0.8, 0.8, 0.9] })
    );
    
    console.log(
      "Single building loaded.",
      "Instanced objects:", Object.keys(this.instancedObjects).length,
      "Lights:", this.lights.length
    );
    
    // Create a bounding box for the entire scene
    this.sceneBoundingBox = box;
  }
  
  // Update which objects are visible based on camera position and frustum
  updateInstancedObjectsVisibility() {
    // Clear current objects array
    this.objects = this.objects.filter(obj => obj.meshReference === 'mesh_sphere_env_map');
    
    // Process each instanced object type
    for (const [key, group] of Object.entries(this.instancedObjects)) {
      const { meshReference, material, instances, type, priority } = group;
      
      // Filter instances based on visibility and LOD
      const visibleInstances = instances.filter(instance => {
        const dist = distance3D(instance.originalPos, this.cameraPosition);
        return dist <= this.visibilityDistance;
      });
      
      // Apply LOD for billboards
      if (type === 'billboard') {
        // Create high, medium, and low LOD groups based on distance
        const highLOD = [];
        const mediumLOD = [];
        const lowLOD = [];
        
        visibleInstances.forEach(instance => {
          const dist = distance3D(instance.originalPos, this.cameraPosition);
          
          if (dist <= this.billboardLODDistances.high) {
            highLOD.push(instance);
          } else if (dist <= this.billboardLODDistances.medium) {
            // Only add every other billboard for medium LOD
            if (Math.random() > 0.5) {
              const scaledInstance = {...instance};
              scaledInstance.scale = [0.9, 0.9, 0.9]; // Slightly smaller
              mediumLOD.push(scaledInstance);
            }
          } else {
            // Only add every third billboard for low LOD
            if (Math.random() > 0.7) {
              const scaledInstance = {...instance};
              scaledInstance.scale = [0.8, 0.8, 0.8]; // Even smaller
              lowLOD.push(scaledInstance);
            }
          }
        });
        
        // Add high LOD billboards
        highLOD.forEach(instance => {
          this.objects.push({
            translation: instance.translation,
            rotation: instance.rotation,
            scale: instance.scale,
            meshReference,
            material,
            priority
          });
        });
        
        // Add medium LOD billboards
        if (mediumLOD.length > 0) {
          mediumLOD.forEach(instance => {
            this.objects.push({
              translation: instance.translation,
              rotation: instance.rotation,
              scale: instance.scale,
              meshReference,
              material,
              priority
            });
          });
        }
        
        // Add low LOD billboards
        if (lowLOD.length > 0) {
          lowLOD.forEach(instance => {
            this.objects.push({
              translation: instance.translation,
              rotation: instance.rotation,
              scale: instance.scale,
              meshReference,
              material,
              priority
            });
          });
        }
      } else {
        // For buildings, just add all visible instances
        visibleInstances.forEach(instance => {
          this.objects.push({
            translation: instance.translation,
            rotation: instance.rotation,
            scale: instance.scale,
            meshReference,
            material,
            priority
          });
        });
      }
    }
    
    // Sort objects by priority for optimal rendering
    this.objects.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }
  
  update(dt, camera) {
    // Update camera position if available
    if (camera && camera.position) {
      this.cameraPosition = camera.position;
      
      // Only update visibility every 100ms for performance
      const now = performance.now();
      if (now - this.lastCameraUpdateTime > 100) {
        this.updateInstancedObjectsVisibility();
        this.lastCameraUpdateTime = now;
      }
    }
  }
  
  initialize_actor_actions() {
    // Setup any scene-specific actions here
  }
  
  initialize_ui_params() {
    // Setup any UI parameters here
    return {
      visibilityDistance: {
        value: this.visibilityDistance,
        min: 10,
        max: 50,
        step: 1,
        onChange: (value) => {
          this.visibilityDistance = value;
          this.updateInstancedObjectsVisibility();
        }
      },
      highLODDistance: {
        value: this.billboardLODDistances.high,
        min: 5,
        max: 20,
        step: 1,
        onChange: (value) => {
          this.billboardLODDistances.high = value;
          this.updateInstancedObjectsVisibility();
        }
      },
      mediumLODDistance: {
        value: this.billboardLODDistances.medium,
        min: 15,
        max: 30,
        step: 1,
        onChange: (value) => {
          this.billboardLODDistances.medium = value;
          this.updateInstancedObjectsVisibility();
        }
      }
    };
  }
}