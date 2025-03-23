// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 vertex_position;
attribute vec3 vertex_normal;

// Per-vertex outputs passed on to the fragment shader
varying vec3 normal_to_fragment;

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_mvp;
uniform mat4 mat_model_view;
uniform mat3 mat_normals_to_view;

void main() {
	// Transform normal to camera space
	normal_to_fragment = normalize(mat_normals_to_view * vertex_normal);

	gl_Position = mat_mvp * vec4(vertex_position, 1);
}
