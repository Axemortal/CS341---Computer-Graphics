precision mediump float;

/* #TODO GL3.2.3
	Setup the varying values needed to compue the Phong shader:
	* surface normal
	* view vector: direction to camera
*/
varying vec3 v2f_normal;
varying vec3 v2f_dir_to_camera;

uniform samplerCube cube_env_map;

void main() {
	/*
	/* #TODO GL3.2.3: Mirror shader
	Calculate the reflected ray direction R and use it to sample the environment map.
	Pass the resulting color as output.
	*/
<<<<<<< HEAD
	vec3 r = reflect(v2f_dir_to_camera, normalize(v2f_normal));
	vec3 color = textureCube(cube_env_map, r).xyz;
=======
	vec3 norm = normalize(v2f_normal);
    vec3 view_dir = -normalize(v2f_dir_to_camera);
	vec3 reflected_ray = reflect(view_dir, norm);
	vec3 color = textureCube(cube_env_map, reflected_ray).rgb;
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
