<<<<<<< HEAD
precision highp float;

// Input from vertex shader
varying vec2 v2f_vertex_tex_coords;

// Material uniforms
=======
precision mediump float;

// Varying values passed from the vertex shader
varying vec3 v2f_frag_pos;
varying vec3 v2f_normal;
varying vec2 v2f_uv;

// Global variables specified in "uniforms" entry of the pipeline
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
uniform sampler2D material_texture;
uniform bool is_textured;
uniform vec3 material_base_color;
uniform float material_shininess;
<<<<<<< HEAD

// Lighting uniforms
=======
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
uniform vec3 light_color;
uniform vec3 light_position;
uniform float ambient_factor;

<<<<<<< HEAD
// G-buffer textures
uniform sampler2D position_texture;
uniform sampler2D normal_texture;
uniform vec2 tex_size;

void main() {
    const float MATERIAL_AMBIENT = 0.6;

    vec3 material_color = material_base_color;
    if(is_textured) {
        material_color = texture2D(material_texture, v2f_vertex_tex_coords).rgb;
    }

    vec2 texCoord = gl_FragCoord.xy / tex_size;
    vec3 position = texture2D(position_texture, texCoord).xyz;
    vec3 normal = normalize(texture2D(normal_texture, texCoord).xyz);

	// Blinn-Phong lighting model
    vec3 view_dir = normalize(-position);
    vec3 light_dir = normalize(light_position - position);
    vec3 normal_dir = normalize(normal);
    vec3 half_dir = normalize(light_dir + view_dir);

    float n_dot_l = max(0.0, dot(normal_dir, light_dir));
    float h_dot_n = clamp(dot(half_dir, normal_dir), 1e-12, 1.0);

    // Compute ambient
    vec3 ambient = ambient_factor * material_color * MATERIAL_AMBIENT;

    // Compute diffuse
    float diffuse = n_dot_l;
=======
void main()
{
    vec3 material_color = material_base_color;
    if (is_textured){
        vec4 frag_color_from_texture = texture2D(material_texture, v2f_uv);
        material_color = frag_color_from_texture.xyz;
    }

	float material_ambient = 0.6;

	// Blinn-Phong lighting model 
    vec3 v = normalize(-v2f_frag_pos);
    vec3 l = normalize(light_position - v2f_frag_pos);
    vec3 n = normalize(v2f_normal);
	vec3 h = normalize(l + v);

    float h_dot_n = clamp(dot(h, n), 1e-12, 1.);

    // Compute diffuse
    float diffuse = max(0.0, dot(n, l));
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879

    // Compute specular
    float specular = (diffuse > 0.0) ? pow(h_dot_n, material_shininess) : 0.0;

<<<<<<< HEAD
    float light_distance = length(light_position - position);
    float attenuation = 1.0 / pow(light_distance, 0.25);
    vec3 light_intensity = material_color * light_color * attenuation;

    // Compute pixel color
    vec3 color = ambient + (light_intensity * (diffuse + specular));

    gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
=======
    // Compute ambient
    vec3 ambient = ambient_factor * material_color * material_ambient;

    float light_distance = length(light_position - v2f_frag_pos);
    float attenuation = 1.0 / pow(light_distance, 0.25);

    // Compute pixel color
    vec3 color = ambient + (attenuation * light_color * material_color * (diffuse + specular));

	gl_FragColor = vec4(color, 1.);; // output: RGBA in 0..1 range
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
}
