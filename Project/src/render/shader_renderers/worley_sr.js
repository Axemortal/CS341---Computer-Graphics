import { ShaderRenderer } from "./shader_renderer.js";

export class WorleyShaderRenderer extends ShaderRenderer {
  constructor(regl, resourceManager) {
    super(regl, resourceManager, "pass_through.vert.glsl", "worley.frag.glsl");
  }

  /**
   * Render Worley noise to a buffer
   * @param {*} mesh_quad_2d - The quad mesh to render on
   * @param {*} noise_buffer - The framebuffer/texture to render into
   * @param {number} viewer_scale
   * @param {number[]} viewer_position
   * @param {number} u_time
   */
  render(mesh_quad_2d, noise_buffer, viewer_scale, viewer_position, u_time) {
    this.regl.clear({
      framebuffer: noise_buffer,
      color: [0, 0, 0, 1],
    });

    this.pipeline({
      mesh_quad_2d: mesh_quad_2d,
      noise_buffer: noise_buffer,
      viewer_scale: viewer_scale,
      viewer_position: viewer_position,
      u_time: u_time,
    });
  }

  initPipeline() {
    const regl = this.regl;
    return regl({
      attributes: {
        vertex_positions: {
          buffer: regl.prop("mesh_quad_2d.vertex_positions"),
          size: 3,
        },
      },
      elements: regl.prop("mesh_quad_2d.faces"),
      uniforms: {
        viewer_position: regl.prop("viewer_position"),
        viewer_scale: regl.prop("viewer_scale"),
        u_time: regl.prop("u_time"),
        u_resolution: ({ viewportWidth, viewportHeight }) => [
          viewportWidth,
          viewportHeight,
        ],
        mat_model_view_projection: [
          1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
        ], // Identity for 2D quad
      },
      vert: this.vertShader,
      frag: this.fragShader,
      framebuffer: regl.prop("noise_buffer"),
    });
  }
}
