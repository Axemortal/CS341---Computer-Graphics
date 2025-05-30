import { ShaderRenderer } from "./shader_renderer.js";

export class ScreenSpaceReflectionShaderRenderer extends ShaderRenderer {
  /** 
   * Its render function can be used to render a scene with screen space reflection
   * @param {*} regl
   * @param {ResourceManager} resourceManager
   */
  constructor(regl, resourceManager) {
    super(
      regl,
      resourceManager,
      `pass_through.vert.glsl`,
      `screen_space_reflection.frag.glsl`
    );
  }

  /** 
   * Render the objects of the sceneState with its shader
   * @param {*} sceneState
   */
render(sceneState, { positionTexture, normalTexture }) {
  const scene = sceneState.scene;
  const inputs = [];

  const texWidth = positionTexture._texture.width;
  const texHeight = positionTexture._texture.height;
  const texSize = [texWidth, texHeight];

  // Safely pull params with defaults
  const {
    maxDistance = 5.0,
    thickness = 0.1,
    resolution = 1.0,
    steps = 10,
  } = scene.UIParams || {};

  for (const object of scene.objects) {
    if (this.excludeObject(object)) continue;

    const mesh = this.resourceManager.getMesh(object.meshReference);
    const { matModelViewProjection } = scene.camera.objectMatrices.get(object);

    inputs.push({
      mesh,
      matModelViewProjection,
      lensProjection: scene.camera.mat.projection,
      positionTexture,
      normalTexture,
      texSize,
      maxDistance,
      thickness,
      resolution,
      steps,
    });
  }

  this.pipeline(inputs);
}


  excludeObject(obj) {
    return !obj.material.properties.includes("reflective");
  }

  depth() {
    return {
      enable: true,
      mask: true,
      func: "<=",
    };
  }

  uniforms(regl) {
    return {
      // View (camera) related matrix
      mat_model_view_projection: regl.prop("matModelViewProjection"),

      // Lens projection from view space to screen space
      lens_projection: regl.prop("lensProjection"),

      // Textures
      position_texture: regl.prop("positionTexture"),
      normal_texture: regl.prop("normalTexture"),

      tex_size: regl.prop("texSize"),

      MAX_DISTANCE: regl.prop("maxDistance"),
      THICKNESS: regl.prop("thickness"),
      RESOLUTION: regl.prop("resolution"),
      STEPS: regl.prop("steps"),
    };
  }
}