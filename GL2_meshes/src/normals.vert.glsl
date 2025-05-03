// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 vertex_position;
attribute vec3 vertex_normal;

// Per-vertex outputs passed on to the fragment shader
<<<<<<< HEAD

/* #TODO GL2.2.1
	Pass the normal to the fragment shader by creating a varying vertex-to-fragment variable.
*/
varying vec3 normal;
=======
varying vec3 normal_to_fragment;
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_mvp;
uniform mat4 mat_model_view;
uniform mat3 mat_normals_to_view;

void main() {
<<<<<<< HEAD

	/* #TODO GL2.2.1 
		Pass the normal to the fragment shader by assigning your vertex-to-fragment variable.
	*/

	/* #TODO GL2.2.2
		Transform the normals to camera space.
	*/

	normal = mat_normals_to_view * vertex_normal;
=======
	// Transform normal to camera space
	normal_to_fragment = normalize(mat_normals_to_view * vertex_normal);
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879

	gl_Position = mat_mvp * vec4(vertex_position, 1);
}
