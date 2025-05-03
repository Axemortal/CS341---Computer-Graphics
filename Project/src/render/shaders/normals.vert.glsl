attribute vec3 vertex_positions;
attribute vec3 vertex_normal;

varying vec3 normal;

uniform mat4 mat_model_view_projection;
uniform mat3 mat_normals_model_view;

void main() {
    normal = mat_normals_model_view * vertex_normal;

    gl_Position = mat_model_view_projection * vec4(vertex_positions, 1);
}
