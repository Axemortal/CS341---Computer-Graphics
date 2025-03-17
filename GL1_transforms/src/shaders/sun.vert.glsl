precision mediump float;

// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 position;
attribute vec2 tex_coord;

// Per-vertex outputs passed on to the fragment shader
varying vec2 v2f_tex_coord;

// Global variables specified in "uniforms" entry of the pipeline
uniform float sim_time;
uniform mat4 mat_mvp;

void main() {
	v2f_tex_coord = tex_coord;
	/* TODO (optional) Make your sun surface look like a fluid.
	*   - compute, where your incoming vertex is on the sphere by converting its position in spherical angles
	*   - add a new uniform `sim_time` parameter to your shader
	*   - change the position of the vertex depending on its angles and `sim_time` with a combination of sin and cos
	*   - experiment with different combinations of amplitude and frequency until you have a nice flow-like effect
	*/
	gl_Position = vec4(position, 1);
}