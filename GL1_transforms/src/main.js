
import {createREGL} from "../lib/regljs_2.1.0/regl.module.js"
import {vec2, vec3, vec4, mat3, mat4} from "../lib/gl-matrix_3.3.0/esm/index.js"

import {DOM_loaded_promise, load_text, load_texture, register_keyboard_action} from "./icg_web.js"
import {deg_to_rad, mat4_to_string, vec_to_string, mat4_matmul_many} from "./icg_math.js"
import {icg_mesh_make_uv_sphere} from "./icg_mesh.js"
import {SystemRenderGrid} from "./icg_grid.js"
import {SystemRenderFrame} from "./icg_frame.js"

import {create_scene_content, SysOrbitalMovement, SysRenderPlanetsUnshaded} from "./planets.js"


async function load_resources(regl) {
	/*
	The textures fail to load when the site is opened from local file (file://) due to "cross-origin".
	Solutions:
	* run a local webserver
		caddy file-server -browse -listen 0.0.0.0:8000
		# or
		python -m http.server 8000
		# open localhost:8000
	OR
	* run chromium with CLI flag
		"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files index.html
		
	* edit config in firefox
		security.fileuri.strict_origin_policy = false
	*/

	// Start downloads in parallel
	const resource_promises = {}
	
	const textures_to_load = [
		'sun.jpg', 'moon.jpg', 'mars.jpg', 
		'earth_day.jpg', 'earth_night.jpg', 'earth_gloss.jpg',
	]
	for(const tex_name of textures_to_load) {
		resource_promises[tex_name] = load_texture(regl, `./textures/${tex_name}`)
	}
	resource_promises['earth_clouds.jpg'] =  load_texture(regl, `./textures/earth_clouds.jpg`, {wrapS: 'repeat'})


	const shaders_to_load = [
		'unshaded.vert.glsl', 'unshaded.frag.glsl',
		'earth.frag.glsl', 'sun.vert.glsl',
	]
	for(const shader_name of shaders_to_load) {
		resource_promises[shader_name] = load_text(`./src/shaders/${shader_name}`)
	}

	const resources = {}

	// Construct a unit sphere mesh
	// UV sphere https://docs.blender.org/manual/en/latest/modeling/meshes/primitives.html#uv-sphere
	// we create it in code instead of loading from a file
	resources['mesh_uvsphere'] = icg_mesh_make_uv_sphere(15)
	
	// Wait for all downloads to complete
	for (const [key, promise] of Object.entries(resource_promises)) {
		resources[key] = await promise
	}

	return resources
}

async function main() {
	/* const in JS means the variable will not be bound to a new value, but the value can be modified (if its an object or array)
		https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
	*/

	// We are using the REGL library to work with webGL
	// http://regl.party/api
	// https://github.com/regl-project/regl/blob/master/API.md
	const regl = createREGL({
		profile: true, // if we want to measure the size of buffers/textures in memory
	})
	// The <canvas> (HTML element for drawing graphics) was created by REGL, lets take a handle to it.
	const canvas_elem = document.getElementsByTagName('canvas')[0]


	/*---------------------------------------------------------------
		Scene and systems
	---------------------------------------------------------------*/
	const resources = await load_resources(regl)	

	const scene_info = create_scene_content()

	const sys_orbital_movement = new SysOrbitalMovement()

	const sys_render_unshaded = new SysRenderPlanetsUnshaded(regl, resources)

	const sys_render_grid = new SystemRenderGrid(regl, resources)

	const sys_render_frame = new SystemRenderFrame(regl, resources)

	

	/*---------------------------------------------------------------
		Frame info
	---------------------------------------------------------------*/

	const frame_info = {
		sim_time: 0.,

		cam_angle_z: Math.PI * 0.2, // in radians!
		cam_angle_y: -Math.PI / 6, // in radians!
		cam_distance_factor: 1.,
		camera_position: [0, 0, 0],
		mat_turntable: mat4.create(),

		mat_view: mat4.create(),
		mat_projection: mat4.create(),

		// Consider the sun, which locates at [0, 0, 0], as the only light source
		light_position_world: [0, 0, 0, 1],
		light_position_cam: [0, 0, 0, 1],
		light_color: [1.0, 0.941, 0.898],
	}

	/*---------------------------------------------------------------
		Camera
	---------------------------------------------------------------*/
	const cam_distance_base = 15.

	function update_cam_transform(frame_info) {
		const {cam_angle_z, cam_angle_y, cam_distance_factor} = frame_info

		/* TODO GL1.2.2
		Calculate the world-to-camera transformation matrix for turntable camera.
		The camera orbits the scene 
		* cam_distance_base * cam_distance_factor = distance of the camera from the (0, 0, 0) point
		* cam_angle_z - camera ray's angle around the Z axis
		* cam_angle_y - camera ray's angle around the Y axis
		*/

		// Example camera matrix, looking along forward-X, edit this
		const look_at = mat4.lookAt(mat4.create(), 
			[-5, 0, 0], // camera position in world coord
			[0, 0, 0], // view target point
			[0, 0, 1], // up vector
		)
		// Define proper rotation matrices to compute the final camera position.
		// Store the transform in mat_turntable.
		// frame_info.mat_turntable = A * B * ...  // Note: you can use mat4_matmul_many
	}

	update_cam_transform(frame_info)

	// Rotate camera position by dragging with the mouse
	canvas_elem.addEventListener('mousemove', (event) => {
		// if left or middle button is pressed
		if (event.buttons & 1 || event.buttons & 4) {
			frame_info.cam_angle_z += event.movementX*0.005
			frame_info.cam_angle_y += -event.movementY*0.005

			update_cam_transform(frame_info)
		}
	})

	canvas_elem.addEventListener('wheel', (event) => {
		// scroll wheel to zoom in or out
		const factor_mul_base = 1.08
		const factor_mul = (event.deltaY > 0) ? factor_mul_base : 1./factor_mul_base
		frame_info.cam_distance_factor *= factor_mul
		frame_info.cam_distance_factor = Math.max(0.02, Math.min(frame_info.cam_distance_factor, 4))
		// console.log('wheel', event.deltaY, event.deltaMode);
		update_cam_transform(frame_info)
	})

	/*---------------------------------------------------------------
		UI
	---------------------------------------------------------------*/

	// Debug overlay
	const debug_overlay = document.getElementById('debug-overlay')
	const debug_text = document.getElementById('debug-text')
	register_keyboard_action('h', () => debug_overlay.classList.toggle('hidden'))
	
	// Pause
	let is_paused = false;
	register_keyboard_action('p', () => is_paused = !is_paused);

	// Grid, to demonstrate keyboard shortcuts
	let grid_on = true;
	register_keyboard_action('g', () => grid_on = !grid_on);

	// Frame
	let frame_on = false;
	register_keyboard_action('f', () => frame_on = !frame_on);

	// Focusing on selected planet
	let selected_planet_name = 'earth';
	const elem_view_select = document.getElementById('view-select')

	function set_selected_planet(name) {
		console.log('Selecting', name);
		selected_planet_name = name;
		frame_info.cam_distance_factor = 3*scene_info.actors_by_name[name].size / cam_distance_base;
		update_cam_transform(frame_info)
	}

	set_selected_planet('earth');

	for (const name in scene_info.actors_by_name) {
		if (scene_info.actors_by_name.hasOwnProperty(name)) {
			const entry = document.createElement('li');
			entry.textContent = name;
			entry.addEventListener('click', (event) => set_selected_planet(name));
			elem_view_select.appendChild(entry);
		}
	}


	// Predefined views
	register_keyboard_action('1', () => {
		is_paused = true
		grid_on = true
		frame_on = false

		set_selected_planet('earth')

		scene_info.sim_time = 32.0
		frame_info.cam_angle_z = 6.6 * deg_to_rad
		frame_info.cam_angle_y = -16.6 * deg_to_rad
		frame_info.cam_distance_factor = 9.6 / cam_distance_base

		update_cam_transform(frame_info)
	})
	register_keyboard_action('2', () => {
		is_paused = true
		grid_on = true
		frame_on = false

		set_selected_planet('sun')

		scene_info.sim_time = 17.7
		frame_info.cam_angle_z = 19.1 * deg_to_rad
		frame_info.cam_angle_y = -33.2 * deg_to_rad
		frame_info.cam_distance_factor = 18.9 / cam_distance_base

		update_cam_transform(frame_info)
	})
	register_keyboard_action('3', () => {
		is_paused = true
		grid_on = false
		frame_on = false

		set_selected_planet('moon')

		scene_info.sim_time = 18.73
		frame_info.cam_angle_z = -124.1 * deg_to_rad
		frame_info.cam_angle_y = 176.8 * deg_to_rad
		frame_info.cam_distance_factor = 3.2 / cam_distance_base

		update_cam_transform(frame_info)
	})



	/*---------------------------------------------------------------
		Render loop
	---------------------------------------------------------------*/

	let prev_regl_time = 0

	regl.frame((frame) => {

		const {mat_view, mat_projection, mat_turntable, light_position_cam, light_position_world, camera_position} = frame_info

		if (! is_paused) {
			const dt = frame.time - prev_regl_time
			scene_info.sim_time += dt
		}
		frame_info.sim_time = scene_info.sim_time
		prev_regl_time = frame.time;

	
		// Update planet transforms
		sys_orbital_movement.simulate(scene_info)


		// Calculate view matrix, view centered on chosen planet
		{
			mat4.perspective(mat_projection, 
				deg_to_rad * 60, // fov y
				frame.framebufferWidth / frame.framebufferHeight, // aspect ratio
				0.01, // near
				100, // far
			)

			const selected_planet_model_mat = scene_info.actors_by_name[selected_planet_name].mat_model_to_world
			const selected_planet_position = mat4.getTranslation([0, 0, 0], selected_planet_model_mat)
			vec3.scale(selected_planet_position, selected_planet_position, -1);
			const selected_planet_translation_mat = mat4.fromTranslation(mat4.create(), selected_planet_position)
			mat4_matmul_many(mat_view, mat_turntable, selected_planet_translation_mat)
		}

		// Calculate light position in camera frame
		vec4.transformMat4(light_position_cam, light_position_world, mat_view);

		// Calculate camera position and store it in `camera_position`, it will be needed for the billboard
		{
			/*
			Camera is at [0, 0, 0] in camera coordinates.
			mat_view is a transformation from world to camera coordinates.
			The inverse of mat_view is a transformation from camera to world coordinates.
			Transforming [0, 0, 0] from camera to world we obtain the world position of the camera.
				cam_pos = mat_view^-1 * [0, 0, 0]^T
			*/
			const mat_camera_to_world = mat4.invert(mat4.create(), mat_view)

			// Transform [0, 0, 0] from camera to world:
			//const camera_position = vec3.transformMat4([0, 0, 0], [0, 0, 0], mat_view_invert);
			// But the rotation and scale parts of the matrix do no affect [0, 0, 0] so, we can just get the translation, its cheaper:
			mat4.getTranslation(camera_position, mat_camera_to_world)
		}

		// Set the whole image to black
		regl.clear({color: [0, 0, 0, 1]});

		sys_render_unshaded.render(frame_info, scene_info)

		if ( grid_on ) {
			sys_render_grid.render(frame_info, scene_info)
		}

		if ( frame_on ) {
			sys_render_frame.render(frame_info, scene_info)
		}


		debug_text.textContent = `
Hello! Sim time is ${scene_info.sim_time.toFixed(2)} s
Camera: angle_z ${(frame_info.cam_angle_z / deg_to_rad).toFixed(1)}, angle_y ${(frame_info.cam_angle_y / deg_to_rad).toFixed(1)}, distance ${(frame_info.cam_distance_factor*cam_distance_base).toFixed(1)}
cam pos ${vec_to_string(camera_position)}
`;
	})
}

DOM_loaded_promise.then(main);
