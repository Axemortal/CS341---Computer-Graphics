precision mediump float;

/* #TODO GL2.4
	Setup the varying values needed to compue the Phong shader:
	* surface normal
	* lighting vector: direction to light
	* view vector: direction to camera
*/
varying vec3 v2f_normal;
varying vec3 v2f_dir_to_light;
varying vec3 v2f_dir_from_view;

uniform vec3 material_color;
uniform float material_shininess;
uniform vec3 light_color;

void main() {
	float material_ambient = 0.1;

	/*
	/* #TODO GL2.4: Apply the Blinn-Phong lighting model

	Implement the Blinn-Phong shading model by using the passed
	variables and write the resulting color to `color`.

	Make sure to normalize values which may have been affected by interpolation!
	*/

	vec3 normal = normalize(v2f_normal);
	vec3 light_dir = normalize(v2f_dir_to_light);
	vec3 view_dir = normalize(-v2f_dir_from_view);
	vec3 half_vector = normalize(light_dir + view_dir);

	vec3 ambient_color = material_ambient * material_color * light_color;
	vec3 diffuse_color = max(dot(normal, light_dir), 0.) * material_color * light_color;
	vec3 specular_color = pow(max(dot(half_vector, normal), 0.), material_shininess) * material_color * light_color;

	vec3 color = ambient_color + diffuse_color + specular_color;
	gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
