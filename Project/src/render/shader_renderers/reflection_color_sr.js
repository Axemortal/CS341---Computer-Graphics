import { ShaderRenderer } from "./shader_renderer.js";

export class ReflectionColorShaderRenderer extends ShaderRenderer {
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
      `reflection_color.frag.glsl`
    );
  }

  /**
   * Render the objects of the sceneState with its shader
   * @param {*} sceneState
   */
  render(sceneState, { baseTexture, reflectionUVTexture }) {
    const scene = sceneState.scene;
    const inputs = [];

    const texWidth = baseTexture._texture.width;
    const texHeight = baseTexture._texture.height;
    const texSize = [texWidth, texHeight];

    for (const object of scene.objects) {
      if (this.excludeObject(object)) continue;

      const mesh = this.resourceManager.getMesh(object.meshReference);

      const { matModelViewProjection } =
        scene.camera.objectMatrices.get(object);

      inputs.push({
        mesh: mesh,

        matModelViewProjection: matModelViewProjection,

        baseTexture: baseTexture,
        reflectionUVTexture: reflectionUVTexture,
        texSize: texSize,
      });
    }

    this.pipeline(inputs);
  }

  excludeObject(object) {
    return !object.material.properties.includes("reflective");
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

      // Textures
      base_texture: regl.prop("baseTexture"),
      reflection_uv_texture: regl.prop("reflectionUVTexture"),

      tex_size: regl.prop("texSize"),
    };
  }
}
