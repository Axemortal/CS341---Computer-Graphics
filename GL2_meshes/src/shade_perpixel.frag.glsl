precision mediump float;

/* #TODO GL2.4
	Setup the varying values needed to compue the Phong shader:
	* surface normal
	* lighting vector: direction to light
	* view vector: direction to camera
*/
varying vec3 v_normal;
varying vec3 v_lightDir;
varying vec3 v_viewDir;

uniform vec3 material_color;
uniform float material_shininess;
uniform vec3 light_color;

void main()
{
	float material_ambient = 0.1;

	/*
	/* #TODO GL2.4: Apply the Blinn-Phong lighting model

	Implement the Blinn-Phong shading model by using the passed
	variables and write the resulting color to `color`.

	Make sure to normalize values which may have been affected by interpolation!
	*/

	// Normalize the interpolated values:
	vec3 N = normalize(v_normal);
	vec3 L = normalize(v_lightDir);
	vec3 V = normalize(v_viewDir);
	vec3 H = normalize(L + V);

	// Compute diffuse term:
	float diff = max(dot(N, L), 0.0);

	// Compute specular term (only if the diffuse term is positive):
	float spec = (diff > 0.0) ? pow(max(dot(N, H), 0.0), material_shininess) : 0.0;

	// Combine ambient, diffuse, and specular components (all tinted by both the material and the light):
	vec3 ambient = material_ambient * material_color * light_color;
	vec3 diffuse = diff * material_color * light_color;
	vec3 specular = spec * material_color * light_color;

	// Final color:
	vec3 finalColor = ambient + diffuse + specular;
	gl_FragColor = vec4(finalColor, 1.0);
}
