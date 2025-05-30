<<<<<<< HEAD
import { vec2, vec3, vec4, mat3, mat4 } from "../lib/gl-matrix_3.3.0/esm/index.js"
import { mat4_matmul_many } from "./icg_math.js"
=======
import {vec2, vec3, vec4, mat3, mat4} from "../lib/gl-matrix_3.3.0/esm/index.js"
import {mat4_matmul_many} from "./icg_math.js"
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879

/*
	Construct the scene!
*/
export function create_scene_content() {

	const actors = [
		{
			name: 'sun',
			size: 2.5,
			rotation_speed: 0.1,
<<<<<<< HEAD

			movement_type: 'planet',
			orbit: null,

			shader_type: 'unshaded',
=======
			
			movement_type: 'planet',
			orbit: null,

			shader_type: 'unshaded', 
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
			texture_name: 'sun.jpg',
		},
		{
			name: 'earth',
			size: 1.0,
			rotation_speed: 0.3,

			movement_type: 'planet',
			orbit: 'sun',
			orbit_radius: 6,
			orbit_speed: 0.05,
			orbit_phase: 1.7,

			shader_type: 'unshaded',
			texture_name: 'earth_day.jpg',
		},
		{
			name: 'moon',
			size: 0.25,
			rotation_speed: 0.3,

			movement_type: 'planet',
			orbit: 'earth',
			orbit_radius: 2.5,
			orbit_speed: 0.4,
			orbit_phase: 0.5,

			shader_type: 'unshaded',
			texture_name: 'moon.jpg',

		},
		{
			name: 'mars',
			size: 0.75,
			rotation_speed: 0.7,

			movement_type: 'planet',
			orbit: 'sun',
			orbit_radius: 10.0,
			orbit_speed: 0.1,
			orbit_phase: 0.1,

			shader_type: 'unshaded',
			texture_name: 'mars.jpg',
		}
	]

	// In each planet, allocate its transformation matrix
<<<<<<< HEAD
	for (const actor of actors) {
=======
	for(const actor of actors) {
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
		actor.mat_model_to_world = mat4.create()
	}

	// Lookup of actors by name
	const actors_by_name = {}
	for (const actor of actors) {
		actors_by_name[actor.name] = actor
	}

	// Construct scene info
	return {
		sim_time: 0.,
		actors: actors,
		actors_by_name: actors_by_name,
	}
}


export class SysOrbitalMovement {

	constructor() {
	}

	calculate_model_matrix(actor, sim_time, actors_by_name) {
<<<<<<< HEAD

		// #TODO GL1.2.3
		// Construct the model matrix for the current planet (actor) and store it in actor.mat_model_to_world.

		const M_orbit = mat4.create();
		const M_spin = mat4.create();
		const M_scale = mat4.create();

		if (actor.orbit === null) {
			mat4.identity(M_orbit)
		} else {
			const parent = actors_by_name[actor.orbit]
			const parent_translation_v = mat4.getTranslation([0, 0, 0], parent.mat_model_to_world)
			const radius = actor.orbit_radius
			const angle = sim_time * actor.orbit_speed + actor.orbit_phase
			const x = radius * Math.cos(angle)
			const y = radius * Math.sin(angle)
			mat4.fromTranslation(M_orbit, [x, y, 0])
			mat4.translate(M_orbit, M_orbit, parent_translation_v)
		}

		mat4.fromZRotation(M_spin, sim_time * actor.rotation_speed);

		const scale = actor.size
		mat4.fromScaling(M_scale, [scale, scale, scale]);

		// Store the combined transform in actor.mat_model_to_world
		mat4_matmul_many(actor.mat_model_to_world, M_orbit, M_spin, M_scale);
=======
		/*
		#TODO GL1.2.3
		Construct the model matrix for the current planet (actor) and store it in actor.mat_model_to_world.
		
		Orbit (if the parent actor.orbit is not null)
			* find the parent planet 
				parent = actors_by_name[actor.orbit]
			* Parent's transform is stored in
				parent.mat_model_to_world
			* Radius of orbit: 
				radius = actor.orbit_radius
			* Angle of orbit:
				angle = sim_time * actor.orbit_speed + actor.orbit_phase

		Spin around the planet's Z axis
			angle = sim_time * actor.rotation_speed (radians)
		
		Scale the unit sphere to match the desired size
			scale = actor.size
			mat4.fromScaling takes a 3D vector!
		*/

		//const M_orbit = mat4.create();
		// Create the local transformation: spin then scale
		const M_local = mat4.create();
		mat4.identity(M_local);
		// Scale the unit sphere to desired size first
		mat4.scale(M_local, M_local, [actor.size, actor.size, actor.size]);
		// Then apply spin around Z: angle = sim_time * actor.rotation_speed
		mat4.rotateZ(M_local, M_local, sim_time * actor.rotation_speed);

		if (actor.orbit !== null) {
			// Retrieve parent's model matrix from which we extract its translation
			const parent = actors_by_name[actor.orbit];
			const parentTranslation = vec3.create();
			mat4.getTranslation(parentTranslation, parent.mat_model_to_world);
			// Create a translation matrix from the parent's translation
			const T_parent = mat4.fromTranslation(mat4.create(), parentTranslation);
		
			// Compute orbit parameters:
			// Orbit angle: sim_time * actor.orbit_speed + actor.orbit_phase
			const orbit_angle = sim_time * actor.orbit_speed + actor.orbit_phase;
			// Create the orbit translation matrix in the XY plane
			const T_orbit = mat4.fromTranslation(mat4.create(), [
			  actor.orbit_radius * Math.cos(orbit_angle),
			  actor.orbit_radius * Math.sin(orbit_angle),
			  0
			]);
		
			// Compose the final model matrix as:
			// actor.mat_model_to_world = T_parent * T_orbit * M_local
			const M = mat4.create();
			mat4.multiply(M, T_parent, T_orbit); // first apply parent's translation then orbit translation
			mat4.multiply(M, M, M_local);         // then apply the local (scale and spin) transformation
			mat4.copy(actor.mat_model_to_world, M);
		  } else {
			// If there's no parent, the model matrix is just the local transformation
			mat4.copy(actor.mat_model_to_world, M_local);
		  }
		
		// Store the combined transform in actor.mat_model_to_world
		//mat4_matmul_many(actor.mat_model_to_world, ...);
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
	}

	simulate(scene_info) {

<<<<<<< HEAD
		const { sim_time, actors, actors_by_name } = scene_info

		// Iterate over actors which have planet movement type
		for (const actor of actors) {
			if (actor.movement_type === 'planet') {
=======
		const {sim_time, actors, actors_by_name} = scene_info

		// Iterate over actors which have planet movement type
		for(const actor of actors) {
			if ( actor.movement_type === 'planet' ) {
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
				this.calculate_model_matrix(actor, sim_time, actors_by_name)
			}
		}
	}

}

/*
	Draw the actors with 'unshaded' shader_type
*/
export class SysRenderPlanetsUnshaded {

	constructor(regl, resources) {

		const mesh_uvsphere = resources.mesh_uvsphere

		this.pipeline = regl({
			attributes: {
				position: mesh_uvsphere.vertex_positions,
				tex_coord: mesh_uvsphere.vertex_tex_coords,
			},
			// Faces, as triplets of vertex indices
			elements: mesh_uvsphere.faces,
<<<<<<< HEAD

=======
	
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
			// Uniforms: global data available to the shader
			uniforms: {
				mat_mvp: regl.prop('mat_mvp'),
				texture_base_color: regl.prop('tex_base_color'),
<<<<<<< HEAD
			},

=======
			},	
	
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
			vert: resources['unshaded.vert.glsl'],
			frag: resources['unshaded.frag.glsl'],
		})

		// Keep a reference to textures
		this.resources = resources
	}

	render(frame_info, scene_info) {
		/* 
		We will collect all objects to draw with this pipeline into an array
		and then run the pipeline on all of them.
		This way the GPU does not need to change the active shader between objects.
		*/
		const entries_to_draw = []

		// Read frame info
<<<<<<< HEAD
		const { mat_projection, mat_view } = frame_info

		// For each planet, construct information needed to draw it using the pipeline
		for (const actor of scene_info.actors) {
=======
		const {mat_projection, mat_view} = frame_info
	
		// For each planet, construct information needed to draw it using the pipeline
		for( const actor of scene_info.actors ) {
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879

			// Choose only planet using this shader
			if (actor.shader_type === 'unshaded') {

				const mat_mvp = mat4.create()

				// #TODO GL1.2.1.2
				// Calculate mat_mvp: model-view-projection matrix	
<<<<<<< HEAD
				mat4_matmul_many(mat_mvp, mat_projection, mat_view, actor.mat_model_to_world)
=======
				mat4.multiply(mat_mvp, mat_view, actor.mat_model_to_world);
				mat4.multiply(mat_mvp, mat_projection, mat_mvp);
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879

				entries_to_draw.push({
					mat_mvp: mat_mvp,
					tex_base_color: this.resources[actor.texture_name],
<<<<<<< HEAD
				})
=======
				});
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
			}
		}

		// Draw on the GPU
		this.pipeline(entries_to_draw)
	}
}

