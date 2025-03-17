import {mat4} from "../lib/gl-matrix_3.3.0/esm/index.js"
import {mat4_matmul_many} from "./icg_math.js"

/*
Draw a right-handed reference frame. 
Each axis is represented by a parallelepiped. 
The X-axis is red, the Y-axis is green, and the Z-axis is blue.
*/
export class SystemRenderFrame { 

	constructor(regl) {
		this.pipeline_quad = regl({
            // Vertex attributes
            attributes: {
                // 4 vertices with 3 coordinates each
                position: [
                    // X-axis parallelepiped
                    [-0.005, -0.005, -0.005], [0.33, -0.005, -0.005], [0.33, 0.005, -0.005], [-0.005, 0.005, -0.005],
                    [-0.005, -0.005, 0.005], [0.33, -0.005, 0.005], [0.33, 0.005, 0.005], [-0.005, 0.005, 0.005],

                    // Y-axis parallelepiped
                    [-0.005, -0.005, -0.005], [0.005, -0.005, -0.005], [0.005, 0.33, -0.005], [-0.005, 0.33, -0.005],
                    [-0.005, -0.005, 0.005], [0.005, -0.005, 0.005], [0.005, 0.33, 0.005], [-0.005, 0.33, 0.005],

                    // Z-axis parallelepiped
                    [-0.005, -0.005, -0.005], [-0.005, 0.005, -0.005], [0.005, 0.005, -0.005], [0.005, -0.005, -0.005],
                    [-0.005, -0.005, 0.33], [-0.005, 0.005, 0.33], [0.005, 0.005, 0.33], [0.005, -0.005, 0.33],
                ],
            },

            // Faces, as triplets of vertex indices
            elements: [
                // X-axis
                [0, 1, 2], [0, 2, 3],
                [4, 5, 6], [4, 6, 7],
                [0, 1, 5], [0, 5, 4],
                [3, 2, 6], [3, 6, 7],
                [1, 2, 6], [1, 6, 5],
                [0, 3, 7], [0, 7, 4],
            
                // Y-axis
                [8, 9, 10], [8, 10, 11],
                [12, 13, 14], [12, 14, 15],
                [8, 9, 13], [8, 13, 12],
                [11, 10, 14], [11, 14, 15],
                [9, 10, 14], [9, 14, 13],
                [8, 11, 15], [8, 15, 12],
            
                // Z-axis
                [16, 17, 18], [16, 18, 19],
                [20, 21, 22], [20, 22, 23],
                [16, 17, 21], [16, 21, 20],
                [19, 18, 22], [19, 22, 23],
                [17, 18, 22], [17, 22, 21],
                [16, 19, 23], [16, 23, 20],
            ],

            vert: `
            // Vertex attributes, specified in the "attributes" entry of the pipeline
            attribute vec3 position;

            // Per-vertex outputs passed on to the fragment shader
            varying vec3 v2f_position;

            // Global variables specified in "uniforms" entry of the pipeline
            uniform mat4 mat_mvp;

            void main() {
                v2f_position = position;
                gl_Position = mat_mvp * vec4(position, 1);
            }`,

            frag: `
            precision mediump float;

            varying vec3 v2f_position;

            void main() {
                gl_FragColor = vec4(v2f_position, 1);
            }`,


			// Uniforms: global data available to the shader
			uniforms: {
				mat_mvp: regl.prop('mat_mvp'),
			},	
		})
		
		this.mat_mvp = mat4.create()
		this.mat_model_to_world = mat4.fromScaling(mat4.create(), [10, 10, 10])
	}

	render(frame_info, scene_info) {
		const {mat_projection, mat_view} = frame_info

		mat4_matmul_many(this.mat_mvp, mat_projection, mat_view, this.mat_model_to_world);
		
		this.pipeline_quad({
			mat_mvp: this.mat_mvp,
		})
	}
}
