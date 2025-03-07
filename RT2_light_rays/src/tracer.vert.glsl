precision highp float;

uniform vec2 field_of_view_half_tan; // = tan(field_of_view_xy * 0.5)

uniform vec3 camera_position;
uniform vec3 camera_target;
uniform vec3 camera_up;

attribute vec2 vertex_position;

varying vec3 v2f_ray_origin;
varying vec3 v2f_ray_direction;

void main() {
	// image plane axes
	vec3 axis_forward = normalize(camera_target - camera_position);
	vec3 axis_x = normalize(cross(axis_forward, camera_up));
	vec3 axis_y = cross(axis_x, axis_forward);

	// this vertex on the image plane
	//vec2 img_plane_pos = tan(field_of_view_xy * 0.5) * vertex_position;
	vec2 img_plane_pos = field_of_view_half_tan * vertex_position;

	v2f_ray_origin = camera_position;
	v2f_ray_direction = 
		axis_x * img_plane_pos.x 
		+ axis_y * img_plane_pos.y 
		+ axis_forward * 1.;
	// direction will be normalized in frag shader

	gl_Position = vec4(vertex_position, 0., 1.);
}
