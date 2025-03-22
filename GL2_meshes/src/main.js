
import {createREGL} from "../lib/regljs_2.1.0/regl.module.js"
import {vec2, vec3, vec4, mat3, mat4} from "../lib/gl-matrix_3.3.0/esm/index.js"

import {DOM_loaded_promise, load_text, register_keyboard_action} from "./icg_web.js"
import {icg_mesh_load_obj} from "./icg_mesh.js"
import {deg_to_rad, mat4_to_string, vec_to_string, mat4_matmul_many} from "./icg_math.js"
import {icg_mesh_make_uv_sphere} from "./icg_mesh.js"

import {create_scene_content, SysRenderNormals, SysRenderShadePervertex, SysRenderShadePerpixel} from "./mesh_render.js"

import {create_choice_menu} from "./menu.js"
import { mesh_preprocess } from "./normal_computation.js"

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
	
	const shaders_to_load = [
		'normals.vert.glsl', 'normals.frag.glsl',
		'shade_pervertex.vert.glsl', 'shade_pervertex.frag.glsl',
		'shade_perpixel.vert.glsl', 'shade_perpixel.frag.glsl',
	]
	for(const shader_name of shaders_to_load) {
		resource_promises[shader_name] = load_text(`./src/${shader_name}`)
	}

	const meshes_to_load = [
		"vase1.obj", "cup2.obj", "table.obj", "shadow_scene__terrain.obj", "shadow_scene__wheel.obj",
	]
	for(const mesh_name of meshes_to_load) {
		resource_promises[mesh_name] = icg_mesh_load_obj(`./meshes/${mesh_name}`)
	}

	// Wait for all downloads to complete
	const resources = {}
	for (const [key, promise] of Object.entries(resource_promises)) {
		resources[key] = await promise
	}

	// Compute normals for meshes
	for(const mesh_name of meshes_to_load) {
		resources[mesh_name] = mesh_preprocess(regl, resources[mesh_name])
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
		UI
	---------------------------------------------------------------*/

	// Debug overlay
	const debug_overlay = document.getElementById('debug-overlay')
	const debug_text = document.getElementById('debug-text')
	register_keyboard_action('h', () => debug_overlay.classList.toggle('hidden'))
	
	// Pause
	let is_paused = false;
	register_keyboard_action('p', () => is_paused = !is_paused);

	// mode
	let render_mode = 'Normals'
	create_choice_menu(
		document.getElementById('menu-mode'),
		['Normals', 'Gouraud', 'Phong'],
		(mode) => {
			console.log('Set shading mode', mode)
			render_mode = mode
		},
	)

	// Predefined views
	register_keyboard_action('0', () => {
		console.log('[' + frame_info.mat_view.join(', ') + ']')
		console.log(frame_info)
	})
	const set_predef_view_1 = () => {
		is_paused = true

		frame_info.cam_angle_z = -2.1485987755982956
		frame_info.cam_angle_y = -0.608598775598299
		frame_info.cam_distance_factor = 0.9259259259259242
		
		mat4.set(frame_info.mat_turntable, 0.8376649398689581, -0.31226369034322593, 0.4481169894208038, 0, 0.5461844455074997, 0.4789084485032733, -0.6872621402622531, 0, 0, 0.8204499287862834, 0.5717183872804709, 0, 0, 0, -13.888888888888863, 1)
	}
	register_keyboard_action('1', set_predef_view_1)
	register_keyboard_action('2', () => {
		is_paused = true

		frame_info.cam_angle_z = -3.911681469282042
		frame_info.cam_angle_y = -0.8785987755983002
		frame_info.cam_distance_factor = 1.1664

		mat4.set(frame_info.mat_turntable,-0.6961989976147306, -0.5526325769705245, 0.4581530209342307, 0, 0.7178488390463861, -0.5359655476314885, 0.4443354318888313, 0, 0, 0.6382304964689449, 0.7698453308145761, 0, 0, 0, -17.496000000000002, 1)
	})
	register_keyboard_action('3', () => {
		
		frame_info.cam_angle_z = -5.7766814692820505
		frame_info.cam_angle_y = -1.0585987755983004
		frame_info.cam_distance_factor = 1.

		mat4.set(frame_info.mat_turntable, -0.485123013297449, 0.7622279286347869, -0.4285606687253571, 0, -0.8744459171207806, -0.4228669861897321, 0.23775586222343667, 0, 0, 0.49009396731640664, 0.8716696066744928, 0, 0, 0, -15, 1)
	})



	/*---------------------------------------------------------------
		Scene and systems
	---------------------------------------------------------------*/
	const resources = await load_resources(regl)	





	const scene_info = create_scene_content()

	const sys_render_normals = new SysRenderNormals(regl, resources)
	sys_render_normals.check_scene(scene_info)

	const sys_render_gouraud = new SysRenderShadePervertex(regl, resources)
	
	const sys_render_phong = new SysRenderShadePerpixel(regl, resources)



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
		light_position_world: [10., 0.75, 10.],
		light_position_cam: [0., 0., 0.],
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
		// Store the combined transform in mat_turntable
		// frame_info.mat_turntable = A * B * ...
		mat4_matmul_many(frame_info.mat_turntable, look_at) // edit this
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

	set_predef_view_1()

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

		// Calculate view matrix, view centered on chosen planet
		mat4.perspective(mat_projection, 
			deg_to_rad * 60, // fov y
			frame.framebufferWidth / frame.framebufferHeight, // aspect ratio
			0.01, // near
			100, // far
		)
		mat4.copy(mat_view, mat_turntable)

		// Calculate light position in camera frame
		vec3.transformMat4(light_position_cam, light_position_world, mat_view)

		// Set the whole image to black
		regl.clear({color: [0, 0, 0, 1]});

		if( render_mode === 'Normals' ) {
			sys_render_normals.render(frame_info, scene_info)
		} else if ( render_mode === 'Gouraud' ) {
			sys_render_gouraud.render(frame_info, scene_info)
		} else if ( render_mode === 'Phong' ) {
			sys_render_phong.render(frame_info, scene_info)
		}


		debug_text.textContent = `
`;
	})
}

DOM_loaded_promise.then(main);
