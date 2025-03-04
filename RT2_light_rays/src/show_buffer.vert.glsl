
attribute vec2 vertex_position;

varying vec2 tex_coord;

void main() {
	tex_coord = 0.5 * (1. + vertex_position);

	gl_Position = vec4(vertex_position, 0., 1.);
}
