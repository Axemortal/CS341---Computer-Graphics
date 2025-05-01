// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 vertex_positions;
attribute vec3 vertex_normal;

// Per-vertex outputs passed on to the fragment shader
varying vec3 normal;

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_model_view_projection;
uniform mat4 mat_model_view;
uniform mat3 mat_normals_model_view;

void main() {
    normal = mat_normals_model_view * vertex_normal;

    gl_Position = mat_model_view_projection * vec4(vertex_positions, 1);
}
