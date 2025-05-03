attribute vec3 vertex_positions;
attribute vec3 vertex_normal;

<<<<<<< HEAD
=======
// Varying values passed from the vertex shader
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
varying vec3 v2f_normal;
varying vec3 v2f_frag_pos;
varying vec3 v2f_light_position;
varying float v2f_height;

<<<<<<< HEAD
=======
// Global variables specified in "uniforms" entry of the pipeline
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
uniform mat4 mat_model_view_projection;
uniform mat4 mat_model_view;
uniform mat3 mat_normals_model_view; // mat3 not 4, because normals are only rotated and not translated

uniform vec3 light_position; //in camera space coordinates already

<<<<<<< HEAD
void main() {
    // the height of the terrain is its z coordinates
	v2f_height = vertex_positions.z;
	vec4 vertex_positions_v4 = vec4(vertex_positions, 1);

=======
void main()
{
    // the height of the terrain is its z coordinates
    v2f_height = vertex_positions.z;
    vec4 vertex_positions_v4 = vec4(vertex_positions, 1);
	
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
	// viewing vector (from camera to vertex in view coordinates), camera is at vec3(0, 0, 0) in cam coords
	// vertex position in camera coordinates
	v2f_frag_pos = (mat_model_view * vec4(vertex_positions_v4)).xyz;
	// transform normal to camera coordinates
	v2f_normal = normalize(mat_normals_model_view * vertex_normal);
<<<<<<< HEAD
	v2f_light_position = light_position;

=======
    v2f_light_position = light_position;
	
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
	gl_Position = mat_model_view_projection * vertex_positions_v4;
}
