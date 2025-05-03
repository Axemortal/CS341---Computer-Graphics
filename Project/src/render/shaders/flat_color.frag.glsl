precision mediump float;
<<<<<<< HEAD

// Texture coordinates passed from vertex shader
varying vec2 v2f_vertex_tex_coords;

=======
		
// Texture coordinates passed from vertex shader
varying vec2 v2f_uv;

// Global variables specified in "uniforms" entry of the pipeline
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
uniform sampler2D material_texture; // Texture to sample color from
uniform bool is_textured;
uniform vec3 material_base_color;

<<<<<<< HEAD
void main() {
    vec3 material_color = material_base_color;

    if(is_textured) {
        material_color = texture2D(material_texture, v2f_vertex_tex_coords).rgb;
    }

    gl_FragColor = vec4(material_color, 1.); // output: RGBA in 0..1 range
=======
void main()
{
    vec3 material_color = material_base_color;

    // check wether the color to display is a base color or comes from a texture
    if (is_textured){
        vec4 frag_color_from_texture = texture2D(material_texture, v2f_uv);
        material_color = frag_color_from_texture.xyz;
    }

	gl_FragColor = vec4(material_color, 1.); // output: RGBA in 0..1 range
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
}