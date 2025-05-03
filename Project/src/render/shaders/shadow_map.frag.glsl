precision highp float;

<<<<<<< HEAD
varying vec3 v2f_frag_pos;

void main() {
=======
// Varying values passed from the vertex shader
varying vec3 v2f_frag_pos;

void main () {
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
	float depth = length(v2f_frag_pos); // in view coordinates, the camera is at [0, 0, 0]
	gl_FragColor = vec4(depth, depth, depth, 1.);
}