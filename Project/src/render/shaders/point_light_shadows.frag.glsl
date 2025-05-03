precision highp float;

<<<<<<< HEAD
varying vec3 v2f_frag_pos;

=======
// Varying values passed from the vertex shader
varying vec3 v2f_frag_pos;

// Global variables specified in "uniforms" entry of the pipeline
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
uniform vec3 light_position_cam; // light position in camera coordinates
uniform samplerCube cube_shadowmap;
uniform float num_lights;

void main() {

	vec3 v = normalize(-v2f_frag_pos);
	vec3 l = normalize(light_position_cam - v2f_frag_pos);
	float dist_frag_light = length(v2f_frag_pos - light_position_cam);

<<<<<<< HEAD
=======

>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
	// get shadow map
	vec4 result = textureCube(cube_shadowmap, -l);
	float shadow_depth = result.r;

	vec3 color = vec3(0.0);

	// if the distance of the fragment from the light is farther 
	// than the one we saved in the cube map, then this fragment is in shadows
<<<<<<< HEAD
	if((dist_frag_light > 1.01 * shadow_depth)) {
		color = vec3(1.0 / num_lights);
=======
	if ((dist_frag_light > 1.01 *shadow_depth)){
		color = vec3(1.0/num_lights);
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
	}

	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
