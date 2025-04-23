precision mediump float;
attribute vec3 vertex_positions;

uniform mat4 mat_model_view_projection;

void main() {
    gl_Position = mat_model_view_projection * vec4(vertex_positions, 1);
}