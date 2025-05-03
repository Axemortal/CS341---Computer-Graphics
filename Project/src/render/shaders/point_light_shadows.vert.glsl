<<<<<<< HEAD
attribute vec3 vertex_positions;
attribute vec3 vertex_normal;

varying vec3 v2f_frag_pos;

uniform mat4 mat_model_view;
uniform mat4 mat_model_view_projection;

void main() {

=======
// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 vertex_positions;
attribute vec3 vertex_normal;

// Varying values passed to fragment shader
varying vec3 v2f_frag_pos;

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_model_view;
uniform mat4 mat_model_view_projection;


void main() {
	
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
	// vertex position in camera view
	vec4 position_v4 = vec4(vertex_positions, 1);
	v2f_frag_pos = (mat_model_view * vec4(position_v4)).xyz;

	// vertex position on canvas
	gl_Position = mat_model_view_projection * vec4(vertex_positions, 1);
}