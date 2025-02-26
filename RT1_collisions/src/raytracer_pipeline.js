import {load_text} from "./icg_web.js"
import {framebuffer_to_image_download} from "./icg_screenshot.js"
import * as vec3 from "../lib/gl-matrix_3.3.0/esm/vec3.js"

const mesh_quad_2d = {
	position: [
		// 4 vertices with 2 coordinates each
		[-1, -1],
		[1, -1],
		[1, 1],
		[-1, 1],
	],
	faces: [
		[0, 1, 2], // top right
		[0, 2, 3], // bottom left
	],
}

export class Raytracer {
	constructor({resolution, scenes}) {
		this.resolution = resolution
		this.scenes = scenes
		this.scenes_by_name = Object.fromEntries(scenes.map((sc) => [sc.name, sc]))
		this.scene_name = null
		this.num_reflections = 2
		this.b_vis_aabb  = false
		this.shading_mode = "Normals"
	}

	shader_inject_defines(shader_src, code_injections) {
		// Find occurences of "//#define NUM_X" in shader code and inject values
		const regexp_var = /\/\/#define ([A-Z_]+)/g
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll#specifying_a_function_as_a_parameter
		return shader_src.replaceAll(regexp_var, (match, varname) => {
			if(varname in code_injections) {
				const var_value = code_injections[varname]
				return `#define ${varname} ${var_value}`
			} else {
				return match // no change
			}
		})
	}

	gen_uniforms_camera(camera) {
		const fovx = camera.fov * Math.PI / 180.
		const fovx_half_tan = Math.tan(0.5 * fovx)
		const fovy_half_tan = fovx_half_tan * this.resolution[1] / this.resolution[0]

		return {
			field_of_view_half_tan: [fovx_half_tan, fovy_half_tan],
			camera_position: camera.position,
			camera_target: camera.target,
			camera_up: vec3.normalize([0, 0, 0], camera.up),
		}
	}

	rt_pipeline_for_scene(scene) {
		const {name, camera, materials, lights, spheres, planes, cylinders, mesh} = scene

		const uniforms = {}
		Object.assign(uniforms, this.gen_uniforms_camera(camera))
		uniforms['light_color_ambient'] = [1.0, 1.0, 1.0]

		const code_injections = {
			'NUM_REFLECTIONS': this.num_reflections,
		}

		// Materials
		const material_id_by_name = {}

		materials.forEach((mat, idx) => {
			material_id_by_name[mat.name] = idx
			uniforms[`materials[${idx}].color`] = mat.color
			uniforms[`materials[${idx}].ambient`] = mat.ambient
			uniforms[`materials[${idx}].diffuse`] = mat.diffuse
			uniforms[`materials[${idx}].specular`] = mat.specular
			uniforms[`materials[${idx}].shininess`] = mat.shininess
			uniforms[`materials[${idx}].mirror`] = mat.mirror
		})
		code_injections['NUM_MATERIALS'] = materials.length.toFixed(0)

		// Lights
		lights.forEach((li, idx) => {
			uniforms[`lights[${idx}].position`] = li.position
			uniforms[`lights[${idx}].color`] = li.color
		})
		code_injections['NUM_LIGHTS'] = lights.length.toFixed(0)
		

		// Store the material of each obejct in a uniform as we go through the lists
		const object_material_id = []
		let num_objects = 0;

		function next_object_material(mat_name) {
			object_material_id[num_objects] = material_id_by_name[mat_name]
			//uniforms[`object_material_id[${num_objects}]`] = material_id_by_name[mat_name]
			num_objects += 1
		}

		// Spheres
		// Array of sphere geometry in uniforms
		spheres.forEach((sph, idx) => {
			uniforms[`spheres_center_radius[${idx}]`] = sph.center.concat(sph.radius)
			
			next_object_material(sph.material)
		})
		// Fill NUM_SPHERES in shader source
		code_injections['NUM_SPHERES'] = spheres.length.toFixed(0)

		// Planes
		// Array of plane geometry in uniforms
		planes.forEach((pl, idx) => {
			const pl_norm = [0., 0., 0.]
			vec3.normalize(pl_norm, pl.normal)
			const pl_offset = vec3.dot(pl_norm, pl.center)
			uniforms[`planes_normal_offset[${idx}]`] = pl_norm.concat(pl_offset)
			
			next_object_material(pl.material)
		})
		// Fill NUM_PLANES in shader source
		code_injections['NUM_PLANES'] = planes.length.toFixed(0)

		// Cylinders
		// Array of cylinder geometry in uniforms
		cylinders.forEach((cyl, idx) => {
			uniforms[`cylinders[${idx}].center`] = cyl.center
			uniforms[`cylinders[${idx}].axis`] = vec3.normalize([0, 0, 0], cyl.axis)
			uniforms[`cylinders[${idx}].radius`] = cyl.radius
			uniforms[`cylinders[${idx}].height`] = cyl.height
			
			next_object_material(cyl.material)
		})
		// Fill NUM_CYLINDERS in shader source
		code_injections['NUM_CYLINDERS'] = cylinders.length.toFixed(0)
		
		const shading_modes = {
			Normals: 'SHADING_MODE_NORMALS',
			Phong: 'SHADING_MODE_PHONG',
			'Blinn Phong': 'SHADING_MODE_BLINN_PHONG',
		}

		if (shading_modes.hasOwnProperty(this.shading_mode)) {
			code_injections['SHADING_MODE'] = shading_modes[this.shading_mode]
		} else {
			throw new Error(`Not Implemented shading mode ${this.shading_mode}`)
		}

		// regl 2.1.0 loads a uniform array all at once
		if(object_material_id.length > 1) {
			uniforms['object_material_id'] = object_material_id
		} else if (object_material_id.length == 1) {
			uniforms['object_material_id[0]'] = object_material_id[0]
		}

		const shader_frag = this.shader_inject_defines(this.resources.tracer_frag, code_injections)
		
		const pipeline_tracer = this.regl({
			// Vertex attributes
			attributes: {
				vertex_position: mesh_quad_2d.position,
			},
			elements: mesh_quad_2d.faces,
				
			// Uniforms: global data available to the shader
			uniforms: uniforms,	
				
			depth: { enable: false },
		
			/* 
			Vertex shader program
			Given vertex attributes, it calculates the position of the vertex on screen
			and intermediate data ("varying") passed on to the fragment shader
			*/
			vert: this.resources.tracer_vert,
				
			/* 
			Fragment shader program
			Calculates the color of each pixel covered by the mesh.
			The "varying" values are interpolated between the values given by the vertex shader on the vertices of the current triangle.
			*/
			frag: shader_frag,

			framebuffer: this.result_framebuffer,
			//viewport: {x:0, y:0, width: result_wh[0], height: result_wh[1]},
		})

		return pipeline_tracer
	}

	async init(regl) {
		this.regl = regl

		// start downloading shader files in parallel
		const resources_downloads = {
			tracer_frag: load_text('./src/tracer.frag.glsl'),
			tracer_vert: load_text('./src/tracer.vert.glsl'),
			show_frag: load_text('./src/show_buffer.frag.glsl'),
			show_vert: load_text('./src/show_buffer.vert.glsl'),
		}

		// texture to store the rendering result (memory region representing an image) 
		this.result_buffer = regl.texture({
			width: this.resolution[0],
			height: this.resolution[1],
			format: 'rgba',
			min: 'linear',
			mag: 'linear',
		})
		
		// a framebuffer directs the output of a GPU draw command to a texture
		this.result_framebuffer = regl.framebuffer({
			color: [this.result_buffer],
			depth: false, stencil: false,
		})

		// wait for the downloads to finish
		this.resources = {}
		for (const [key, download_promise] of Object.entries(resources_downloads)) {
			this.resources[key] = await download_promise
		}

		// pipeline which copies the stored image onto the screen
		this.pipeline_show = regl({
			attributes: {
				vertex_position: mesh_quad_2d.position,
			},
			elements: mesh_quad_2d.faces,
			uniforms: {
				tex: this.result_buffer,
			},
			depth: { enable: false },
			vert: this.resources.show_vert,
			frag: this.resources.show_frag,
		})	
	}

	get_scene_names() {
		return this.scenes.map((s) => s.name)
	}

	async draw_scene({scene_name, num_reflections, shading_mode}) {
		if (num_reflections === undefined || num_reflections < 0) {
			num_reflections = this.num_reflections
		}

		if (shading_mode === undefined) {
			shading_mode = this.shading_mode
		}

		if (scene_name === undefined) {
			scene_name = this.scene_name
		}

		const scene_def = this.scenes_by_name[scene_name]

		if(! scene_def) {
			console.error(`No scene ${scene_name}`)
			return 
		}

		if(scene_name != this.scene_name || num_reflections != this.num_reflections || shading_mode != this.shading_mode) {
			this.scene_name = scene_name
			this.num_reflections = num_reflections
			this.shading_mode = shading_mode

			const pipe = this.rt_pipeline_for_scene(scene_def)
			
			pipe()

			pipe.destroy()

			this.regenerate_view()
		}
	}

	regenerate_view() {
		this.regen_needed = true

		requestAnimationFrame(() => {
			if(this.regen_needed) {
				// display the result on the canvas
				this.regl.poll()
				this.pipeline_show()

				this.regen_needed = false
			}
		})
	}

	saved_image_suffix() {
		return '_' + this.shading_mode.replace(' ', '')
	}

	save_image() {
		framebuffer_to_image_download(this.regl, this.result_framebuffer, `${this.scene_name}${this.saved_image_suffix()}.png`)
	}
}

