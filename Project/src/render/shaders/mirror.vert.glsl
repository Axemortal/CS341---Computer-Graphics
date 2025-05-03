<<<<<<< HEAD
attribute vec3 vertex_positions;
attribute vec3 vertex_normal;

varying vec3 v2f_frag_pos;
varying vec3 v2f_normal;

=======
// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 vertex_positions;
attribute vec3 vertex_normal;

// Per-vertex outputs passed on to the fragment shader
varying vec3 v2f_frag_pos;
varying vec3 v2f_normal;

// Global variables specified in "uniforms" entry of the pipeline
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
uniform mat4 mat_model_view;
uniform mat4 mat_model_view_projection;
uniform mat3 mat_normals_model_view;

<<<<<<< HEAD
void main() {
=======

void main() {

>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
	// Vertex position in camera view
	vec4 position_v4 = vec4(vertex_positions, 1);
	v2f_frag_pos = (mat_model_view * vec4(position_v4)).xyz;

	// Normals in camera view
	v2f_normal = normalize(mat_normals_model_view * vertex_normal);

	gl_Position = mat_model_view_projection * vec4(vertex_positions, 1);
}
