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
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export class CityScene extends Scene {
  /** @param {ResourceManager} resource_manager */
  constructor(resource_manager) {
    super();
    this.resource_manager = resource_manager;
    this.objects = [];
    this.lights = [];
    this.instancedObjects = {};
    this.cameraPosition = [0, 0, 0];
    this.lastCameraUpdateTime = 0;
    this.visibilityDistance = 30;
    this.billboardLODDistances = { high: 15, medium: 25, low: 35 };

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
      priority: 10
    });

    // Prepare plane mesh for billboards
    this.resource_manager.addProceduralMesh("plane", makePlane());

    // Dimensions for central and small buildings
    const centralDims = [10, 4, 5];  // width, depth, height
    const smallDims   = [3,  3, 3];  // width, depth, height
    const [cw, cd, ch] = centralDims;
    const [sw, sd, sh] = smallDims;

    // Offsets to center the central building at origin
    const centralOffset = [-cw/2, -cd/2, 0];

    // Run WFC for central and small building patterns
    const centralGrid = await runWFC(cw, cd, ch);
    const smallGrid   = await runWFC(sw, sd, sh);

    // Prepare instancing collections
    const buildingInstances  = {};
    const billboardInstances = {};

    // Bounding box
    const box = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity };

    // Helper for adding tiles
    // Helper for adding tiles
    const addTile = (tile, offsetX, offsetY) => {
      const [tx, ty, tz] = tile.coords;
      const wx = offsetX + tx;
      const wy = offsetY + ty;
      const wz = tz;
      // update bounding box
      box.minX = Math.min(box.minX, wx);
      box.maxX = Math.max(box.maxX, wx);
      box.minY = Math.min(box.minY, wy);
      box.maxY = Math.max(box.maxY, wy);
      box.minZ = Math.min(box.minZ, wz);
      box.maxZ = Math.max(box.maxZ, wz);
      // group building
      const key = tile.model;
      buildingInstances[key] = buildingInstances[key] || [];
      buildingInstances[key].push({
        translation: [wx, wy, wz],
        rotation:    tile.rotation,
        scale:       [1, 1, 1],
        originalPos: [wx, wy, wz]
      });
      // billboards using WFC exposedFaces keys (+X, -X, +Y, -Y)
      const dirs = {
        '+X': { dx: 1, dy: 0, yaw: -Math.PI/2 },
        '-X': { dx: -1, dy: 0, yaw: Math.PI/2 },
        '+Y': { dx: 0, dy: 1, yaw: 0 },
        '-Y': { dx: 0, dy: -1, yaw: Math.PI }
      };
      const tiltQuat = quatFromAxisAngle([1,0,0], -Math.PI/2);
      for (const [face, open] of Object.entries(tile.exposedFaces || {})) {
        const d = dirs[face];
        if (!open || !d) continue;
        const { dx, dy, yaw } = d;
        const rot = multiplyQuat(quatFromAxisAngle([0,1,0], yaw), tiltQuat);
        const bbKey = `billboard_${face}`;
        billboardInstances[bbKey] = billboardInstances[bbKey] || [];
        billboardInstances[bbKey].push({
          translation: [wx + dx*0.5, wy + dy*0.5, wz],
          rotation: rot,
          scale: [1,1,1],
          originalPos: [wx + dx*0.5, wy + dy*0.5, wz]
        });
      }
    };

    // Populate central building
    for (let x = 0; x < cw; x++) {
      for (let y = 0; y < cd; y++) {
        for (let z = 0; z < ch; z++) {
          const tile = centralGrid[x][y][z];
          if (!tile) continue;
          // annotate coords on tile for convenience
          tile.coords = [centralOffset[0]+x, centralOffset[1]+y, z];
          addTile(tile, centralOffset[0], centralOffset[1]);
        }
      }
    }

    // Surrounding small buildings in a ring
    const ring = 2;
    const gap = 2;
    const offsetXDist = cw/2 + gap + sw/2;
    const offsetYDist = cd/2 + gap + sd/2;
    const smallLocalOffset = [-sw/2, -sd/2];
    for (let i = -ring; i <= ring; i++) {
      for (let j = -ring; j <= ring; j++) {
        if (i===0 && j===0) continue;
        const bx = i*offsetXDist;
        const by = j*offsetYDist;
        for (let x = 0; x < sw; x++) {
          for (let y = 0; y < sd; y++) {
            for (let z = 0; z < sh; z++) {
              const tile = smallGrid[x][y][z];
              if (!tile) continue;
              const wx = bx + smallLocalOffset[0] + x;
              const wy = by + smallLocalOffset[1] + y;
              // annotate coords
              tile.coords = [wx, wy, z];
              addTile(tile, bx + smallLocalOffset[0], by + smallLocalOffset[1]);
            }
          }
        }
      }
    }

    // Register all instanced building meshes
    for (const [meshRef, instances] of Object.entries(buildingInstances)) {
      this.instancedObjects[meshRef] = {
        meshReference: meshRef,
        material: MATERIALS.futuristic_concrete,
        instances,
        type: 'building', priority: 20
      };
    }

    // Register billboards
    for (const [key, instances] of Object.entries(billboardInstances)) {
      this.instancedObjects[key] = {
        meshReference: 'plane',
        material: MATERIALS.pine,
        instances, type: 'billboard', priority: 30
      };
    }

    // Initial visibility cull
    this.updateInstancedObjectsVisibility();

    // Lighting
    const lightDist = 6;
    const cx = (box.minX + box.maxX)/2;
    const cy = (box.minY + box.maxY)/2;
    const topZ = box.maxZ;
    const midZ = (box.minZ + box.maxZ)/2;
    const bottomZ = box.minZ;
    const lightPositions = [
      [cx, cy, topZ+lightDist], // top
      [box.maxX+lightDist, cy, midZ],
      [box.minX-lightDist, cy, midZ],
      [cx, box.maxY+lightDist, midZ],
      [cx, box.minY-lightDist, midZ],
      [cx, cy, bottomZ-lightDist*0.5]  // bottom
    ];
    this.lights = lightPositions.map(pos => ({ position: pos, color: [0.8,0.8,0.9] }));

    // Scene bounding box
    this.sceneBoundingBox = box;
  }

  updateInstancedObjectsVisibility() {
    // keep sky dome
    this.objects = this.objects.filter(o=>o.meshReference==='mesh_sphere_env_map');
    for (const { meshReference, material, instances, type, priority } of Object.values(this.instancedObjects)) {
      instances.forEach(inst => {
        const dist = distance3D(inst.originalPos, this.cameraPosition);
        if (dist <= this.visibilityDistance) {
          this.objects.push({
            translation: inst.translation,
            rotation: inst.rotation,
            scale: inst.scale,
            meshReference, material, priority
          });
        }
      });
    }
    this.objects.sort((a,b)=>(a.priority||0)-(b.priority||0));
  }

  update(dt, camera) {
    if (camera?.position) {
      this.cameraPosition = camera.position;
      const now = performance.now();
      if (now - this.lastCameraUpdateTime > 100) {
        this.updateInstancedObjectsVisibility();
        this.lastCameraUpdateTime = now;
      }
    }
  }

  initialize_actor_actions() {}

  initialize_ui_params() {
    return { visibilityDistance: { value: this.visibilityDistance, min:10, max:50, step:1,
      onChange: v => { this.visibilityDistance=v; this.updateInstancedObjectsVisibility(); } } };
  }
}
