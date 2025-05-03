precision highp float;

/* #TODO GL3.3.1: Pass on the normals and fragment position in camera coordinates */
varying vec3 v2f_normal;
varying vec3 v2f_position;
varying vec2 v2f_uv;

uniform vec3 light_position; // light position in camera coordinates
uniform vec3 light_color;
uniform samplerCube cube_shadowmap;
uniform sampler2D tex_color;

void main() {

	float material_shininess = 12.;
	float material_ambient = 1e-4;

	/* #TODO GL3.1.1
	Sample texture tex_color at UV coordinates and display the resulting color.
	*/
<<<<<<< HEAD
	vec3 material_color = texture2D(tex_color, v2f_uv).xyz;
=======
	vec3 material_color = texture2D(tex_color, v2f_uv).rgb;
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879

	/*
	#TODO GL3.3.1: Blinn-Phong with shadows and attenuation

	Compute this light's diffuse and specular contributions.
	You should be able to copy your phong lighting code from GL2 mostly as-is,
	though notice that the light and view vectors need to be computed from scratch here; 
	this time, they are not passed from the vertex shader. 
	Also, the light/material colors have changed; see the Phong lighting equation in the handout if you need
	a refresher to understand how to incorporate `light_color` (the diffuse and specular
	colors of the light), `v2f_diffuse_color` and `v2f_specular_color`.
	
	To model the attenuation of a point light, you should scale the light
	color by the inverse distance squared to the point being lit.
	
	The light should only contribute to this fragment if the fragment is not occluded
	by another object in the scene. You need to check this by comparing the distance
	from the fragment to the light against the distance recorded for this
	light ray in the shadow map.
	
	To prevent "shadow acne" and minimize aliasing issues, we need a rather large
	tolerance on the distance comparison. It's recommended to use a *multiplicative*
	instead of additive tolerance: compare the fragment's distance to 1.01x the
	distance from the shadow map.

	Implement the Blinn-Phong shading model by using the passed
	variables and write the resulting color to `color`.

	Make sure to normalize values which may have been affected by interpolation!
	*/

	// transform normal to camera coordinates

	vec3 normal = normalize(v2f_normal);
	vec3 frag_to_light = light_position - v2f_position;
	vec3 light_to_frag = v2f_position - light_position;
	float frag_distance_from_light = length(frag_to_light);
	vec3 light_dir = normalize(frag_to_light);
	vec3 view_dir = normalize(-v2f_position);
	vec3 half_vector = normalize(light_dir + view_dir);

	vec3 ambient_color = material_ambient * material_color * light_color;
	vec3 diffuse_color = vec3(0.);
	vec3 specular_color = vec3(0.);

	float shadowmap_distance = textureCube(cube_shadowmap, light_to_frag).x;
	if(frag_distance_from_light <= 1.01 * shadowmap_distance) {
		float attenuation = 1. / pow(frag_distance_from_light, 2.);
		vec3 light_intensity = material_color * light_color * attenuation;
		diffuse_color = max(dot(normal, light_dir), 0.) * light_intensity;
		specular_color = pow(max(dot(half_vector, normal), 0.), material_shininess) * light_intensity;
	}

	vec3 color = ambient_color + diffuse_color + specular_color;
	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
