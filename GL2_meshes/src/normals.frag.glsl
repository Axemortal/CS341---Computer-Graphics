precision mediump float;
		
/* #TODO GL2.2.1
	Pass the normal to the fragment shader by creating a varying vertex-to-fragment variable.
*/
varying vec3 normal_to_fragment;

void main()
{
	/* #TODO GL2.2.1
	Visualize the normals as false color. 
	*/
	vec3 color = normal_to_fragment * 0.5 + 0.5;

	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
