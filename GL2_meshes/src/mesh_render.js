import {vec2, vec3, vec4, mat3, mat4} from "../lib/gl-matrix_3.3.0/esm/index.js"
import { transpose } from "../lib/gl-matrix_3.3.0/esm/mat2.js"
import { inverse } from "../lib/gl-matrix_3.3.0/esm/vec3.js"
import {mat4_matmul_many} from "./icg_math.js"

/*
	Construct the scene!
*/
export function create_scene_content() {

	const actors = [
		{
			translation: [-2., -2., 0.],
			scale: [1., 1., 1.],
					
			mesh: 'vase1.obj',

			material: {
				color: [0.7, 0.5, 0.0],
				shininess: 14.,
			}
		},
		{
			translation: [-1., 0., 0.],
			scale: [1., 1., 2.],
					
			mesh: 'vase1.obj',

			material: {
				color: [0.7, 0.5, 0.0],
				shininess: 14.,
			}
		},
		{
			translation: [-2., 2., 0.],
			scale: [1., 1., 0.65],
					
			mesh: 'vase1.obj',

			material: {
				color: [0.7, 0.5, 0.0],
				shininess: 14.,
			}
		},
		{
			translation: [0., 0., -1.],
			scale: [3., 3., 3.],
					
			mesh: 'table.obj',

			material: {
				color: [0.6, 0.6, 0.6],
				shininess: 2.,
			}
		},
		{
			translation: [2., -1., 0.],
			scale: [0.6, 0.6, 0.8],
					
			mesh: 'cup2.obj',

			material: {
				color: [0.1, 0.5, 0.7],
				shininess: 12.,
			}
		},
		{
			translation: [2.5, 1., 0.],
			scale: [0.6, 0.6, 0.8],
					
			mesh: 'cup2.obj',

			material: {
				color: [0.1, 0.5, 0.7],
				shininess: 12.,
			}
		},

		{
			translation: [0., 0., -0.75],
			scale: [4., 4., 4.],
				
			mesh: 'shadow_scene__terrain.obj',

			material: {
				color: [0.4, 0.4, 0.4],
				shininess: 6.,
			}
		},
		{
			translation: [0., 0., -0.75],
			scale: [-4., -4., 4.],
				
			mesh: 'shadow_scene__wheel.obj',

			material: {
				color: [0.7, 0.15, 0.05],
				shininess: 8.,
			}
		},

	]

	// In each planet, allocate its transformation matrix
	for(const actor of actors) {
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


/*
	Draw meshes with a simple pipeline
	Subclasses override the name of shader to use
*/
class SysRenderMeshes {
	static shader_name = 'ENTER SHADER NAME'

	get_resource_checked(shader_name) {
		const shader_text = this.resources[shader_name]
		if (shader_text === undefined) {
			throw new ReferenceError(`No resource ${shader_name}`)
		}
		return shader_text
	}

	constructor(regl, resources) {
		// Keep a reference to textures
		this.resources = resources
		this.init_pipeline(regl)
	}

	pipeline_uniforms(regl) {
		return {
			mat_mvp: regl.prop('mat_mvp'),
			mat_model_view: regl.prop('mat_model_view'),
			mat_normals_to_view: regl.prop('mat_normals_to_view'),

			light_position: regl.prop('light_position'),
			light_color: regl.prop('light_color'),

			material_color: regl.prop('material.color'),
			material_shininess: regl.prop('material.shininess'),
		}
	}

	init_pipeline(regl) {
		const shader_name = this.constructor.shader_name

		this.pipeline = regl({
			attributes: {
				vertex_position: regl.prop('mesh.vertex_positions'),
				vertex_normal: regl.prop('mesh.vertex_normals'),
			},
			// Faces, as triplets of vertex indices
			elements: regl.prop('mesh.faces'),
	
			// Uniforms: global data available to the shader
			uniforms: this.pipeline_uniforms(regl),	
	
			vert: this.get_resource_checked(`${shader_name}.vert.glsl`),
			frag: this.get_resource_checked(`${shader_name}.frag.glsl`),
		})
	}

	check_scene(scene_info) {
		// check if all meshes are loaded
		for( const actor of scene_info.actors ) {
			this.get_resource_checked(actor.mesh)
		}
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

			// Construct mat_model_to_world from translation and sclae
			// If we wanted to have a rotation too, we'd use mat4.fromRotationTranslationScale
			mat4.fromScaling(actor.mat_model_to_world, actor.scale)
			mat4.translate(actor.mat_model_to_world, actor.mat_model_to_world, actor.translation)
			
			const mat_model_view = mat4.create()
			const mat_mvp = mat4.create()
			const mat_normals_to_view = mat3.create()
			mat3.identity(mat_normals_to_view)

			/* #TODO GL2.2.1 Setup the model-view-projection matrix mat_mvp */
			mat4_matmul_many(mat_model_view, mat_view, actor.mat_model_to_world)
			mat4_matmul_many(mat_mvp, mat_projection, mat_model_view)

			/* #TODO GL2.2.2 
				Calculate mat_mvp like in previous exercise
				Calculate mat_normals_to_view to be equal to 
					inverse(transpose( mat view * mat model ))
			*/
			// calculate mat_normals_to_view 
			const mat_model_view_transpose = mat4.create()
			mat4.transpose(mat_model_view_transpose, mat_model_view)
			mat3.fromMat4(mat_normals_to_view, mat_model_view_transpose)
			mat3.invert(mat_normals_to_view, mat_normals_to_view)


			entries_to_draw.push({
				mesh: this.resources[actor.mesh],
				mat_mvp: mat_mvp,
				mat_model_view: mat_model_view,
				mat_normals_to_view: mat_normals_to_view,

				light_position: light_position_cam,
				light_color: light_color,

				material: actor.material,
			})
		}

		// Draw on the GPU
		this.pipeline(entries_to_draw)
	}
}


export class SysRenderNormals extends SysRenderMeshes {
	static shader_name = 'normals'
}

export class SysRenderShadePervertex extends SysRenderMeshes {
	static shader_name = 'shade_pervertex'
}

export class SysRenderShadePerpixel extends SysRenderMeshes {
	static shader_name = 'shade_perpixel'
}



