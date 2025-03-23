precision mediump float;

// #TODO GL2 setup varying
varying vec3 frag_color;

void main()
{
	/*
	#TODO GL2.3: Gouraud lighting
	*/
	gl_FragColor = vec4(frag_color, 1.); // output: RGBA in 0..1 range
}
