
<<<<<<< HEAD
import { createREGL } from "../lib/regljs_2.1.0/regl.module.js"

import { vec2, vec3, vec4, mat3, mat4 } from "../lib/gl-matrix_3.3.0/esm/index.js"

import { DOM_loaded_promise } from "./icg_web.js"
import { deg_to_rad, mat4_to_string, vec_to_string, mat4_matmul_many } from "./icg_math.js"
=======
import {createREGL} from "../lib/regljs_2.1.0/regl.module.js"

import {vec2, vec3, vec4, mat3, mat4} from "../lib/gl-matrix_3.3.0/esm/index.js"

import {DOM_loaded_promise} from "./icg_web.js"
import {deg_to_rad, mat4_to_string, vec_to_string, mat4_matmul_many} from "./icg_math.js"
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879


async function main() {
	/* `const` in JS means the variable will not be bound to a new value, but the value can be modified (if its an object or array)
		https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
	*/
	// Canvas is the element on which we draw 
	const canvas_elem = document.getElementsByTagName('canvas')[0]
	// debug_text is a box in which we display some text in real time 
	const debug_text = document.getElementById('debug-text')

	// Resize canvas to fit the window, but keep it square.
	function resize_canvas() {
		const s = Math.min(window.innerHeight, window.innerWidth) - 10;
		canvas_elem.width = s
		canvas_elem.height = s
	}
	resize_canvas();
	window.addEventListener('resize', resize_canvas)

	// We are using the REGL library to work with webGL
	// http://regl.party/api
	// https://github.com/regl-project/regl/blob/master/API.md
	const regl = createREGL(canvas_elem, {
		profile: true, // if we want to measure the size of buffers/textures in memory
	})


	/*---------------------------------------------------------------
		GPU pipeline
	---------------------------------------------------------------*/
	// Define the GPU pipeline used to draw a triangle, vertex positions are translated by an offset.
	const draw_triangle_with_offset = regl({
		// Vertex attributes
		attributes: {
			// 3 vertices with 2 coordinates each
			position: [
				[0, 0.2],
				[-0.2, -0.2],
				[0.2, -0.2],
			],
		},
		// Triangles (faces), as triplets of vertex indices
		elements: [
			[0, 1, 2],
		],

		// Uniforms: global data available to the shader
		uniforms: {
			/* regl.prop('something') means that the data is passed during the draw call, for example:
				draw_triangle_with_offset({
					mouse_offset: ....,
					color: ....,
				})
			*/
			mouse_offset: regl.prop('mouse_offset'),
			color: regl.prop('color'),
<<<<<<< HEAD
		},
=======
		},	
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879

		/* 
		Vertex shader program
		Given vertex attributes, it calculates the position of the vertex on screen
		and intermediate data ("varying") passed on to the fragment shader
		*/
		vert: /*glsl*/`
		// Vertex attributes, specified in the "attributes" entry of the pipeline
		attribute vec2 position;
				
		// Global variables specified in "uniforms" entry of the pipeline
		uniform vec2 mouse_offset;

		void main() {
			// #TODO GL1.1.1.1 Edit the vertex shader to apply mouse_offset translation to the vertex position.
			// We have to return a vec4, because homogenous coordinates are being used.
<<<<<<< HEAD
			vec2 new_position = position + mouse_offset;
			gl_Position = vec4(new_position, 0, 1);
		}`,

=======
			gl_Position = vec4(position + mouse_offset, 0, 1);
		}`,
			
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
		/* 
		Fragment shader program
		Calculates the color of each pixel covered by the mesh.
		The "varying" values are interpolated between the values given by the vertex shader on the vertices of the current triangle.
		*/
		frag: /*glsl*/`
		precision mediump float;
		
		uniform vec3 color;

		void main() {
			gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
		}`,
	})

	// Define the GPU pipeline used to draw a triangle, a transformation matrix is applied to the vertex positions.
	const draw_triangle_with_transform = regl({
		// Vertex attributes
		attributes: {
			// 3 vertices with 2 coordinates each
			position: [
				[0, 0.2],
				[-0.2, -0.2],
				[0.2, -0.2],
			],
		},
		// Triangles (faces), as triplets of vertex indices
		elements: [
			[0, 1, 2],
		],

		vert: /*glsl*/`
		// Vertex attributes, specified in the "attributes" entry of the pipeline
		attribute vec2 position;
				
		// Global variables specified in "uniforms" entry of the pipeline
		uniform mat4 mat_transform;

		void main() {
			// #TODO GL1.1.2.1 Edit the vertex shader to apply mat_transform to the vertex position.
<<<<<<< HEAD
			gl_Position = mat_transform * vec4(position, 0.0, 1.0);

		}`,

=======
			gl_Position = mat_transform * vec4(position, 0, 1);
		}`,
		
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
		frag: /*glsl*/`
		precision mediump float;
		
		uniform vec3 color;

		void main() {
			gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
		}`,

		// Uniforms: global data available to the shader
		uniforms: {
			mat_transform: regl.prop('mat_transform'),
			color: regl.prop('color'),
<<<<<<< HEAD
		},
=======
		},	
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
	})

	/*---------------------------------------------------------------
		Drag with mouse
	---------------------------------------------------------------*/
	/* `const` in JS means the variable will not be bound to a new value, but the value can be modified (if its an object or array)
		https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
		Here we keep the same array but change the numerical values inside.
	*/
	const mouse_offset = [0, 0];

	// Register the functions to be executed when the mouse moves
	canvas_elem.addEventListener('mousemove', (event) => {
		// if left or middle button is pressed
		if (event.buttons & 1 || event.buttons & 4) {
			// The GPU coordinate frame is from bottom left [-1, -1] to top right [1, 1].
			// therefore the scale from pixels to canvas is  2 / [width, height] and we have to invert Y because pixel offsets are counted from the top-left corner.
			mouse_offset[0] += 2 * event.movementX / canvas_elem.clientWidth
			mouse_offset[1] += -2 * event.movementY / canvas_elem.clientHeight

			/*
			This handler function has access to the mouse_offset variable from its closure:
			https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
			*/
		}
	})


	/*---------------------------------------------------------------
		Render frame
	---------------------------------------------------------------*/
	const color_red = [1.0, 0.3, 0.2]
	const color_green = [0.5, 1.0, 0.2]
	const color_blue = [0.2, 0.5, 1.0]

	// Matrices allocated for reuse, you do not have to use them
	const mat_transform = mat4.create()
	const mat_rotation = mat4.create()
	const mat_translation = mat4.create()


	// Function run to render a new frame
	// This is the "arrow" syntax of defining a function https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
	regl.frame((frame) => {
		const sim_time = frame.time;

		// Set the whole image to black
<<<<<<< HEAD
		regl.clear({ color: [0, 0, 0, 1] })


		// #TODO GL1.1.1.2 Draw the blue triangle translated by mouse_offset

=======
		regl.clear({color: [0, 0, 0, 1]})


		// #TODO GL1.1.1.2 Draw the blue triangle translated by mouse_offset
		
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
		draw_triangle_with_offset({
			mouse_offset: mouse_offset,
			color: color_blue,
		});

		/*
		#TODO GL1.1.2.2
			Construct a translation matrix for vector [0.5, 0, 0], 
			and a rotation around Z for angle (time * 30 deg). 
			Multiply the matrices in appropriate order and call the pipeline to obtain:
<<<<<<< HEAD
				* a green triangle orbiting the center point
				* a red triangle spinning at [0.5, 0, 0]
			You do not have to apply the mouse_offset to them.
		*/
		mat4.fromTranslation(mat_translation, [0.5, 0, 0]);
		mat4.fromZRotation(mat_rotation, sim_time * 30 * (Math.PI / 180));

		mat4_matmul_many(mat_transform, mat_rotation, mat_translation);
		draw_triangle_with_transform({
			mat_transform: mat_transform,
			color: color_green,
		});

		mat4_matmul_many(mat_transform, mat_translation, mat_rotation);
		draw_triangle_with_transform({
			mat_transform: mat_transform,
			color: color_red,
		});

=======
    			* a green triangle orbiting the center point
				* a red triangle spinning at [0.5, 0, 0]
			You do not have to apply the mouse_offset to them.
		*/

		// Construct a translation matrix for vector [0.5, 0, 0]
		mat4.fromTranslation(mat_translation, [0.5, 0, 0]);
		// Construct a rotation matrix around Z for angle (time * 30 deg)
		mat4.fromZRotation(mat_rotation, deg_to_rad * sim_time * 30);

		// Green triangle: Orbiting motion (rotate, then translate)
		const mat_orbit = mat4.create();
		mat4.multiply(mat_orbit, mat_rotation, mat_translation);

		// Red triangle: Spins at offset (translate, then rotate)
		const mat_spin = mat4.create();
		mat4.multiply(mat_spin, mat_translation, mat_rotation);

		// Draw the green triangle (orbiting)
		draw_triangle_with_transform({
			mat_transform: mat_orbit,
			color: color_green,
		});

		// Draw the red triangle (spinning)
		draw_triangle_with_transform({
			mat_transform: mat_spin,
			color: color_red,
		});
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
		// You can write whatever you need in the debug box
		debug_text.textContent = `
Hello! Sim time: ${sim_time.toFixed(2)} s | Mouse offset: ${vec_to_string(mouse_offset, 2)}
`
	})
}

// Run the main function when the doument has been loaded, see icg_web.js
DOM_loaded_promise.then(main);
