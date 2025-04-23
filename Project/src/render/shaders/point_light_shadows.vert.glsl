attribute vec3 vertex_positions;
attribute vec3 vertex_normal;

varying vec3 v2f_frag_pos;

uniform mat4 mat_model_view;
uniform mat4 mat_model_view_projection;

void main() {

	// vertex position in camera view
	vec4 position_v4 = vec4(vertex_positions, 1);
	v2f_frag_pos = (mat_model_view * vec4(position_v4)).xyz;

	// vertex position on canvas
	gl_Position = mat_model_view_projection * vec4(vertex_positions, 1);
}