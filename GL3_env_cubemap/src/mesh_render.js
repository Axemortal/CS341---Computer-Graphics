import {vec2, vec3, vec4, mat3, mat4} from "../lib/gl-matrix_3.3.0/esm/index.js"
import {mat4_matmul_many} from "./icg_math.js"
import { EnvironmentCapture } from "./env_capture.js"

/*
	Draw meshes with a simple pipeline
	Subclasses override the name of shader to use
*/
class SysRenderMeshes {
	static shader_name = 'ENTER SHADER NAME'

	constructor(regl, resources) {
		// Keep a reference to textures
		this.resources = resources
		this.regl = regl
	}

	get_resource_checked(shader_name) {
		const shader_text = this.resources[shader_name]
		if (shader_text === undefined) {
			throw new ReferenceError(`No resource ${shader_name}`)
		}
		return shader_text
	}

	init() {
		this.init_pipeline(this.regl)
	}

	pipeline_uniforms(regl) {
		return {
			mat_mvp: regl.prop('mat_mvp'),
			mat_model_view: regl.prop('mat_model_view'),
			mat_normals_to_view: regl.prop('mat_normals_to_view'),

			light_position: regl.prop('light_position'),
			light_color: regl.prop('light_color'),

			tex_color: regl.prop('material.texture'),
			
			color_factor: 1.,
		}
	}

	init_pipeline(regl) {
		const shader_name = this.constructor.shader_name

		console.log('Compiling shaders: ', shader_name)

		this.pipeline = regl({
			attributes: {
				vertex_position: regl.prop('mesh.vertex_positions'),
				vertex_normal: regl.prop('mesh.vertex_normals'),
				vertex_tex_coords: regl.prop('mesh.vertex_tex_coords'),
			},
			// Faces, as triplets of vertex indices
			elements: regl.prop('mesh.faces'),
	
			// Uniforms: global data available to the shader
			uniforms: this.pipeline_uniforms(regl),	
	
			cull: {enable: true}, // don't draw back faces

			vert: this.get_resource_checked(`${shader_name}.vert.glsl`),
			frag: this.get_resource_checked(`${shader_name}.frag.glsl`),
		})
	}

	check_scene(scene_info) {
		// check if all meshes are loaded
		for( const actor of scene_info.actors ) {
			if(actor.mesh) {
				this.get_resource_checked(actor.material.texture)
			}
		}
	}

	make_transformation_matrices(frame_info, actor) {
		const {mat_projection, mat_view} = frame_info

		// Construct mat_model_to_world from translation and sclae
		// If we wanted to have a rotation too, we'd use mat4.fromRotationTranslationScale
		mat4.fromScaling(actor.mat_model_to_world, actor.scale)
		mat4.translate(actor.mat_model_to_world, actor.mat_model_to_world, actor.translation)
		
		const mat_model_view = mat4.create()
		const mat_mvp = mat4.create()
		const mat_normals_to_view = mat3.create()
		mat3.identity(mat_normals_to_view)

		/* #TODO GL3.0 Copy mat_model_view, mat_mvp, mat_normals_to_view from GL2.2.2*/
		// calculate mat_model_view, mat_mvp, mat_normals_to_view 

		return {mat_model_view, mat_mvp, mat_normals_to_view}
	}

	render(frame_info, scene_info) {
		/* 
		We will collect all objects to draw with this pipeline into an array
		and then run the pipeline on all of them.
		This way the GPU does not need to change the active shader between objects.
		*/
		const entries_to_draw = []

		// Read frame info
		const {mat_projection, mat_view, light_position_cam, light_color} = frame_info

		// For each planet, construct information needed to draw it using the pipeline
		for( const actor of scene_info.actors ) {

			// skip objects with reflections
			if(!actor.mesh || actor.material.mirror) {
				continue
			}

			const {mat_model_view, mat_mvp, mat_normals_to_view} = this.make_transformation_matrices(frame_info, actor)

			entries_to_draw.push({
				mesh: this.resources[actor.mesh],
				mat_mvp: mat_mvp,
				mat_model_view: mat_model_view,
				mat_normals_to_view: mat_normals_to_view,

				light_position: light_position_cam,
				light_color: light_color,

				material: {
					texture: this.resources[actor.material.texture],
				},
			})
		}

		// Draw on the GPU
		this.pipeline(entries_to_draw)
	}
}

export class SysRenderTextured extends SysRenderMeshes {
	static shader_name = 'unshaded'
}

export class SysRenderMirror extends SysRenderMeshes {
	static shader_name = 'mirror'

	constructor(regl, resources) {
		super(regl, resources)

	}

	init() {
		this.env_capture = new EnvironmentCapture(this.regl, this.resources)

		super.init()
	}

	pipeline_uniforms(regl) {
		return {
			mat_mvp: regl.prop('mat_mvp'),
			mat_model_view: regl.prop('mat_model_view'),
			mat_normals_to_view: regl.prop('mat_normals_to_view'),

			tex_color: regl.prop('material.texture'),
			cube_env_map: this.env_capture.env_cubemap,
		}
	}

	render(frame_info, scene_info, render_scene_func) {
		const {mat_projection, mat_view, light_position_cam, light_color} = frame_info
		
		for( const actor of scene_info.actors ) {
			// skip objects with no reflections
			if(!actor.mesh || !actor.material.mirror) {
				continue
			}
			
			const {mat_model_view, mat_mvp, mat_normals_to_view} = this.make_transformation_matrices(frame_info, actor)

			// capture the environment from this actor's point of view
			this.env_capture.capture_scene_cubemap(frame_info, scene_info, actor.translation, render_scene_func)

			this.pipeline({
				mesh: this.resources[actor.mesh],
				mat_mvp: mat_mvp,
				mat_model_view: mat_model_view,
				mat_normals_to_view: mat_normals_to_view,

				material: {
					texture: this.resources[actor.material.texture],
				},
			})
		}

		// Draw on the GPU
	}
}


export class SysRenderMeshesWithLight extends SysRenderMeshes {
	static shader_name = 'unshaded'

	init() {
		this.env_capture = new EnvironmentCapture(this.regl, this.resources)
		this.env_capture.visualization_color_factor = 0.05

		super.init()
	}

	pipeline_uniforms(regl) {
		return {
			mat_mvp: regl.prop('mat_mvp'),
			mat_model_view: regl.prop('mat_model_view'),
			mat_normals_to_view: regl.prop('mat_normals_to_view'),

			light_position: regl.prop('light_position'),
			light_color: regl.prop('light_color'),

			tex_color: regl.prop('material.texture'),
			cube_shadowmap: this.env_capture.env_cubemap,

			color_factor: 0.1, // ambient component
		}
	}

	init_pipeline(regl) {
		super.init_pipeline(regl) // init the ambient pass

		let shader_name = 'phong_shadow'
		console.log('Compiling shader', shader_name)
		this.pipeline_phong_contribution = regl({
			attributes: {
				vertex_position: regl.prop('mesh.vertex_positions'),
				vertex_normal: regl.prop('mesh.vertex_normals'),
				vertex_tex_coords: regl.prop('mesh.vertex_tex_coords'),
			},
			// Faces, as triplets of vertex indices
			elements: regl.prop('mesh.faces'),
	
			// Uniforms: global data available to the shader
			uniforms: this.pipeline_uniforms(regl),	
	
			cull: {enable: true}, // don't draw back faces

			// blend mode
			// The depth buffer needs to be filled before calling this pipeline,
			// otherwise our additive blending mode can accumulate contributions
			// from fragments that should be invisible.
			// (The depth buffer is filled by the ambient pass.)
			depth: {
				enable: true,
				mask: true,
				func: '<=',
			},

			/* #TODO GL3.3.2
				change the blend options
			*/
			blend: {
			},
			

			vert: this.get_resource_checked(`${shader_name}.vert.glsl`),
			frag: this.get_resource_checked(`${shader_name}.frag.glsl`),
		})


		this.pipeline_shadowmap = regl({
			attributes: {
				vertex_position: regl.prop('mesh.vertex_positions'),
			},
			// Faces, as triplets of vertex indices
			elements: regl.prop('mesh.faces'),
	
			// Uniforms: global data available to the shader
			uniforms: {
				mat_mvp: regl.prop('mat_mvp'),
				mat_model_view: regl.prop('mat_model_view'),
			},
	
			cull: {enable: true}, // don't draw back faces

			vert: this.get_resource_checked(`shadowmap_gen.vert.glsl`),
			frag: this.get_resource_checked(`shadowmap_gen.frag.glsl`),
		})
			
	}

	render_shadowmap(frame_info, scene_info) {

		const entries_to_draw = []

		for( const actor of scene_info.actors ) {

			// skip objects with no mesh or no reflections
			if(!actor.mesh || actor.material.mirror) {
				continue
			}

			const {mat_model_view, mat_mvp, mat_normals_to_view} = this.make_transformation_matrices(frame_info, actor)

			entries_to_draw.push({
				mesh: this.resources[actor.mesh],
				mat_mvp: mat_mvp,
				mat_model_view: mat_model_view,
			})
		}

		this.pipeline_shadowmap(entries_to_draw)
	}

	render_light_contributions(frame_info, scene_info, light_position_cam, light_color) {
		const entries_to_draw = []

		// Read frame info

		// For each planet, construct information needed to draw it using the pipeline
		for( const actor of scene_info.actors ) {

			// skip objects with reflections
			if(!actor.mesh || actor.material.mirror) {
				continue
			}

			const {mat_model_view, mat_mvp, mat_normals_to_view} = this.make_transformation_matrices(frame_info, actor)

			entries_to_draw.push({
				mesh: this.resources[actor.mesh],
				mat_mvp: mat_mvp,
				mat_model_view: mat_model_view,
				mat_normals_to_view: mat_normals_to_view,

				light_position: light_position_cam,
				light_color: light_color,

				material: {
					texture: this.resources[actor.material.texture],
				},
			})
		}

		// Draw on the GPU
		this.pipeline_phong_contribution(entries_to_draw)
	}

	render(frame_info, scene_info) {
		const {mat_projection, mat_view} = frame_info
		
		// draw ambient pass without shading
		super.render(frame_info, scene_info)

		for( const light_actor of scene_info.actors ) {
			// skip objects with no light
			if(! light_actor.light) {
				continue
			}

			// capture the shadowmap from this actor's point of view
			this.env_capture.capture_scene_cubemap(frame_info, scene_info, light_actor.translation, (frame_info, scene_info) => {
				this.render_shadowmap(frame_info, scene_info)
			})

			const light_position_cam = vec3.transformMat4([0., 0., 0.], light_actor.translation, mat_view)
			const light_color = vec3.scale([0, 0, 0], light_actor.light.color, light_actor.light.intensity)

			this.render_light_contributions(frame_info, scene_info, light_position_cam, light_color)
		}

		// Draw on the GPU
	}
}

