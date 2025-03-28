precision mediump float;

// #TODO GL2 setup varying
varying vec3 vertex_color;

void main() {
	/*
	#TODO GL2.3: Gouraud lighting
	*/
	gl_FragColor = vec4(vertex_color, 1.); // output: RGBA in 0..1 range
}
