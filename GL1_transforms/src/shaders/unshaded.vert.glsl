// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 position;
attribute vec2 tex_coord;

// Per-vertex outputs passed on to the fragment shader
varying vec2 v2f_tex_coord;

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_mvp;

void main() {
	v2f_tex_coord = tex_coord;
	// #TODO GL1.2.1.1: Edit the vertex shader to apply mat_mvp to the vertex position.
	gl_Position = vec4(position, 1);
}
