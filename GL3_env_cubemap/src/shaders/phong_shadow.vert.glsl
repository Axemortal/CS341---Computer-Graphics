// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 vertex_position;
attribute vec3 vertex_normal;
attribute vec2 vertex_tex_coords;

// Per-vertex outputs passed on to the fragment shader

/* #TODO GL3.3.1: Pass on the normals and fragment position in camera coordinates */
varying vec3 v2f_normal;
varying vec3 v2f_position;
varying vec2 v2f_uv;

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_mvp;
uniform mat4 mat_model_view;
uniform mat3 mat_normals_to_view;

void main() {
	v2f_uv = vertex_tex_coords;

	/** #TODO GL3.3.1
	Setup all outgoing variables so that you can compute in the fragment shader
    the phong lighting. You will need to setup all the uniforms listed above, before you
    can start coding this shader.
	* surface normal
	* vertex position in camera coordinates
    Hint: Compute the vertex position, normal and light_position in eye space.
    Hint: Write the final vertex position to gl_Position
    */
	// viewing vector (from camera to vertex in view coordinates), camera is at vec3(0, 0, 0) in cam coords
	// vertex position in camera coordinates
<<<<<<< HEAD
	v2f_position = (mat_model_view * vec4(vertex_position, 1)).xyz;
=======
	v2f_position = (mat_model_view * vec4(vertex_position, 1)).rgb;
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
	// transform normal to camera coordinates
	v2f_normal = mat_normals_to_view * vertex_normal;

	gl_Position = mat_mvp * vec4(vertex_position, 1);
}
