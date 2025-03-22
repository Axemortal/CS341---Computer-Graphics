precision mediump float;

// #TODO GL2 setup varying
// varying ...

void main()
{
	/*
	#TODO GL2.3: Gouraud lighting
	*/
	vec3 color = vec3(1., 0., 0.);
	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
