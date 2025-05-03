precision highp float;

varying float v2f_height;

<<<<<<< HEAD
=======
// Varying values passed to fragment shader
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
varying vec3 v2f_normal;
varying vec3 v2f_frag_pos;
varying vec3 v2f_light_position;

<<<<<<< HEAD
uniform vec3 light_color;
uniform vec3 water_color;
uniform vec3 grass_color;
uniform vec3 peak_color;
uniform float water_shininess;
uniform float grass_shininess;
uniform float peak_shininess;
=======
// Global variables specified in "uniforms" entry of the pipeline
uniform vec3  light_color;
uniform vec3  water_color;
uniform vec3  grass_color;
uniform vec3  peak_color;
uniform float  water_shininess;
uniform float  grass_shininess;
uniform float  peak_shininess;
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879

uniform float ambient_factor;

// Small perturbation to prevent "z-fighting" on the water on some machines...
<<<<<<< HEAD
const float terrain_water_level = -0.03125 + 1e-6;

void main() {
=======
const float terrain_water_level    = -0.03125 + 1e-6;

void main()
{
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
	float material_ambient = 0.1; // Ambient light coefficient
	float height = v2f_height;
	vec3 light_position = v2f_light_position;

	vec3 material_color = grass_color;
	float shininess = grass_shininess;

<<<<<<< HEAD
	if(height <= terrain_water_level) {
		material_color = water_color;
		shininess = water_shininess;
	} else {
		float a = (height - terrain_water_level) * 2.;
=======
	if (height <= terrain_water_level){
		material_color = water_color;
		shininess = water_shininess;
	}
	else{
		float a = (height - terrain_water_level)*2.;
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
		material_color = mix(grass_color, peak_color, a);
		shininess = mix(grass_shininess, peak_shininess, a);
	}

	// Blinn-Phong lighting model
	vec3 v = normalize(-v2f_frag_pos);
	vec3 l = normalize(light_position - v2f_frag_pos);
	vec3 n = normalize(v2f_normal);
	float dist_frag_light = length(v2f_frag_pos - light_position);

	vec3 h = normalize(l + v);

    // Compute diffuse
<<<<<<< HEAD
	vec3 diffuse = vec3(0.0);
	diffuse = material_color * max(dot(n, l), 0.0);

	// Compute specular
	vec3 specular = vec3(0.0);
	float s = dot(h, n);
	if(s > 0.0) {
=======
    vec3 diffuse = vec3(0.0);
	diffuse = material_color * max(dot(n, l), 0.0);
	
	// Compute specular
    vec3 specular = vec3(0.0);
	float s = dot(h, n);
	if (s > 0.0){
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
		specular = material_color * pow(s, shininess);
	}

	// Compute ambient
	vec3 ambient = ambient_factor * material_color * material_ambient;

	//float attenuation = 1. / (dist_frag_light * dist_frag_light);
<<<<<<< HEAD

	// Compute pixel color
	vec3 color = ambient + (light_color * (diffuse + specular));
=======
	
	// Compute pixel color
    vec3 color = ambient + (light_color * (diffuse + specular));
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}