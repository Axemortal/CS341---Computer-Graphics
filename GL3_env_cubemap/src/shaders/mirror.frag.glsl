precision mediump float;

/* #TODO GL3.2.3
	Setup the varying values needed to compue the Phong shader:
	* surface normal
	* view vector: direction to camera
*/
varying vec3 surface_normal;
varying vec3 dir_to_camera; 

uniform samplerCube cube_env_map;

void main()
{
	/*
	/* #TODO GL3.2.3: Mirror shader
	Calculate the reflected ray direction R and use it to sample the environment map.
	Pass the resulting color as output.
	*/

	vec3 norm = normalize(surface_normal);
    vec3 view_dir = -normalize(dir_to_camera);
	vec3 reflected_ray = reflect(view_dir, norm);
	vec3 color = textureCube(cube_env_map, reflected_ray).rgb;
	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
