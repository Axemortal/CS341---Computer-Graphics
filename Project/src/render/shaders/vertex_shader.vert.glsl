#version 300 es
precision highp float;

// Attribute for vertex positions (2D)
in vec2 vertex_positions;

// Uniforms for the viewer's position and scale
uniform vec2 viewer_position;
uniform float viewer_scale;

// Varying to pass the texture coordinates to the fragment shader
out vec2 v2f_tex_coords;

// The main function that will run per vertex
void main() {
    // Scale the vertex position by the viewer's scale
    vec2 local_coord = vertex_positions * viewer_scale;

    // Adjust the texture coordinates by adding the viewer's position
    v2f_tex_coords = viewer_position + local_coord;

    // Set the final position of the vertex (we're working in 2D, so the Z value is 0)
    gl_Position = vec4(vertex_positions, 0.0, 1.0);
}
