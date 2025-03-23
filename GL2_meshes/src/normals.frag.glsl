precision mediump float;
		
/* #TODO GL2.2.1
	Pass the normal to the fragment shader by creating a varying vertex-to-fragment variable.
*/
//varying ...

void main()
{
	/* #TODO GL2.2.1
	Visualize the normals as false color. 
	*/
	vec3 color = vec3(0., 0., 1.); // set the color from normals

	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
