precision mediump float;

/* #TODO GL3.2.3
	Setup the varying values needed to compue the Phong shader:
	* surface normal
	* view vector: direction to camera
*/
//varying ...
//varying ...

uniform samplerCube cube_env_map;

void main()
{
	/*
	/* #TODO GL3.2.3: Mirror shader
	Calculate the reflected ray direction R and use it to sample the environment map.
	Pass the resulting color as output.
	*/
	vec3 color = vec3(0., 0.5, 0.);
	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
