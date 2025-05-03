precision highp float;

// Input from vertex shader
varying vec2 v2f_vertex_tex_coords;

// Material uniforms
uniform sampler2D material_texture;
uniform bool is_textured;
uniform vec3 material_base_color;
uniform float material_shininess;

// Lighting uniforms
uniform vec3 light_color;
uniform vec3 light_position;
uniform float ambient_factor;

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

    // Compute specular
    float specular = (diffuse > 0.0) ? pow(h_dot_n, material_shininess) : 0.0;

    float light_distance = length(light_position - position);
    float attenuation = 1.0 / pow(light_distance, 0.25);
    vec3 light_intensity = material_color * light_color * attenuation;

    // Compute pixel color
    vec3 color = ambient + (light_intensity * (diffuse + specular));

    gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
