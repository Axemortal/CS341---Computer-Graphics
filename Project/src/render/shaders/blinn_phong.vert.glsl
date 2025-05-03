attribute vec3 vertex_positions;
attribute vec2 vertex_tex_coords;

varying vec2 v2f_vertex_tex_coords;

uniform mat4 mat_model_view_projection;

void main() {
	v2f_vertex_tex_coords = vertex_tex_coords;

	gl_Position = mat_model_view_projection * vec4(vertex_positions, 1);
}
