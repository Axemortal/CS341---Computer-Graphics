import { ShaderRenderer } from "./shader_renderer.js";

export class BaseCombineShaderRenderer extends ShaderRenderer {
  constructor(regl, resourceManager) {
    super(
      regl,
      resourceManager,
      `pass_through.vert.glsl`,
      `base_combine.frag.glsl`
    );
  }

  render(sceneState, { baseTexture, shadowTexture, reflectionTexture }) {
    const scene = sceneState.scene;
    const inputs = [];

    const texWidth = baseTexture._texture.width;
    const texHeight = baseTexture._texture.height;
    const texSize = [texWidth, texHeight];

    for (const object of scene.objects) {
      const mesh = this.resourceManager.getMesh(object.meshReference);

      const { matModelViewProjection } =
        scene.camera.objectMatrices.get(object);

      inputs.push({
        mesh: mesh,

        matModelViewProjection: matModelViewProjection,

        canvasWidth: sceneState.frame.framebufferWidth,
        canvasHeight: sceneState.frame.framebufferHeight,

        baseTexture: baseTexture,
        shadowTexture: shadowTexture,
        reflectionTexture: reflectionTexture,
        texSize: texSize,
      });
    }

    this.pipeline(inputs);
  }

  depth() {
    // Use z buffer
    return {
      enable: true,
      mask: true,
      func: "<=",
    };
  }

  uniforms(regl) {
    return {
      mat_model_view_projection: regl.prop("matModelViewProjection"),

      canvas_width: regl.prop("canvasWidth"),
      canvas_height: regl.prop("canvasHeight"),

      base_texture: regl.prop("baseTexture"),
      shadow_texture: regl.prop("shadowTexture"),
      reflection_texture: regl.prop("reflectionTexture"),
      tex_size: regl.prop("texSize"),
    };
  }
}
