// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 vertex_position;
attribute vec3 vertex_normal;

// Per-vertex outputs passed on to the fragment shader

/* #TODO GL2.3
	Pass the values needed for per-pixel illumination by creating a varying vertex-to-fragment variable.
*/
// Add this line (do not modify any existing code):
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
    // Transform the vertex position into view space:
    vec3 pos_view = (mat_model_view * vec4(vertex_position, 1.0)).xyz;
    
    // Compute the vertex normal in view space:
    vec3 N = normalize(mat_normals_to_view * vertex_normal);
    
    // Compute light direction (assuming light_position is already in view space):
    vec3 L = normalize(light_position - pos_view);
    
    // Compute view direction (camera is at origin in view space):
    vec3 V = normalize(-pos_view);
    
    // Compute half-vector for Blinn-Phong:
    vec3 H = normalize(L + V);
    
    // Diffuse component:
    float diff = max(dot(N, L), 0.0);
    
    // Specular component:
    float spec = (diff > 0.0) ? pow(max(dot(N, H), 0.0), material_shininess) : 0.0;
    
    // Combine ambient, diffuse and specular terms:
    vec3 ambient = material_ambient * material_color * light_color;
    vec3 diffuse = diff * material_color * light_color;
    vec3 specular = spec * material_color *light_color;
    
    // Store the computed color in the varying variable:
    vertex_color = ambient + diffuse + specular;
    
    gl_Position = mat_mvp * vec4(vertex_position, 1.0);
}
