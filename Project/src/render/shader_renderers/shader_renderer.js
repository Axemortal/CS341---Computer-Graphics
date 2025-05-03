import { ResourceManager } from "../../scene_resources/resource_manager.js";

/*---------------------------------------------------------------
    SUPER CLASS OF ALL THE SHADER RENDERS
---------------------------------------------------------------*/

export class ShaderRenderer {
  /**
   * Init a pipeline for the shader in the arguments.
   * @param {*} regl
   * @param {ResourceManager} resourceManager
   * @param {String} vertShader the name of the vert shader (ex: blinn_phong.vert.glsl)
   * @param {String} fragShader the name of the frag shader (ex: blinn_phong.frag.glsl)
   */
  constructor(regl, resourceManager, vertShader, fragShader) {
    this.regl = regl;
    this.resourceManager = resourceManager;

    // load the shader text from the resources manager
    this.vertShader = resourceManager.getShader(vertShader);
    this.fragShader = resourceManager.getShader(fragShader);

    this.pipeline = this.initPipeline();
  }

  /**
   * Call this function to render a scene with this shader
   * @param {*} sceneState
   */
  render(sceneState) {}

  /**
   * Define in this function the exclusion criteria
   * (wether this object should be rendered by the current shader or not)
   * @param {*} obj the object to check for exclusion
   * @returns when returning "true" the object is NOT rendered by this shader
   */
  excludeObject(obj) {
    return false;
  }

  /**
   *
   * @param {*} regl
   * @returns the attributes (positions, normals & textures coordinates) of a mesh
   */
  attributes(regl) {
    return {
      vertex_positions: regl.prop("mesh.vertexPositions"),
      vertex_normal: regl.prop("mesh.vertexNormals"),
      vertex_tex_coords: regl.prop("mesh.vertexTexCoords"),
    };
  }

  /**
   * https://github.com/regl-project/regl/blob/gh-pages/API.md#culling
   * @returns
   */
  cull() {
    return { enable: false }; // draw back face
  }

  /**
   * https://github.com/regl-project/regl/blob/gh-pages/API.md#depth-buffer
   * @returns
   */
  depth() {
    return { enable: true };
  }

  /**
   * https://github.com/regl-project/regl/blob/gh-pages/API.md#blending
   * @returns default blend mode
   */
  blend() {
    return { enable: false };
  }

  /**
   * Uniforms: global data available to the shader
   * https://github.com/regl-project/regl/blob/gh-pages/API.md#uniforms
   * This function has to be overwritten in children class.
   * @param {*} regl
   * @returns
   */
  uniforms(regl) {
    return {};
  }

  /**
   * Init a render pipeline that will be used to call the rendering process on the shader
   * The pipeline creation relies on multiple other functions that define parameters.
   * These functions can be overwritten in children class
   * @returns
   */
  initPipeline() {
    const regl = this.regl;

    return regl({
      attributes: this.attributes(regl),

      // Faces, as triplets of vertex indices
      elements: regl.prop("mesh.faces"),

      depth: this.depth(),

      cull: this.cull(),

      blend: this.blend(),

      // Uniforms: global data available to the shader
      uniforms: this.uniforms(regl),

      // Shaders
      vert: this.vertShader,
      frag: this.fragShader,
    });
  }
}
