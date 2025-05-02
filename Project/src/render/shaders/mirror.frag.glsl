precision mediump float;

varying vec3 v2f_frag_pos;
varying vec3 v2f_normal;

uniform samplerCube cube_env_map;

void main() {
	vec3 v = normalize(-v2f_frag_pos);
	vec3 n = normalize(v2f_normal);
	vec3 r = reflect(-v, n);

	// Read the color of the reflection from the cube map
	vec4 result = textureCube(cube_env_map, r);
	vec3 color = result.xyz;

	gl_FragColor = vec4(color, 1.0); // output: RGBA in 0..1 range
}
