// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 vertex_position;
attribute vec3 vertex_normal;

// Per-vertex outputs passed on to the fragment shader

/* #TODO GL2.3
	Pass the values needed for per-pixel illumination by creating a varying vertex-to-fragment variable.
*/
varying vec3 vertex_color;

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_mvp;
uniform mat4 mat_model_view;
uniform mat3 mat_normals_to_view;

uniform vec3 light_position; // in camera space coordinates already

uniform vec3 material_color;
uniform float material_shininess;
uniform vec3 light_color;

void main() {
	float material_ambient = 0.1;

	/** #TODO GL2.3 Gouraud lighting
	Compute the visible object color based on the Blinn-Phong formula.

	Hint: Compute the vertex position, normal and light_position in view space. 
	*/

	vec3 vertex_position_view = (mat_model_view * vec4(vertex_position, 1)).xyz;
	vec3 vertex_normal_view = normalize(mat_normals_to_view * vertex_normal);
	vec3 light_vector = normalize(light_position - vertex_position_view);
	vec3 view_vector = normalize(-vertex_position_view);
	vec3 half_vector = normalize(light_vector + view_vector);

	vec3 ambient_color = material_ambient * material_color * light_color;
	vec3 diffuse_color = max(dot(vertex_normal_view, light_vector), 0.) * material_color * light_color;
	vec3 specular_color = pow(max(dot(half_vector, vertex_normal_view), 0.), material_shininess) * material_color * light_color;

	vertex_color = ambient_color + diffuse_color + specular_color;

	gl_Position = mat_mvp * vec4(vertex_position, 1);
}
