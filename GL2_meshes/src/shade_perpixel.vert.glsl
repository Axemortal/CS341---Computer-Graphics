// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 vertex_position;
attribute vec3 vertex_normal;

// Per-vertex outputs passed on to the fragment shader

/* #TODO GL2.4
	Setup the varying values needed to compue the Phong shader:
	* surface normal
	* lighting vector: direction to light
	* view vector: direction to camera
*/
varying vec3 v2f_normal;
varying vec3 v2f_dir_to_light;
varying vec3 v2f_dir_from_view;

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_mvp;
uniform mat4 mat_model_view;
uniform mat3 mat_normals_to_view;

uniform vec3 light_position; //in camera space coordinates already

void main() {
	/** #TODO GL2.4:
	Setup all outgoing variables so that you can compute in the fragment shader
    the phong lighting. You will need to setup all the uniforms listed above, before you
    can start coding this shader.
	* surface normal
	* lighting vector: direction to light
	* view vector: direction to camera
    
	Hint: Compute the vertex position, normal and light_position in view space. 
    */

	vec3 vertex_position_view = (mat_model_view * vec4(vertex_position, 1)).xyz;
	// viewing vector (from camera to vertex in view coordinates), camera is at vec3(0, 0, 0) in cam coords
	v2f_dir_from_view = normalize(vertex_position_view);
	// direction to light source
	v2f_dir_to_light = normalize(light_position - vertex_position_view);
	// transform normal to camera coordinates
	v2f_normal = normalize(mat_normals_to_view * vertex_normal);

	gl_Position = mat_mvp * vec4(vertex_position, 1);
}
