import * as MATERIALS from "../render/materials.js";
import { makeSphereUV } from "../cg_libraries/cg_mesh.js";
import { runWFC } from "../scene_resources/wfc_solver.js";

// --- Define Model to Material Mapping ---
export const MODEL_MATERIAL_MAP = {
    "city_block1.obj": MATERIALS.futuristic_concrete,
    "city_block2.obj": MATERIALS.futuristic_concrete,
    "city_block3.obj": MATERIALS.futuristic_concrete,
    "city_block4.obj": MATERIALS.zippy_material,
};
const DEFAULT_BUILDING_MATERIAL = MATERIALS.futuristic_concrete;
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
  translation: [0, 0, 0],
  scale:    [80, 80, 80], // Adjust scale as needed for sky dome
  rotation:   identityRot,
  meshReference: "mesh_sphere_env_map",
  material:   MATERIALS.sunset_sky, // Ensure MATERIALS.sunset_sky is defined
  priority:   10 // Low priority, rendered first/behind
 });
}

/**
* Run WFC to generate central and small grids
*/
async function generateGrids(centralDims, smallDims) {
 const [cw, cd, ch] = centralDims;
 const [sw, sd, sh] = smallDims;
 const centralGrid = await runWFC(cw, cd, ch);
 let smallGrid = null;
 if (sw > 0 && sd > 0 && sh > 0) {
  smallGrid = await runWFC(sw, sd, sh);
}
 return { centralGrid, smallGrid, dims: { cw, cd, ch, sw, sd, sh } };
}

/**
* Collect tiles into instances and compute bounding box
*/
async function collectInstances(grids, dims) {
  const { centralGrid, smallGrid } = grids;
  const { cw, cd, ch, sw, sd, sh } = dims;

  // Offset for the central grid to center it around (0,0) in X,Y plane
  const centralOffset = [-cw / 2, -cd / 2, 0];

  const buildingInstances = {};
  const billboardInstances = {};
  const box = { // Bounding box for the entire scene
    minX: Infinity, maxX: -Infinity,
    minY: Infinity, maxY: -Infinity,
    minZ: Infinity, maxZ: -Infinity
  };

  // Mapping for billboard orientation based on exposed face cardinal key
  const dirs = {
    '+X': { dx: 0.5, dy: 0,   dz: 0.5, yaw: -Math.PI / 2 }, // Right face
    '-X': { dx: -0.5, dy: 0,   dz: 0.5, yaw: Math.PI / 2 }, // Left face
    '+Y': { dx: 0,   dy: 0.5, dz: 0.5, yaw: 0      }, // Front face
    '-Y': { dx: 0,   dy: -0.5, dz: 0.5, yaw: Math.PI   }, // Back face
  };
  
  function addTile(tile, currentGridWorldOffsetX, currentGridWorldOffsetY) {
    // tile.position is [gridX, gridY, gridZ] from WFC solver (local to its grid)
    const [gridX, gridY, gridZ] = tile.position;

    // Calculate absolute world coordinates for the tile's origin
    const wx = currentGridWorldOffsetX + gridX;
    const wy = currentGridWorldOffsetY + gridY;
    const wz = gridZ; // Assuming Z starts from 0 and tiles stack upwards

    // Update scene bounding box (assumes tiles are 1x1x1 units)
    box.minX = Math.min(box.minX, wx);
    box.maxX = Math.max(box.maxX, wx + 1);
    box.minY = Math.min(box.minY, wy);
    box.maxY = Math.max(box.maxY, wy + 1);
    box.minZ = Math.min(box.minZ, wz);
    box.maxZ = Math.max(box.maxZ, wz + 1);

    // Handle single or multiple models for the tile
    const modelsToInstance = Array.isArray(tile.model) ? tile.model : [tile.model];

    for (const modelName of modelsToInstance) {
        if (!modelName) continue; // Skip if modelName is null or undefined
        buildingInstances[modelName] = buildingInstances[modelName] || [];
        buildingInstances[modelName].push({
            translation:  [wx, wy, wz],    // World position of the tile
            rotation:     tile.rotation,   // Rotation of the tile
            scale:        [1, 1, 1],       // Default scale
            originalPos:  [wx, wy, wz]     // Store for culling or other logic
        });
    }
  }

  // Process central grid
  for (let x = 0; x < cw; x++) for (let y = 0; y < cd; y++) for (let z = 0; z < ch; z++) {
    const tile = centralGrid[x][y][z];
      if (!tile) continue;
      // tile.position is already [x,y,z] from WFC
    addTile(tile, centralOffset[0], centralOffset[1]);
  }

  // Process surrounding ring of small grids
  // Process three concentric rings of small-grid buildings
  const numRings = 4;
  const gapBetweenGrids = 2;
  const centralGap      = 6;
  for (let ring = 1; ring <= numRings; ring++) {
      // 1) generate a new grid for this ring
    if (sw > 0 && sd > 0 && sh > 0){
      const ringGrid = await runWFC(sw, sd, sh);
  
      // 2) compute this ring’s radius
      const baseRadius = Math.max(cw, cd)/2 + centralGap;
      const radius     = baseRadius + ring * (sw + gapBetweenGrids);
  
      // 3) collect all tiles into a flat array
      const tiles = [];
      for (let x = 0; x < sw; x++) {
        for (let y = 0; y < sd; y++) {
          for (let z = 0; z < sh; z++) {
            const tile = ringGrid[x][y][z];
            if (tile) tiles.push(tile);
          }
        }
      }
  
      // 4) equally distribute them around the circle
      const count = tiles.length;
      tiles.forEach((tile, i) => {
        const θ = (i / count) * 2 * Math.PI;
        const originX = Math.cos(θ) * radius;
        const originY = Math.sin(θ) * radius;
        addTile(tile, originX, originY);
      });
    }
  }
  
  return { buildingInstances, billboardInstances, box };
}

/**
* Register instanced meshes into scene
*/
function registerInstances(scene, buildingInstances, billboardInstances) {
  Object.entries(buildingInstances).forEach(([meshRef, instances]) => {
    if (!meshRef || meshRef === "undefined") {
        console.warn("Skipping undefined meshRef in buildingInstances:", instances);
        return;
    }
    const material = MODEL_MATERIAL_MAP[meshRef] || DEFAULT_BUILDING_MATERIAL;
    scene.instancedObjects[meshRef] = {
      meshReference: meshRef,
      material:   material,
      instances,
      type:     'building',
      priority:   20 // Render after sky, before billboards
    };
  });

  Object.entries(billboardInstances).forEach(([key, instances]) => {
    // 'key' is currently 'billboard_default' or similar
    scene.instancedObjects[key] = {
      meshReference: 'plane', // All billboards use the 'plane' mesh
      material:   MATERIALS.pine, // Or a specific billboard material
      instances,
      type:     'billboard',
      priority:   30 // Render after buildings
    };
  });
}

/**
* Setup lighting and bounding box on scene
*/
function setupLightingAndBounds(scene, box) {
  const lightDist = Math.max(10, (box.maxX - box.minX)/2, (box.maxY - box.minY)/2); // Dynamic light distance
  const cx = (box.minX + box.maxX) / 2;
  const cy = (box.minY + box.maxY) / 2;
  const cz = (box.minZ + box.maxZ) / 2;
  const topZ = box.maxZ;
  const bottomZ = box.minZ;

  scene.lights = [
    { position: [cx, cy, topZ + lightDist * 0.5], color: [0.8, 0.8, 0.9] }, // Top
    { position: [box.maxX + lightDist, cy, cz], color: [0.6, 0.6, 0.5] },   // Right
    { position: [box.minX - lightDist, cy, cz], color: [0.6, 0.6, 0.5] },   // Left
    { position: [cx, box.maxY + lightDist, cz], color: [0.5, 0.5, 0.6] },   // Front
    { position: [cx, box.minY - lightDist, cz], color: [0.5, 0.5, 0.6] },   // Back
    { position: [cx, cy, bottomZ - lightDist * 0.25], color: [0.4, 0.4, 0.4]} // Bottom subtle
  ];
  scene.sceneBoundingBox = box;
}

/**
* Main entry: sets up entire city scene
*/
export async function setupCityScene(resource_manager, scene, centralDims = [10,4,5], smallDims = [3,3,3]) {
  addSkyDome(resource_manager, scene);

  const grids = await generateGrids(centralDims, smallDims);
  const { buildingInstances, billboardInstances, box } = await collectInstances(grids, grids.dims);
  registerInstances(scene, buildingInstances, billboardInstances);

  // Initialize camera position and visibility if not already set by a controller
  scene.cameraPosition = scene.cameraPosition || [(box.minX + box.maxX)/2, box.maxY + 20, (box.minZ + box.maxZ)/2 + 10]; // Example starting camera
  scene.visibilityDistance = scene.visibilityDistance || 150; // Example visibility distance
   
  updateInstancedObjectsVisibility(scene); // Initial visibility update
  setupLightingAndBounds(scene, box);
}

/**
* Visibility‐culling logic
* @param {object} scene - The scene object, expected to have cameraPosition and visibilityDistance
*/
export function updateInstancedObjectsVisibility(scene) {
  // Ensure cameraPosition and visibilityDistance are valid
 const cameraPos = scene.cameraPosition || [0,0,0]; // Default if not set
 const visDist = typeof scene.visibilityDistance === 'number' ? scene.visibilityDistance : 50; // Default if not set

 const keep = scene.objects.filter(o => o.meshReference === "mesh_sphere_env_map"); // Always keep skydome

 Object.values(scene.instancedObjects).forEach(group => {
  group.instances.forEach(inst => {
   const dist = distance3D(inst.originalPos, cameraPos);
   if (dist <= visDist) {
    keep.push({
     translation: inst.translation,
     rotation:   inst.rotation,
     scale:    inst.scale,
     meshReference: group.meshReference,
     material:   group.material,
     priority:   group.priority
    });
   }
  });
 });
 scene.objects = keep.sort((a, b) => (a.priority || 0) - (b.priority || 0));
}