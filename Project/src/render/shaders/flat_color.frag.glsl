precision mediump float;

// Texture coordinates passed from vertex shader
varying vec2 v2f_vertex_tex_coords;

uniform sampler2D material_texture; // Texture to sample color from
uniform bool is_textured;
uniform vec3 material_base_color;

void main() {
    vec3 material_color = material_base_color;

    if(is_textured) {
        material_color = texture2D(material_texture, v2f_vertex_tex_coords).rgb;
    }

    gl_FragColor = vec4(material_color, 1.); // output: RGBA in 0..1 range
}