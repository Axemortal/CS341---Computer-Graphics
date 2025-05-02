import { loadText } from "./cg_web.js";
import { Mesh } from "../../lib/webgl-obj-loader_2.0.8/webgl-obj-loader.module.js";
import { vec3 } from "../../lib/gl-matrix_3.3.0/esm/index.js";

/*---------------------------------------------------------------
	Mesh construction and loading
---------------------------------------------------------------*/

/**
 * Create a sphere mesh
 * @param {number} divisions - Resolution of the sphere; higher values create more faces
 * @param {boolean} inverted - If true, the normals will face inward
 * @returns {Object} Mesh data object
 */
export function makeSphereUV(divisions, inverted) {
  const { sin, cos, PI } = Math;

  const vResolution = divisions | 0; // tell optimizer this is an int
  const uResolution = 2 * divisions;

  const vertexPositions = [];
  const texCoords = [];

  for (let iv = 0; iv < vResolution; iv++) {
    const v = iv / (vResolution - 1);
    const phi = v * PI;
    const sinPhi = sin(phi);
    const cosPhi = cos(phi);

    for (let iu = 0; iu < uResolution; iu++) {
      const u = iu / (uResolution - 1);
      const theta = 2 * u * PI;

      vertexPositions.push([cos(theta) * sinPhi, sin(theta) * sinPhi, cosPhi]);

      texCoords.push([u, v]);
    }
  }

  const faces = [];

  for (let iv = 0; iv < vResolution - 1; iv++) {
    for (let iu = 0; iu < uResolution - 1; iu++) {
      const i0 = iu + iv * uResolution;
      const i1 = iu + 1 + iv * uResolution;
      const i2 = iu + 1 + (iv + 1) * uResolution;
      const i3 = iu + (iv + 1) * uResolution;

      if (!inverted) {
        faces.push([i0, i1, i2]);
        faces.push([i0, i2, i3]);
      } else {
        faces.push([i0, i2, i1]);
        faces.push([i0, i3, i2]);
      }
    }
  }

  const normals = inverted
    ? vertexPositions.map((pos) => vec3.negate(vec3.create(), pos))
    : vertexPositions;

  return {
    name: `UvSphere(${divisions})`,
    vertexPositions: vertexPositions,
    vertexNormals: normals, // on a unit sphere, position is equivalent to normal
    vertexTexCoords: texCoords,
    faces: faces,
  };
}

/**
 * Create a simple plane mesh with unitary length
 * @returns {Object} Mesh data object
 */
export function makePlane() {
  return {
    // Corners of the floor
    vertexPositions: [
      [-1, -1, 0],
      [1, -1, 0],
      [1, 1, 0],
      [-1, 1, 0],
    ],
    // The normals point up
    vertexNormals: [
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
    vertexTexCoords: [
      [0, 0], // bottom left
      [1, 0], // bottom right
      [1, 1], // top right
      [0, 1], // top left
    ],
    faces: [
      [0, 1, 2],
      [0, 2, 3],
    ],
  };
}

/**
 * Load a mesh from an OBJ file
 * @param {string} url - URL of the OBJ file
 * @param {Object} materialColorsByName - Material colors mapped by name
 * @returns {Promise<Object>} Promise resolving to the mesh data
 */
export async function loadObjectMesh(url, materialColorsByName) {
  const objectData = await loadText(url);
  const meshLoadedObject = new Mesh(objectData);

  const facesFromMaterials = [].concat(...meshLoadedObject.indicesPerMaterial);

  let vertexColors = null;

  if (materialColorsByName) {
    const materialColorsByIndex = meshLoadedObject.materialNames.map((name) => {
      let color = materialColorsByName[name];
      if (color === undefined) {
        console.warn(`Missing color for material ${name} in mesh ${url}`);
        color = [1, 0, 1]; // Default to magenta for missing materials
      }
      return color;
    });

    vertexColors = [].concat(
      meshLoadedObject.vertexMaterialIndices.map(
        (matIdx) => materialColorsByIndex[matIdx]
      )
    );
  }

  return {
    name: url.split("/").pop(),
    vertexPositions: meshLoadedObject.vertices,
    vertexTexCoords: meshLoadedObject.textures,
    vertexNormals: meshLoadedObject.vertexNormals,
    vertexColors: vertexColors,

    // https://github.com/regl-project/regl/blob/master/API.md#elements
    faces: facesFromMaterials,
    libObj: meshLoadedObject,
  };
}

/**
 * Upload mesh data to GPU buffers
 *
 * It is not necessary to do so (regl can deal with normal arrays),
 * but this way we make sure it's transferred only once and not on every pipeline construction.
 * @param {Object} regl - REGL instance
 * @param {Object} mesh - Mesh data object
 * @returns {Object} Mesh with GPU buffers
 */
export function uploadMeshToBuffer(regl, mesh) {
  const meshBuffers = {
    name: mesh.name,
    faces: regl.elements({ data: mesh.faces, type: "uint16" }),
  };

  // Process each property that might exist in the mesh
  for (const name of [
    "vertexPositions",
    "vertexNormals",
    "vertexTexCoords",
    "vertexColors",
  ]) {
    const vertexData = mesh[name];
    if (vertexData) {
      meshBuffers[name] = regl.buffer(vertexData);
    }
  }

  return meshBuffers;
}

/**
 * Load an OBJ file and upload it directly to GPU buffers
 * @param {Object} reglInstance - REGL instance
 * @param {string} url - URL of the OBJ file
 * @param {Object} materialColorsByName - Material colors mapped by name
 * @returns {Promise<Object>} Promise resolving to the mesh with GPU buffers
 */
export async function loadObjectToGPU(reglInstance, url, materialColorsByName) {
  const meshCPU = await loadObjectMesh(url, materialColorsByName);
  const meshGPU = uploadMeshToBuffer(reglInstance, meshCPU);
  return meshGPU;
}
