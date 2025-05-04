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

export class CityScene extends Scene {
  /**
   * @param {ResourceManager} resource_manager
   */
  constructor(resource_manager) {
    super();
    this.resource_manager = resource_manager;
    this.objects = [];
    this.lights = [];

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
      material: MATERIALS.sunset_sky
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

    // Iterate grid and place tiles + billboards
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

          // Add the cube tile
          this.objects.push({
            translation: [wx, wy, wz],
            scale: [1, 1, 1],
            meshReference: tile.model,
            rotation: tile.rotation,
            material: MATERIALS.futuristic_concrete
          });

          // Face directions (dx, dy) with yaw rotation (around Y)
          const faces = [
            { dx:  0, dy:  1, yaw:   0           }, // +Y  (front)
            { dx:  1, dy:  0, yaw:  -Math.PI / 2 }, // +X  (right)
            { dx:  0, dy: -1, yaw:   Math.PI     }, // -Y  (back)
            { dx: -1, dy:  0, yaw:   Math.PI / 2 }  // -X  (left)
          ];

          // Common tilt to rotate plane normal +Z ➔ +Y (vertical)
          const tiltQuat = quatFromAxisAngle([1, 0, 0], -Math.PI / 2);

          faces.forEach(({ dx, dy, yaw }) => {
            // Combine tilt + yaw quaternions
            const yawQuat = quatFromAxisAngle([0, 1, 0], yaw);
            const rot = multiplyQuat(yawQuat, tiltQuat);

            const nx = x + dx;
            const ny = y + dy;
            const inBounds = nx >= 0 && nx < sizeX && ny >= 0 && ny < sizeY;

            const neighborSame   = inBounds && grid[nx][ny][z];
            const neighborAbove  = inBounds && z + 1 < sizeZ && grid[nx][ny][z + 1];
            const neighborBelow  = inBounds && z - 1 >= 0  && grid[nx][ny][z - 1];

            // Only add billboard if the entire face stack is empty
            if (!neighborSame && !neighborAbove && !neighborBelow) {
              this.objects.push({
                translation: [wx + dx * 0.5, wy + dy * 0.5, wz],
                scale: [1, 1, 1],
                meshReference: "plane",
                rotation: rot,
                material: billboardMat
              });
            }
          });
        }
      }
    }

    // Lights setup
    const lightDist = 6;
    const cx = (box.minX + box.maxX) / 2;
    const cy = (box.minY + box.maxY) / 2;
    const topZ = box.maxZ;
    const midZ = (box.minZ + box.maxZ) / 2;
    const bottomZ = box.minZ;
    const lightPositions = [
      [cx, cy, topZ + lightDist],
      [box.maxX + lightDist, cy, midZ],
      [box.minX - lightDist, cy, midZ],
      [cx, box.maxY + lightDist, midZ],
      [cx, box.minY - lightDist, midZ],
      [box.maxX + lightDist * 0.7, box.maxY + lightDist * 0.7, midZ],
      [box.maxX + lightDist * 0.7, box.minY - lightDist * 0.7, midZ],
      [box.minX - lightDist * 0.7, box.maxY + lightDist * 0.7, midZ],
      [box.minX - lightDist * 0.7, box.minY - lightDist * 0.7, midZ],
      [cx, cy, bottomZ - lightDist * 0.5],
      [box.maxX + lightDist * 0.5, cy, topZ - 2],
      [box.minX - lightDist * 0.5, cy, topZ - 2]
    ];
    lightPositions.forEach(pos =>
      this.lights.push({ position: pos, color: [0.8, 0.8, 0.9] })
    );

    console.log(
      "Single building loaded.",
      this.objects.length, "objects;",
      this.lights.length, "lights."
    );
  }

  initialize_actor_actions() {}
  initialize_ui_params() {}
}
