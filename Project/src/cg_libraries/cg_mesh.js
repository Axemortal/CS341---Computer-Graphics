<<<<<<< HEAD
import { loadText } from "./cg_web.js";
import { Mesh } from "../../lib/webgl-obj-loader_2.0.8/webgl-obj-loader.module.js";
=======
import {load_text} from "./cg_web.js"
import {Mesh} from "../../lib/webgl-obj-loader_2.0.8/webgl-obj-loader.module.js"
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
import { vec3 } from "../../lib/gl-matrix_3.3.0/esm/index.js";

/*---------------------------------------------------------------
	Mesh construction and loading
---------------------------------------------------------------*/

/**
 * Create a sphere mesh
<<<<<<< HEAD
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
=======
 * @param {*} divisions is the resolution of the sphere the bigger divisions is the more face the sphere has 
 * @param {*} inverted if true the normals will be facing inward of the sphere
 * @returns 
 */
export function cg_mesh_make_uv_sphere(divisions, inverted) {
	const {sin, cos, PI} = Math;

	const v_resolution = divisions | 0; // tell optimizer this is an int
	const u_resolution = 2*divisions;
	const n_vertices = v_resolution * u_resolution;
	const n_triangles = 2 * (v_resolution-1) * (u_resolution - 1);

	const vertex_positions = [];
	const tex_coords = [];

	for(let iv = 0; iv < v_resolution; iv++) {
		const v = iv / (v_resolution-1);
		const phi = v * PI;
		const sin_phi = sin(phi);
		const cos_phi = cos(phi);

		for(let iu = 0; iu < u_resolution; iu++) {
			const u = iu / (u_resolution-1);

			const theta = 2*u*PI;


			vertex_positions.push([
				cos(theta) * sin_phi,
				sin(theta) * sin_phi,
				cos_phi, 
			]);

			tex_coords.push([
				u,
				v,
			]);
		}
	}

	const faces = [];

	for(let iv = 0; iv < v_resolution-1; iv++) {
		for(let iu = 0; iu < u_resolution-1; iu++) {
			const i0 = iu + iv * u_resolution;
			const i1 = iu + 1 + iv * u_resolution;
			const i2 = iu + 1 + (iv+1) * u_resolution;
			const i3 = iu + (iv+1) * u_resolution;

			if (!inverted) {
				faces.push([i0, i1, i2]);
				faces.push([i0, i2, i3]);
			} else {
				faces.push([i0, i2, i1]);
				faces.push([i0, i3, i2]);
			}
		}
	}

	const normals = inverted ? vertex_positions.map((pos) => vec3.negate(vec3.create(), pos)) : vertex_positions;

	return {
		name: `UvSphere(${divisions})`,
		vertex_positions: vertex_positions,
		vertex_normals: normals, // on a unit sphere, position is equivalent to normal
		vertex_tex_coords: tex_coords,
		faces: faces,
	};
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
}

/**
 * Create a simple plane mesh with unitary length
<<<<<<< HEAD
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
=======
 * @returns 
 */
export function cg_mesh_make_plane(){
	return {
		// Corners of the floor
		vertex_positions: [
		[-1, -1, 0],
		[1, -1, 0],
		[1, 1, 0],
		[-1, 1, 0],
		],
		// The normals point up
		vertex_normals: [
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		],
		vertex_tex_coords: [
		[0, 0], //top left
		[1, 0],
		[1, 1],
		[0, 1], //top right
		],
		faces: [
		[0, 1, 2],
		[0, 2, 3],
		],
	};
}

/**
 * 
 * @param {*} url 
 * @param {*} material_colors_by_name 
 * @returns 
 */
export async function cg_mesh_load_obj(url, material_colors_by_name) {
	const obj_data = await load_text(url);
	const mesh_loaded_obj = new Mesh(obj_data);

	const faces_from_materials = [].concat(...mesh_loaded_obj.indicesPerMaterial);
	
	let vertex_colors = null;

	if(material_colors_by_name) {
		const material_colors_by_index = mesh_loaded_obj.materialNames.map((name) => {
			let color = material_colors_by_name[name];
			if (color === undefined) {
				console.warn(`Missing color for material ${name} in mesh ${url}`);
				color = [1., 0., 1.];
			}
			return color;
		})

		vertex_colors = [].concat(mesh_loaded_obj.vertexMaterialIndices.map((mat_idx) => material_colors_by_index[mat_idx]));
		// vertex_colors = regl_instance.buffer(vertex_colors)
	}
	
	return  {
		name: url.split('/').pop(),
		vertex_positions: mesh_loaded_obj.vertices,
		vertex_tex_coords: mesh_loaded_obj.textures,
		vertex_normals: mesh_loaded_obj.vertexNormals,
		vertex_colors: vertex_colors,
		
		// https://github.com/regl-project/regl/blob/master/API.md#elements
		faces: faces_from_materials,
		
		lib_obj: mesh_loaded_obj,
	};
}

/**
 * Put mesh data into a GPU buffer
 * 
 * It is not necessary to do so (regl can deal with normal arrays),
 * but this way we make sure its transferred only once and not on every pipeline construction.
 * @param {*} regl 
 * @param {*} mesh 
 * @returns 
 */
export function mesh_upload_to_buffer(regl, mesh) {
	
	const mesh_buffers = {
		name: mesh.name,
		faces: regl.elements({data: mesh.faces, type: 'uint16'}),
	};

	
	// Some of these fields may be null or undefined
	for(const name of ['vertex_positions', 'vertex_normals', 'vertex_tex_coords', 'vertex_colors']) {
		const vertex_data = mesh[name];
		if(vertex_data) {
			mesh_buffers[name] = regl.buffer(vertex_data);
		}
	}

	return mesh_buffers;
}

/**
 * 
 * @param {*} regl_instance 
 * @param {*} url 
 * @param {*} material_colors_by_name 
 * @returns 
 */
export async function cg_mesh_load_obj_into_regl(regl_instance, url, material_colors_by_name) {
	const mesh_cpu = await cg_mesh_load_obj(url, material_colors_by_name);
	const mesh_gpu = mesh_upload_to_buffer(regl_instance, mesh_cpu);
	return mesh_gpu;
}

>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
