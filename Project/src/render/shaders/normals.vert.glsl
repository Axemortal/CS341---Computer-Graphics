<<<<<<< HEAD
attribute vec3 vertex_positions;
attribute vec3 vertex_normal;

varying vec3 normal;

uniform mat4 mat_model_view_projection;
=======
// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 vertex_positions;
attribute vec3 vertex_normal;

// Per-vertex outputs passed on to the fragment shader
varying vec3 normal;

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_model_view_projection;
uniform mat4 mat_model_view;
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
uniform mat3 mat_normals_model_view;

void main() {
    normal = mat_normals_model_view * vertex_normal;

    gl_Position = mat_model_view_projection * vec4(vertex_positions, 1);
}
