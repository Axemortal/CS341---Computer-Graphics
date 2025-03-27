
import {createREGL} from "../lib/regljs_2.1.0/regl.module.js"
import {vec2, vec3, vec4, mat3, mat4} from "../lib/gl-matrix_3.3.0/esm/index.js"
import {quat} from "../lib/gl-matrix_3.3.0/esm/index.js"

import {DOM_loaded_promise, load_text, register_keyboard_action} from "./icg_web.js"
import {deg_to_rad, mat4_to_string, vec_to_string, mat4_matmul_many} from "./icg_math.js"


import {SysRenderTextured, SysRenderMirror, SysRenderMeshesWithLight} from "./mesh_render.js"

import {create_choice_menu} from "./menu.js"
import { create_scene_content_reflections, create_scene_content_shadows, load_resources } from "./scene.js"


function sys_orbit(scene_info) {

	const {sim_time} = scene_info
	const q = quat.create()

	for(const actor of scene_info.actors) {
		const {orbit} = actor

		if ( orbit ) {
			quat.setAxisAngle(q, orbit.axis, orbit.angular_velocity * sim_time)
			vec3.transformQuat(actor.translation, [orbit.radius, 0, 0], q)
			vec3.add(actor.translation, actor.translation, orbit.anchor)
		}
	}
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
		extensions: ['OES_texture_float', 'OES_texture_float_linear',  'WEBGL_color_buffer_float',
			'OES_vertex_array_object', 'OES_element_index_uint'
		],
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
	let is_paused = false
	register_keyboard_action('p', () => is_paused = !is_paused);

	// Pause
	let vis_cubemap = true
	register_keyboard_action('c', () => vis_cubemap = !vis_cubemap);

	// mode
	let render_mode = 'Reflections'
	create_choice_menu(
		document.getElementById('menu-mode'),
		['Reflections', 'Shadows'],
		(mode) => {
			console.log('Set shading mode', mode)
			render_mode = mode
		},
		true, // use url
	)

	// Predefined views
	register_keyboard_action('0', () => {
		console.log('[' + frame_info.mat_view.join(', ') + ']')
		console.log(frame_info)
	})
	const set_predef_view_1 = () => {
		is_paused = true

		frame_info.sim_time = 1.
		frame_info.cam_angle_z = -2.731681469282041
		frame_info.cam_angle_y = 
		-0.4785987755982989
		frame_info.cam_distance_factor = 1.4693280768000003
		
		mat4.set(frame_info.mat_turntable, 0.3985278716916164, -0.42238331447052535, 0.8141055651092455, 0, 0.9171562219627312, 0.18353636962060468, -0.3537497216133721, 0, 0, 0.8876411080405088, 0.4605358436827886, 0, 0, 0, -22.039921152000005, 1)
	}
	register_keyboard_action('1', set_predef_view_1)
	register_keyboard_action('2', () => {
		is_paused = true

		frame_info.sim_time = 2.
		frame_info.cam_angle_z = -3.911681469282042
		frame_info.cam_angle_y = -0.8785987755983002
		frame_info.cam_distance_factor = 1.1664

		mat4.set(frame_info.mat_turntable,-0.6961989976147306, -0.5526325769705245, 0.4581530209342307, 0, 0.7178488390463861, -0.5359655476314885, 0.4443354318888313, 0, 0, 0.6382304964689449, 0.7698453308145761, 0, 0, 0, -17.496000000000002, 1)
	})
	register_keyboard_action('3', () => {

		frame_info.sim_time = 3.
		frame_info.cam_angle_z = -5.7766814692820505
		frame_info.cam_angle_y = -1.0585987755983004
		frame_info.cam_distance_factor = 1.

		mat4.set(frame_info.mat_turntable, -0.485123013297449, 0.7622279286347869, -0.4285606687253571, 0, -0.8744459171207806, -0.4228669861897321, 0.23775586222343667, 0, 0, 0.49009396731640664, 0.8716696066744928, 0, 0, 0, -15, 1)
	})



	/*---------------------------------------------------------------
		Scene and systems
	---------------------------------------------------------------*/

	// Resources and scene 
	const resources = await load_resources(regl)	

	const scenes = {
		Reflections: create_scene_content_reflections(),
		Shadows: create_scene_content_shadows(),
	}

	// Systems

	const sys_render_unshaded = new SysRenderTextured(regl, resources)
	sys_render_unshaded.check_scene(scenes.Reflections)
	sys_render_unshaded.init()

	const sys_render_mirror = new SysRenderMirror(regl, resources)
	sys_render_mirror.init()

	const sys_render_light = new SysRenderMeshesWithLight(regl, resources)
	sys_render_light.init()

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
	}

	/*---------------------------------------------------------------
		Camera
	---------------------------------------------------------------*/
	const cam_distance_base = 15.

	function update_cam_transform(frame_info) {
		const {cam_angle_z, cam_angle_y, cam_distance_factor} = frame_info

		/* TODO GL3.0
		Copy turntable camera from GL2
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
	is_paused = false

	/*---------------------------------------------------------------
		Render loop
	---------------------------------------------------------------*/

	let prev_regl_time = 0

	regl.frame((frame) => {

		const {mat_view, mat_projection, mat_turntable, light_position_cam, light_position_world, camera_position} = frame_info

		const scene_info = scenes[render_mode]

		if (! is_paused) {
			const dt = frame.time - prev_regl_time
			frame_info.sim_time += dt
		}
		scene_info.sim_time = frame_info.sim_time
		prev_regl_time = frame.time

		// Calculate view matrix, view centered on chosen planet
		mat4.perspective(mat_projection, 
			deg_to_rad * 60, // fov y
			frame.framebufferWidth / frame.framebufferHeight, // aspect ratio
			0.01, // near
			512, // far
		)
		mat4.copy(mat_view, mat_turntable)

		// Calculate light position in camera frame
		//vec3.transformMat4(light_position_cam, light_position_world, mat_view)

		// Set the whole image to black
		regl.clear({color: [0, 0, 0, 1]});

		sys_orbit(scene_info)

		if(render_mode == 'Reflections') {
			// We need to render the scene several times:
			// to capture the cubemap, and to render the scene onto the screen
			const render_scene_func = (frame_info, scene_info) => {
				sys_render_unshaded.render(frame_info, scene_info)
			}

			// Draw scene to screen
			render_scene_func(frame_info, scene_info)

			// Reflections: draw reflecting objects
			sys_render_mirror.render(frame_info, scene_info, render_scene_func)

			// Reflections: visualize cubemap
			if (vis_cubemap) {
				sys_render_mirror.env_capture.visualize()
			}

		} else if (render_mode == 'Shadows') {

			sys_render_light.render(frame_info, scene_info)

			if(vis_cubemap) {
				sys_render_light.env_capture.visualize()
			}
		}

		debug_text.textContent = `
`;
	})
}

DOM_loaded_promise.then(main);
