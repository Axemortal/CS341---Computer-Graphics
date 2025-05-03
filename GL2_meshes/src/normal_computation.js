<<<<<<< HEAD

import * as vec3 from "../lib/gl-matrix_3.3.0/esm/vec3.js"

function get_vert(mesh, vert_id) {
	const offset = vert_id * 3
	return mesh.vertex_positions.slice(offset, offset + 3)
}

function compute_triangle_normals_and_angle_weights(mesh) {

	/** #TODO GL2.1.1: 
=======
import * as vec3 from "../lib/gl-matrix_3.3.0/esm/vec3.js";

function get_vert(mesh, vert_id) {
  const offset = vert_id * 3;
  return mesh.vertex_positions.slice(offset, offset + 3);
}

function compute_triangle_normals_and_angle_weights(mesh) {
  /** #TODO GL2.1.1: 
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
	- compute the normal vector to each triangle in the mesh
	- push it into the array `tri_normals`
	- compute the angle weights for vert1, vert2, then vert3 and store it into an array [w1, w2, w3]
	- push this array into `angle_weights`

	Hint: you can use `vec3` specific methods such as `normalize()`, `add()`, `cross()`, `angle()`, or `subtract()`.
		  The absolute value of a float is given by `Math.abs()`.
	*/

<<<<<<< HEAD
	const num_faces = (mesh.faces.length / 3) | 0
	const tri_normals = []
	const angle_weights = []
	for (let i_face = 0; i_face < num_faces; i_face++) {
		const vert1 = get_vert(mesh, mesh.faces[3 * i_face + 0])
		const vert2 = get_vert(mesh, mesh.faces[3 * i_face + 1])
		const vert3 = get_vert(mesh, mesh.faces[3 * i_face + 2])

		const v1v2 = vec3.subtract([], vert2, vert1)
		const v1v3 = vec3.subtract([], vert3, vert1)
		const v2v1 = vec3.subtract([], vert1, vert2)
		const v2v3 = vec3.subtract([], vert3, vert2)
		const v3v1 = vec3.subtract([], vert1, vert3)
		const v3v2 = vec3.subtract([], vert2, vert3)

		const normal = vec3.normalize([], vec3.cross([], v1v2, v1v3))

		const angle1 = vec3.angle(v1v2, v1v3)
		const angle2 = vec3.angle(v2v1, v2v3)
		const angle3 = vec3.angle(v3v1, v3v2)

		// Modify the way triangle normals and angle_weights are computed
		tri_normals.push(normal)
		angle_weights.push([angle1, angle2, angle3])
	}
	return [tri_normals, angle_weights]
}

function compute_vertex_normals(mesh, tri_normals, angle_weights) {

	/** #TODO GL2.1.2: 
=======
  const num_faces = (mesh.faces.length / 3) | 0;
  const tri_normals = [];
  const angle_weights = [];
  for (let i_face = 0; i_face < num_faces; i_face++) {
    const vert1 = get_vert(mesh, mesh.faces[3 * i_face + 0]);
    const vert2 = get_vert(mesh, mesh.faces[3 * i_face + 1]);
    const vert3 = get_vert(mesh, mesh.faces[3 * i_face + 2]);

    // Calculate edges
    const edge1 = vec3.subtract(vec3.create(), vert2, vert1);
    const edge2 = vec3.subtract(vec3.create(), vert3, vert1);

    // Calculate normal using cross product
    const normal = vec3.cross(vec3.create(), edge1, edge2);
    vec3.normalize(normal, normal);
    tri_normals.push(normal);

    // Calculate angle weights
    const edge3 = vec3.subtract(vec3.create(), vert3, vert2);
    const angle1 = Math.abs(vec3.angle(edge1, edge2));
    const angle2 = Math.abs(vec3.angle(edge2, edge3));
    const angle3 = Math.abs(vec3.angle(edge1, edge3));

    angle_weights.push([angle1, angle2, angle3]);
  }
  return [tri_normals, angle_weights];
}

function compute_vertex_normals(mesh, tri_normals, angle_weights) {
  /** #TODO GL2.1.2: 
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
	- go through the triangles in the mesh
	- add the contribution of the current triangle to its vertices' normal
	- normalize the obtained vertex normals
	*/

<<<<<<< HEAD
	const num_faces = (mesh.faces.length / 3) | 0
	const num_vertices = (mesh.vertex_positions.length / 3) | 0
	const vertex_normals = Array.from({ length: num_vertices }, () => [0., 0., 0.]) // fill with 0 vectors

	for (let i_face = 0; i_face < num_faces; i_face++) {
		const iv1 = mesh.faces[3 * i_face + 0]
		const iv2 = mesh.faces[3 * i_face + 1]
		const iv3 = mesh.faces[3 * i_face + 2]

		const normal = tri_normals[i_face]
		const [w1, w2, w3] = angle_weights[i_face]

		// Add your code for adding the contribution of the current triangle to its vertices' normals
		vec3.add(vertex_normals[iv1], vertex_normals[iv1], vec3.scale([], normal, w1));
		vec3.add(vertex_normals[iv2], vertex_normals[iv2], vec3.scale([], normal, w2));
		vec3.add(vertex_normals[iv3], vertex_normals[iv3], vec3.scale([], normal, w3));
	}

	for (let i_vertex = 0; i_vertex < num_vertices; i_vertex++) {
		// Normalize the vertices
		vertex_normals[i_vertex] = vec3.normalize([], vertex_normals[i_vertex])
	}

	return vertex_normals
}

export function mesh_preprocess(regl, mesh) {
	const [tri_normals, angle_weights] = compute_triangle_normals_and_angle_weights(mesh)

	const vertex_normals = compute_vertex_normals(mesh, tri_normals, angle_weights)

	mesh.vertex_positions = regl.buffer({ data: mesh.vertex_positions, type: 'float32' })
	mesh.vertex_normals = regl.buffer({ data: vertex_normals, type: 'float32' })
	mesh.faces = regl.elements({ data: mesh.faces, type: 'uint16' })

	return mesh
=======
  const num_faces = (mesh.faces.length / 3) | 0;
  const num_vertices = (mesh.vertex_positions.length / 3) | 0;
  const vertex_normals = Array.from({ length: num_vertices }, () => [0, 0, 0]); // fill with 0 vectors

  for (let i_face = 0; i_face < num_faces; i_face++) {
    const iv1 = mesh.faces[3 * i_face + 0];
    const iv2 = mesh.faces[3 * i_face + 1];
    const iv3 = mesh.faces[3 * i_face + 2];

    const normal = tri_normals[i_face];
    const weights = angle_weights[i_face];

    // Add weighted contributions to each vertex's normal
    vec3.scaleAndAdd(
      vertex_normals[iv1],
      vertex_normals[iv1],
      normal,
      weights[0]
    );
    vec3.scaleAndAdd(
      vertex_normals[iv2],
      vertex_normals[iv2],
      normal,
      weights[1]
    );
    vec3.scaleAndAdd(
      vertex_normals[iv3],
      vertex_normals[iv3],
      normal,
      weights[2]
    );
  }

  // Normalize all vertex normals
  for (let i_vertex = 0; i_vertex < num_vertices; i_vertex++) {
    vec3.normalize(vertex_normals[i_vertex], vertex_normals[i_vertex]);
  }

  return vertex_normals;
}

export function mesh_preprocess(regl, mesh) {
  const [tri_normals, angle_weights] =
    compute_triangle_normals_and_angle_weights(mesh);

  const vertex_normals = compute_vertex_normals(
    mesh,
    tri_normals,
    angle_weights
  );

  mesh.vertex_positions = regl.buffer({
    data: mesh.vertex_positions,
    type: "float32",
  });
  mesh.vertex_normals = regl.buffer({ data: vertex_normals, type: "float32" });
  mesh.faces = regl.elements({ data: mesh.faces, type: "uint16" });

  return mesh;
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
}
