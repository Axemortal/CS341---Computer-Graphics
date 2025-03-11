//=============================================================================
//
//   Exercise code for the lecture "Introduction to Computer Graphics"
//     by Prof. Mario Botsch, Bielefeld University
//
//   Copyright (C) by Computer Graphics Group, Bielefeld University
//
//=============================================================================

precision mediump float;

varying vec2 v2f_tex_coord;
varying vec3 v2f_normal; // normal vector in camera coordinates
varying vec3 v2f_dir_to_light; // direction to light source
varying vec3 v2f_dir_from_view; // viewing vector (from eye to vertex in view coordinates)

uniform sampler2D texture_surface_day;
uniform sampler2D texture_surface_night;
uniform sampler2D texture_clouds;
uniform sampler2D texture_gloss;
uniform float sim_time;

uniform vec3  light_color;
uniform float ambient;
uniform float shininess;

void main()
{

	/** TODO 5.3:
    * - Copy your working code from the fragment shader of your Phong shader use it as
    * starting point
    * - instead of using a single texture, use the four texures `texture_surface_day`, `texture_surface_night`,
    * `texture_clouds` and `texture_gloss` and mix them for enhanced effects
    * Hints:
    * - cloud and gloss textures are just greyscales. So you'll just need one color-
    * component.
    * - The texture(texture, 2d_position) returns a 4-vector (rgba). You can use
    * `texture(...).r` to get just the red component or `texture(...).rgb` to get a vec3 color
    * value
    * - use mix(vec3 a,vec3 b, s) = a*(1-s) + b*s for linear interpolation of two colors
     */
	vec3 color_from_texture = texture2D(texture_surface_day, v2f_tex_coord).rgb;
	gl_FragColor = vec4(color_from_texture, 1.); // output: RGBA in 0..1 range
}
