// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 vertex_position;
attribute vec3 vertex_normal;

// Per-vertex outputs passed on to the fragment shader

/* #TODO GL2.2.1
	Pass the normal to the fragment shader by creating a varying vertex-to-fragment variable.
*/
varying vec3 normal;

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_mvp;
uniform mat4 mat_model_view;
uniform mat3 mat_normals_to_view;

void main() {

	/* #TODO GL2.2.1 
		Pass the normal to the fragment shader by assigning your vertex-to-fragment variable.
	*/

	/* #TODO GL2.2.2
		Transform the normals to camera space.
	*/

	normal = mat_normals_to_view * vertex_normal;

	gl_Position = mat_mvp * vec4(vertex_position, 1);
}
