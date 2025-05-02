attribute vec3 vertex_positions;

varying vec3 v2f_position;

uniform mat4 mat_model_view_projection;
uniform mat4 mat_model_view;

void main() {
    v2f_position = (mat_model_view * vec4(vertex_positions, 1)).xyz;

    gl_Position = mat_model_view_projection * vec4(vertex_positions, 1);
}
