import { NoiseShaderRenderer } from "./shader_renderers/noise_sr.js";
import { BufferToScreenShaderRenderer } from "./shader_renderers/buffer_to_screen_sr.js";
import { WorleyShaderRenderer } from "./shader_renderers/worley_sr.js";
import { ZippyShaderRenderer } from "./shader_renderers/zippy_sr.js";
import { BloomShaderRenderer } from "./shader_renderers/bloom_sr.js";
import { SquareShaderRenderer } from "./shader_renderers/square_sr.js";

import { vec2 } from "../../lib/gl-matrix_3.3.0/esm/index.js";

export class ProceduralTextureGenerator {
  /**
   * @param {*} regl
   * @param {*} resourceManager
   */
  constructor(regl, resourceManager) {
    this.regl = regl;
    this.resourceManager = resourceManager;

    // Full-screen quad mesh
    this.mesh_quad_2d = this.create_mesh_quad();

    // Shader renderers
    this.worley = new WorleyShaderRenderer(regl, resourceManager);
    this.zippy = new ZippyShaderRenderer(regl, resourceManager);
    this.square = new SquareShaderRenderer(regl, resourceManager);
    this.bloom = new BloomShaderRenderer(regl, resourceManager);
    this.buffer_to_screen = new BufferToScreenShaderRenderer(regl, resourceManager);

    // LOD and resolution settings
    this.baseWidth = 512;
    this.baseHeight = 512;
    this.currentWidth = this.baseWidth;
    this.currentHeight = this.baseHeight;

    // Pre-allocate primary and secondary FBOs for ping-pong
    this._worleyFbo = this.new_buffer(this.baseWidth, this.baseHeight);
    this._worleyFbo2 = this.new_buffer(this.baseWidth, this.baseHeight);
    this._zippyFbo = this.new_buffer(this.baseWidth, this.baseHeight);
    this._zippyFbo2 = this.new_buffer(this.baseWidth, this.baseHeight);
    this._squareFbo = this.new_buffer(this.baseWidth, this.baseHeight);
    this._squareFbo2 = this.new_buffer(this.baseWidth, this.baseHeight);

    // Register primary FBOs as textures
    resourceManager.resources["worley_texture"] = this._worleyFbo;
    resourceManager.resources["zippy_texture"] = this._zippyFbo;
    resourceManager.resources["square_texture"] = this._squareFbo;
  }

  /**
   * Create a new regl framebuffer
   */
  new_buffer(width = 256, height = 256) {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    return this.regl.framebuffer({
      width,
      height,
      colorFormat: "rgba",
      colorType: isSafari ? "uint8" : "float",
      stencil: false,
      depth: false,
      mag: "linear",
      min: "linear",
    });
  }

  /**
   * Resize buffers if needed
   */
  prepare(width, height) {
    this.currentWidth = width;
    this.currentHeight = height;
    [
      this._worleyFbo, this._worleyFbo2,
      this._zippyFbo, this._zippyFbo2,
      this._squareFbo, this._squareFbo2
    ].forEach(fbo => fbo.resize(width, height));
  }

  /**
   * Adjust resolution based on viewer_scale LOD
   */
  _adjustResolution(viewer_scale) {
    // Dynamic LOD: reduce resolution when zoomed out
    const scale = Math.min(1, Math.max(0.25, viewer_scale));
    const newRes = Math.floor(this.baseWidth * scale);
    if (newRes !== this.currentWidth) {
      this.prepare(newRes, newRes);
    }
  }

  /**
   * Update procedural textures each frame
   * @param {number} time
   * @param {number[]} viewer_position
   * @param {number} viewer_scale
   * @param {boolean} apply_bloom
   */
  update(time, viewer_position = [0, 0], viewer_scale = 1.0, apply_bloom = true) {
    // Skip if context lost
    if (this.regl._gl.isContextLost && this.regl._gl.isContextLost()) return;

    // Apply dynamic LOD resolution
    this._adjustResolution(viewer_scale);

    // Optionally skip all passes if nearly invisible
    if (viewer_scale < 0.2) return;

    // --- Worley pass ---
    this.worley.render(
      this.mesh_quad_2d,
      this._worleyFbo,
      viewer_scale,
      viewer_position,
      time
    );
    if (apply_bloom) {
      this.bloom.apply(this.mesh_quad_2d, this._worleyFbo, this._worleyFbo2);
      [this._worleyFbo, this._worleyFbo2] = [this._worleyFbo2, this._worleyFbo];
      this.resourceManager.resources["worley_texture"] = this._worleyFbo;
    }

    // --- Zippy pass ---
    this.zippy.render(
      this.mesh_quad_2d,
      this._zippyFbo,
      viewer_scale,
      viewer_position,
      time
    );
    if (apply_bloom) {
      this.bloom.apply(this.mesh_quad_2d, this._zippyFbo, this._zippyFbo2);
      [this._zippyFbo, this._zippyFbo2] = [this._zippyFbo2, this._zippyFbo];
      this.resourceManager.resources["zippy_texture"] = this._zippyFbo;
    }

    // --- Square pass ---
    this.square.render(
      this.mesh_quad_2d,
      this._squareFbo,
      viewer_scale,
      viewer_position,
      time
    );
    if (apply_bloom) {
      this.bloom.apply(this.mesh_quad_2d, this._squareFbo, this._squareFbo2);
      [this._squareFbo, this._squareFbo2] = [this._squareFbo2, this._squareFbo];
      this.resourceManager.resources["square_texture"] = this._squareFbo;
    }
  }

  /**
   * Optionally render a buffer to screen for debugging
   */
  display(name) {
    let buf;
    if (name === "worley") buf = this._worleyFbo;
    else if (name === "zippy") buf = this._zippyFbo;
    else if (name === "square") buf = this._squareFbo;
    else return;
    this.buffer_to_screen.render(this.mesh_quad_2d, buf);
  }

  /**
   * Create a simple full-screen quad
   */
  create_mesh_quad() {
    return {
      vertex_positions: [
        [-1, -1, 0],
        [1, -1, 0],
        [1, 1, 0],
        [-1, 1, 0]
      ],
      faces: [ [0,1,2], [0,2,3] ],
    };
  }
}
