attribute vec3 vertex_positions;
attribute vec3 vertex_normal;

varying vec3 v2f_frag_pos;
varying vec3 v2f_normal;

uniform mat4 mat_model_view;
uniform mat4 mat_model_view_projection;
uniform mat3 mat_normals_model_view;

void main() {
	// Vertex position in camera view
	vec4 position_v4 = vec4(vertex_positions, 1);
	v2f_frag_pos = (mat_model_view * vec4(position_v4)).xyz;

	// Normals in camera view
	v2f_normal = normalize(mat_normals_model_view * vertex_normal);

	gl_Position = mat_model_view_projection * vec4(vertex_positions, 1);
}
