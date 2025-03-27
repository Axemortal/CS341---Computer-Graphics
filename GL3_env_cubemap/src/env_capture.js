import {vec3, vec4, mat3, mat4} from "../lib/gl-matrix_3.3.0/esm/index.js"
// import {icg_mesh_make_cube} from "./icg_mesh.js"
import {deg_to_rad, mat4_to_string, vec_to_string, mat4_matmul_many} from "./icg_math.js"


/*
Captures the environment into a cubemap.
*/
export class EnvironmentCapture {
	
	visualization_color_factor = 1.0

	constructor(regl, resources) {
		this.resources = resources
		this.regl = regl

		this.env_cubemap = regl.framebufferCube({
			radius: 1024,
			colorFormat: 'rgba', // GLES 2.0 doesn't support single channel textures : (
			colorType: 'float',
		})
	
		const faces = [0, 1, 2, 3, 4, 5].map(side_idx => this.get_resource_checked(`cube_side_${side_idx}.png`))

		this.annotation_cubemap = regl.cube(...faces)

		this.init_capture(regl)
		this.init_visualization(regl)
	}
	
	get_resource_checked(resource_name) {
		const shader_text = this.resources[resource_name]
		if (shader_text === undefined) {
			throw new ReferenceError(`No resource ${resource_name}`)
		}
		return shader_text
	}

	init_visualization(regl) {
		this.flattened_cubemap_pipeline = regl({
			attributes: {
				position: [
					[0., 0.],
					[3., 0.],
					[3., 2.],
					[0., 2.],
				],
			},
			elements: [
				[0, 1, 2], // top right
				[0, 2, 3], // bottom left
			],
			uniforms: {
				cubemap_to_show: this.env_cubemap,
				cubemap_annotation: this.annotation_cubemap,
				preview_rect_scale: ({viewportWidth, viewportHeight}) => {
					const aspect_ratio = viewportWidth / viewportHeight;
	
					const width_in_viewport_units = 0.8;
					const heigh_in_viewport_units = 0.4 * aspect_ratio;
	
					return [
						width_in_viewport_units / 3.,
						heigh_in_viewport_units / 2.,
					];
				},
				color_factor: () => this.visualization_color_factor,
			},
			vert: this.get_resource_checked('cubemap_visualization.vert.glsl'),
			frag: this.get_resource_checked('cubemap_visualization.frag.glsl'),
		})
	}

	visualize() {
		this.flattened_cubemap_pipeline()
	}

	init_capture(regl) {
		/*
		#TODO GL3.2.1 cube_camera_projection:
			Construct the camera projection matrix which has a correct light camera's view frustum.
			please use the function perspective, see https://stackoverflow.com/questions/28286057/trying-to-understand-the-math-behind-the-perspective-matrix-in-webgl
			Note: this is the same for all point lights/cube faces!
		*/
		// please use mat4.perspective(mat4.create(), fovy, aspect, near, far);
		this.cube_camera_projection = mat4.create()

		this.run_with_output_framebuffer = regl({
			framebuffer: regl.prop('out_buffer'),
		})
	}

	static CUBE_FACE_DIR = [
		[1,   0,  0], // +x
		[-1,  0,  0], // -x
		[0,   1,  0], // +y
		[0,  -1,  0], // -y
		[0,   0,  1], // +z
		[0,   0, -1], // -z
	]

	/*
	#TODO GL3.2.2 cube_camera_view up vectors
		Construct the up vectors for the cube side cameras.
		These faces are indexed in the order: +x, -x, +y, -y, +z, -z.
		So when `side_idx = 0`, we should return the +x camera matrix,
		and when `side_idx = 5`, we should return the -z one.
	*/

	static CUBE_FACE_UP = [
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
		[0, 0, 1],
	]

	cube_camera_view(side_idx, center, mat_view_camera) {
		
		const center_position_view = vec3.transformMat4([0., 0., 0.], center, mat_view_camera)

		const dir = this.constructor.CUBE_FACE_DIR[side_idx]
		const up = this.constructor.CUBE_FACE_UP[side_idx]

		const target = vec3.add(vec3.create(), center_position_view, dir);
		return mat4.multiply(mat4.create(), 
			mat4.lookAt(mat4.create(), center_position_view, target, up), 
			mat_view_camera,
		)
	}

	

	/*
	Capture scene into a cube map:
		- frame_info: camera info
		- scene_info: constructed by scene.js
		- capture_center: vec3, the point of view for the capture
		- scene_render_func: function, the function to render the rest of the scene
	*/
	capture_scene_cubemap(frame_info, scene_info, capture_center, scene_render_func) {
	
		// const actors = scene_info.actors
		const scene_mat_view = frame_info.mat_view

		// altered frame info for the cubemap rendering
		const frame_info_with_cubemap = Object.assign({}, frame_info, {
			// override the projection matrix for the cube camera
			mat_projection: this.cube_camera_projection,
		})

		for(let side_idx = 0; side_idx < 6; side_idx ++) {
			const out_buffer = this.env_cubemap.faces[side_idx]

			// override the view matrix for the cube camera
			frame_info_with_cubemap.mat_view = this.cube_camera_view(side_idx, capture_center, scene_mat_view)


			// using REGL command nesting to run all the following commands
			// with the output framebuffer set to the current cubemap face
			this.run_with_output_framebuffer({
				out_buffer: out_buffer,
			}, () => {
				this.regl.clear({
					color: [0, 0, 0, 1],
					depth: 1,
				})

				scene_render_func(frame_info_with_cubemap, scene_info)
			})	
		}
	}
}
