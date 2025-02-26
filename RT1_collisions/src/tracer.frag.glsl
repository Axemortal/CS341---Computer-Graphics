precision highp float;

#define MAX_RANGE 1e6
//#define NUM_REFLECTIONS

//#define NUM_SPHERES
#if NUM_SPHERES != 0
uniform vec4 spheres_center_radius[NUM_SPHERES]; // ...[i] = [center_x, center_y, center_z, radius]
#endif

//#define NUM_PLANES
#if NUM_PLANES != 0
uniform vec4 planes_normal_offset[NUM_PLANES]; // ...[i] = [nx, ny, nz, d] such that dot(vec3(nx, ny, nz), point_on_plane) = d
#endif

//#define NUM_CYLINDERS
struct Cylinder {
	vec3 center;
	vec3 axis;
	float radius;
	float height;
};
#if NUM_CYLINDERS != 0
uniform Cylinder cylinders[NUM_CYLINDERS];
#endif

#define SHADING_MODE_NORMALS 1
#define SHADING_MODE_BLINN_PHONG 2
#define SHADING_MODE_PHONG 3
//#define SHADING_MODE

// materials
//#define NUM_MATERIALS
struct Material {
	vec3 color;
	float ambient;
	float diffuse;
	float specular;
	float shininess;
	float mirror;
};
uniform Material materials[NUM_MATERIALS];
#if (NUM_SPHERES != 0) || (NUM_PLANES != 0) || (NUM_CYLINDERS != 0)
uniform int object_material_id[NUM_SPHERES + NUM_PLANES + NUM_CYLINDERS];
#endif

/*
	Get the material corresponding to mat_id from the list of materials.
*/
Material get_material(int mat_id) {
	Material m = materials[0];
	for(int mi = 1; mi < NUM_MATERIALS; mi++) {
		if(mi == mat_id) {
			m = materials[mi];
		}
	}
	return m;
}

// lights
//#define NUM_LIGHTS
struct Light {
	vec3 color;
	vec3 position;
};
#if NUM_LIGHTS != 0
uniform Light lights[NUM_LIGHTS];
#endif
uniform vec3 light_color_ambient;

varying vec3 v2f_ray_origin;
varying vec3 v2f_ray_direction;

/*
	Solve the quadratic a*x^2 + b*x + c = 0. The method returns the number of solutions and store them
	in the argument solutions.
*/
int solve_quadratic(float a, float b, float c, out vec2 solutions) {

	// Linear case: bx+c = 0
	if(abs(a) < 1e-12) {
		if(abs(b) < 1e-12) {
			// no solutions
			return 0;
		} else {
			// 1 solution: -c/b
			solutions[0] = -c / b;
			return 1;
		}
	} else {
		float delta = b * b - 4. * a * c;

		if(delta < 0.) {
			// no solutions in real numbers, sqrt(delta) produces an imaginary value
			return 0;
		} 

		// Avoid cancellation:
		// One solution doesn't suffer cancellation:
		//      a * x1 = 1 / 2 [-b - bSign * sqrt(b^2 - 4ac)]
		// "x2" can be found from the fact:
		//      a * x1 * x2 = c

		// We do not use the sign function, because it returns 0
		// float a_x1 = -0.5 * (b + sqrt(delta) * sign(b));
		float sqd = sqrt(delta);
		if(b < 0.) {
			sqd = -sqd;
		}
		float a_x1 = -0.5 * (b + sqd);

		solutions[0] = a_x1 / a;
		solutions[1] = c / a_x1;

		// 2 solutions
		return 2;
	}
}

/*
	Check for intersection of the ray with a given sphere in the scene.
*/
bool ray_sphere_intersection(
	vec3 ray_origin,
	vec3 ray_direction,
	vec3 sphere_center,
	float sphere_radius,
	out float t,
	out vec3 normal
) {
	vec3 oc = ray_origin - sphere_center;

	vec2 solutions; // solutions will be stored here

	int num_solutions = solve_quadratic(
		// A: t^2 * ||d||^2 = dot(ray_direction, ray_direction) but ray_direction is normalized
	1., 
		// B: t * (2d dot (o - c))
	2. * dot(ray_direction, oc),	
		// C: ||o-c||^2 - r^2				
	dot(oc, oc) - sphere_radius * sphere_radius,
		// where to store solutions
	solutions);

	// result = distance to collision
	// MAX_RANGE means there is no collision found
	t = MAX_RANGE + 10.;
	bool collision_happened = false;

	if(num_solutions >= 1 && solutions[0] > 0.) {
		t = solutions[0];
	}

	if(num_solutions >= 2 && solutions[1] > 0. && solutions[1] < t) {
		t = solutions[1];
	}

	if(t < MAX_RANGE) {
		vec3 intersection_point = ray_origin + ray_direction * t;
		normal = (intersection_point - sphere_center) / sphere_radius;

		return true;
	} else {
		return false;
	}
}

/*
	Check for intersection of the ray with a given plane in the scene.
*/
bool ray_plane_intersection(
	vec3 ray_origin,
	vec3 ray_direction,
	vec3 plane_normal,
	float plane_offset,
	out float t,
	out vec3 normal
) {
	/** #TODO RT1.1:
	The plane is described by its normal vec3(nx, ny, nz) and an offset b.
	Point x belongs to the plane iff `dot(normal, x) = b`.

	- Compute the intersection between the ray and the plane
		- If the ray and the plane are parallel there is no intersection
		- Otherwise, compute intersection data and store it in `normal`, and `t` (distance along ray until intersection).
	- Return whether there is an intersection in front of the viewer (t > 0)
	*/

	// can use the plane center if you need it
	vec3 plane_center = plane_normal * plane_offset;
	t = MAX_RANGE + 10.;  // corresponds to no intersection, to be updated if one is found
	// Equation of the ray = o + t * d
	// Equation of the plane = dot(x, n_p) = b
	// Ray intersects the plane if dot(o + t * d, n_p) = b
	// t = (b - dot(o, n_p)) / dot(d, n_p)

	// If the ray is parallel to the plane, there is no intersection
	if(dot(ray_direction, plane_normal) == 0.) {
		return false;
	}

	t = (plane_offset - dot(ray_origin, plane_normal)) / dot(ray_direction, plane_normal);
	if(t <= 0.) {
		return false;
	}

	// We want the normal to point towards the camera
	if(dot(ray_direction, plane_normal) > 0.) {
		normal = -plane_normal;
	} else {
		normal = plane_normal;
	}

	// There is an intersection
	return true;
}

/*
	Check for intersection of the ray with a given cylinder in the scene.
*/
bool ray_cylinder_intersection(
	vec3 ray_origin,
	vec3 ray_direction,
	Cylinder cyl,
	out float t,
	out vec3 normal
) {
	/** #TODO RT1.2.2: 
	- Compute the first valid intersection between the ray and the cylinder
		(valid means in front of the viewer: t > 0)
	- Store the intersection point in `intersection_point`
	- Store the ray parameter in `t`
	- Store the normal at intersection_point in `normal`
	- Return whether there is an intersection with t > 0
	*/

	vec3 intersection_point;
	t = MAX_RANGE + 10.;

	return false;
}

/*
	Check for intersection of the ray with any object in the scene.
*/
bool ray_intersection(
	vec3 ray_origin,
	vec3 ray_direction,
	out float col_distance,
	out vec3 col_normal,
	out int material_id
) {
	col_distance = MAX_RANGE + 10.;
	col_normal = vec3(0., 0., 0.);

	float object_distance;
	vec3 object_normal;

	// Check for intersection with each sphere
	#if NUM_SPHERES != 0 // only run if there are spheres in the scene
	for(int i = 0; i < NUM_SPHERES; i++) {
		bool b_col = ray_sphere_intersection(ray_origin, ray_direction, spheres_center_radius[i].xyz, spheres_center_radius[i][3], object_distance, object_normal);

		// choose this collision if its closer than the previous one
		if(b_col && object_distance < col_distance) {
			col_distance = object_distance;
			col_normal = object_normal;
			material_id = object_material_id[i];
		}
	}
	#endif

	// Check for intersection with each plane
	#if NUM_PLANES != 0 // only run if there are planes in the scene
	for(int i = 0; i < NUM_PLANES; i++) {
		bool b_col = ray_plane_intersection(ray_origin, ray_direction, planes_normal_offset[i].xyz, planes_normal_offset[i][3], object_distance, object_normal);

		// choose this collision if its closer than the previous one
		if(b_col && object_distance < col_distance) {
			col_distance = object_distance;
			col_normal = object_normal;
			material_id = object_material_id[NUM_SPHERES + i];
		}
	}
	#endif

	// Check for intersection with each cylinder
	#if NUM_CYLINDERS != 0 // only run if there are cylinders in the scene
	for(int i = 0; i < NUM_CYLINDERS; i++) {
		bool b_col = ray_cylinder_intersection(ray_origin, ray_direction, cylinders[i], object_distance, object_normal);

		// choose this collision if its closer than the previous one
		if(b_col && object_distance < col_distance) {
			col_distance = object_distance;
			col_normal = object_normal;
			material_id = object_material_id[NUM_SPHERES + NUM_PLANES + i];
		}
	}
	#endif

	return col_distance < MAX_RANGE;
}

/*
	Return the color at an intersection point given a light and a material, exluding the contribution
	of potential reflected rays.
*/
vec3 lighting(
	vec3 object_point,
	vec3 object_normal,
	vec3 direction_to_camera,
	Light light,
	Material mat
) {

	#if SHADING_MODE == SHADING_MODE_PHONG
	#endif

	#if SHADING_MODE == SHADING_MODE_BLINN_PHONG
	#endif

	return mat.color;
}

/*
Render the light in the scene using ray-tracing!
*/
vec3 render_light(vec3 ray_origin, vec3 ray_direction) {

	vec3 pix_color = vec3(0.);

	float col_distance;
	vec3 col_normal = vec3(0.);
	int mat_id = 0;
	if(ray_intersection(ray_origin, ray_direction, col_distance, col_normal, mat_id)) {
		Material m = get_material(mat_id);
		pix_color = m.color;

		#if NUM_LIGHTS != 0
		// for(int i_light = 0; i_light < NUM_LIGHTS; i_light++) {
		// // do something for each light lights[i_light]
		// }
		#endif
	}

	return pix_color;
}

/*
	Draws the normal vectors of the scene in false color.
*/
vec3 render_normals(vec3 ray_origin, vec3 ray_direction) {
	float col_distance;
	vec3 col_normal = vec3(0.);
	int mat_id = 0;

	if(ray_intersection(ray_origin, ray_direction, col_distance, col_normal, mat_id)) {
		return 0.5 * (col_normal + 1.0);
	} else {
		vec3 background_color = vec3(0., 0., 1.);
		return background_color;
	}
}

void main() {
	vec3 ray_origin = v2f_ray_origin;
	vec3 ray_direction = normalize(v2f_ray_direction);

	vec3 pix_color = vec3(0.);

	#if SHADING_MODE == SHADING_MODE_NORMALS
	pix_color = render_normals(ray_origin, ray_direction);
	#else
	pix_color = render_light(ray_origin, ray_direction);
	#endif

	gl_FragColor = vec4(pix_color, 1.);
}
