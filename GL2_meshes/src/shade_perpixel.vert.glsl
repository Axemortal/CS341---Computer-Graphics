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
<<<<<<< HEAD
varying vec3 v2f_normal;
varying vec3 v2f_dir_to_light;
varying vec3 v2f_dir_from_view;
=======
varying vec3 v_normal;
varying vec3 v_lightDir;
varying vec3 v_viewDir;
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_mvp;
uniform mat4 mat_model_view;
uniform mat3 mat_normals_to_view;

uniform vec3 light_position; //in camera space coordinates already

<<<<<<< HEAD
=======

>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
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
<<<<<<< HEAD

	vec3 vertex_position_view = (mat_model_view * vec4(vertex_position, 1)).xyz;
	// viewing vector (from camera to vertex in view coordinates), camera is at vec3(0, 0, 0) in cam coords
	v2f_dir_from_view = normalize(vertex_position_view);
	// direction to light source
	v2f_dir_to_light = normalize(light_position - vertex_position_view);
	// transform normal to camera coordinates
	v2f_normal = normalize(mat_normals_to_view * vertex_normal);

	gl_Position = mat_mvp * vec4(vertex_position, 1);
=======
	// viewing vector (from camera to vertex in view coordinates), camera is at vec3(0, 0, 0) in cam coords
	//v2f_dir_from_view = vec3(1, 0, 0); // TODO calculate
	// direction to light source
	//v2f_dir_to_light = vec3(0, 1, 0); // TODO calculate
	// transform normal to camera coordinates
	//v2f_normal = normal; // TODO apply normal transformation
	
	gl_Position = mat_mvp * vec4(vertex_position, 1);

	// Compute the vertex position in view space:
	vec3 pos_view = (mat_model_view * vec4(vertex_position, 1.0)).xyz;
	// Transform the vertex normal into view space:
	v_normal = normalize(mat_normals_to_view * vertex_normal);
	// Compute the light direction (from the vertex to the light; light_position is already in view space):
	v_lightDir = normalize(light_position - pos_view);
	// Compute the view direction (from the vertex toward the camera; camera is at the origin in view space):
	v_viewDir = normalize(-pos_view);
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
}
