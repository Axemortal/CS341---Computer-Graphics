// scene_setup.js
import * as MATERIALS from "../render/materials.js";
import { makePlane, makeSphereUV } from "../cg_libraries/cg_mesh.js";
import { runWFC, quatFromAxisAngle } from "../scene_resources/wfc_solver.js";

/**
 * Quaternion multiplication helper
 */
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

/**
 * 3D distance helper
 */
function distance3D(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/**
 * Add sky dome to the scene
 */
function addSkyDome(resource_manager, scene) {
  const identityRot = [0, 0, 0, 1];
  resource_manager.addProceduralMesh("mesh_sphere_env_map", makeSphereUV(16));
  scene.objects.push({
    translation:   [0, 0, 0],
    scale:         [80, 80, 80],
    rotation:      identityRot,
    meshReference: "mesh_sphere_env_map",
    material:      MATERIALS.sunset_sky,
    priority:      10
  });
}

/**
 * Add billboard plane mesh
 */
function addBillboardPlane(resource_manager) {
  resource_manager.addProceduralMesh("plane", makePlane());
}

/**
 * Run WFC to generate central and small grids
 */
async function generateGrids() {
  const centralDims = [10, 4, 5];
  const smallDims   = [3,  3, 3];
  const [cw, cd, ch] = centralDims;
  const [sw, sd, sh] = smallDims;
  const centralGrid = await runWFC(cw, cd, ch);
  const smallGrid   = await runWFC(sw, sd, sh);
  return { centralGrid, smallGrid, dims: { cw, cd, ch, sw, sd, sh } };
}

/**
 * Collect tiles into instances and compute bounding box
 */
function collectInstances(grids, dims) {
  const { centralGrid, smallGrid } = grids;
  const { cw, cd, ch, sw, sd, sh } = dims;
  const centralOffset = [-cw/2, -cd/2, 0];
  const buildingInstances  = {};
  const billboardInstances = {};
  const box = {
    minX: Infinity, maxX: -Infinity,
    minY: Infinity, maxY: -Infinity,
    minZ: Infinity, maxZ: -Infinity
  };

  const dirs = {
    '+X': { dx:  1, dy:  0, yaw: -Math.PI/2 },
    '-X': { dx: -1, dy:  0, yaw:  Math.PI/2 },
    '+Y': { dx:  0, dy:  1, yaw:  0         },
    '-Y': { dx:  0, dy: -1, yaw:  Math.PI   }
  };
  const tiltQuat = quatFromAxisAngle([1,0,0], -Math.PI/2);

  function addTile(tile, offX, offY) {
    const [tx, ty, tz] = tile.coords;
    const wx = offX + tx;
    const wy = offY + ty;
    const wz = tz;

    box.minX = Math.min(box.minX, wx);
    box.maxX = Math.max(box.maxX, wx + 1);
    box.minY = Math.min(box.minY, wy);
    box.maxY = Math.max(box.maxY, wy + 1);
    box.minZ = Math.min(box.minZ, wz);
    box.maxZ = Math.max(box.maxZ, wz + 1);

    buildingInstances[tile.model] = buildingInstances[tile.model] || [];
    buildingInstances[tile.model].push({
      translation:  [wx, wy, wz],
      rotation:     tile.rotation,
      scale:        [1, 1, 1],
      originalPos:  [wx, wy, wz]
    });

    for (const [face, open] of Object.entries(tile.exposedFaces || {})) {
      if (!open) continue;
      const d = dirs[face];
      if (!d) continue;
      const px = wx + d.dx * 0.5;
      const py = wy + d.dy * 0.5;
      const rot = multiplyQuat(
        quatFromAxisAngle([0,1,0], d.yaw),
        tiltQuat
      );
      const bbKey = `billboard_${face}`;
      billboardInstances[bbKey] = billboardInstances[bbKey] || [];
      billboardInstances[bbKey].push({
        translation:  [px, py, wz],
        rotation:     rot,
        scale:        [1, 1, 1],
        originalPos:  [px, py, wz]
      });
    }
  }

  // central block
  for (let x = 0; x < cw; x++) for (let y = 0; y < cd; y++) for (let z = 0; z < ch; z++) {
    const tile = centralGrid[x][y][z]; if (!tile) continue;
    tile.coords = [centralOffset[0] + x, centralOffset[1] + y, z];
    addTile(tile, centralOffset[0], centralOffset[1]);
  }

  // surrounding ring
  const ring = 2, gap = 2;
  const xDist = cw/2 + gap + sw/2;
  const yDist = cd/2 + gap + sd/2;
  const smallOff = [-sw/2, -sd/2];
  for (let i = -ring; i <= ring; i++) for (let j = -ring; j <= ring; j++) {
    if (i===0 && j===0) continue;
    const bx = i * xDist;
    const by = j * yDist;
    for (let x = 0; x < sw; x++) for (let y = 0; y < sd; y++) for (let z = 0; z < sh; z++) {
      const tile = smallGrid[x][y][z]; if (!tile) continue;
      const wx = bx + smallOff[0] + x;
      const wy = by + smallOff[1] + y;
      tile.coords = [wx, wy, z];
      addTile(tile, bx + smallOff[0], by + smallOff[1]);
    }
  }

  return { buildingInstances, billboardInstances, box };
}

/**
 * Register instanced meshes into scene
 */
function registerInstances(scene, buildingInstances, billboardInstances) {
  Object.entries(buildingInstances).forEach(([meshRef, instances]) => {
    scene.instancedObjects[meshRef] = {
      meshReference: meshRef,
      material:      MATERIALS.futuristic_concrete,
      instances,
      type:          'building',
      priority:      20
    };
  });
  Object.entries(billboardInstances).forEach(([key, instances]) => {
    scene.instancedObjects[key] = {
      meshReference: 'plane',
      material:      MATERIALS.pine,
      instances,
      type:          'billboard',
      priority:      30
    };
  });
}

/**
 * Setup lighting and bounding box on scene
 */
function setupLightingAndBounds(scene, box) {
  const lightDist = 6;
  const cx = (box.minX + box.maxX) / 2;
  const cy = (box.minY + box.maxY) / 2;
  const topZ = box.maxZ;
  const midZ = (box.minZ + box.maxZ) / 2;
  const bottomZ = box.minZ;
  const positions = [
    [cx, cy, topZ + lightDist],
    [box.maxX + lightDist, cy, midZ],
    [box.minX - lightDist, cy, midZ],
    [cx, box.maxY + lightDist, midZ],
    [cx, box.minY - lightDist, midZ],
    [cx, cy, bottomZ - lightDist * 0.5]
  ];
  scene.lights = positions.map(pos => ({ position: pos, color: [0.8, 0.8, 0.9] }));
  scene.sceneBoundingBox = box;
}

/**
 * Main entry: sets up entire city scene
 */
export async function setupCityScene(resource_manager, scene) {
  addSkyDome(resource_manager, scene);
  addBillboardPlane(resource_manager);
  const grids = await generateGrids();
  const { buildingInstances, billboardInstances, box } = collectInstances(grids, grids.dims);
  registerInstances(scene, buildingInstances, billboardInstances);
  updateInstancedObjectsVisibility(scene);
  setupLightingAndBounds(scene, box);
}

/**
 * Visibility‐culling logic
 * @param {CityScene} scene
 */
export function updateInstancedObjectsVisibility(scene) {
  const keep = scene.objects.filter(o => o.meshReference === "mesh_sphere_env_map");
  Object.values(scene.instancedObjects).forEach(group => {
    group.instances.forEach(inst => {
      const dist = distance3D(inst.originalPos, scene.cameraPosition);
      if (dist <= scene.visibilityDistance) {
        keep.push({
          translation:   inst.translation,
          rotation:      inst.rotation,
          scale:         inst.scale,
          meshReference: group.meshReference,
          material:      group.material,
          priority:      group.priority
        });
      }
    });
  });
  scene.objects = keep.sort((a, b) => (a.priority || 0) - (b.priority || 0));
}
