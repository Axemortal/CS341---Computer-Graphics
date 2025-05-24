import { ResourceManager } from "../scene_resources/resource_manager.js";
import { PreprocessingShaderRenderer } from "./shader_renderers/pre_processing_sr.js";
import { PositionShaderRenderer } from "./shader_renderers/position_sr.js";
import { NormalsShaderRenderer } from "./shader_renderers/normals_sr.js";
import { FlatColorShaderRenderer } from "./shader_renderers/flat_color_sr.js";
import { TerrainShaderRenderer } from "./shader_renderers/terrain_sr.js";
import { BlinnPhongShaderRenderer } from "./shader_renderers/blinn_phong_sr.js";
import { MirrorShaderRenderer } from "./shader_renderers/mirror_sr.js";
import { ScreenSpaceReflectionShaderRenderer } from "./shader_renderers/screen_space_reflection_sr.js";
import { ReflectionColorShaderRenderer } from "./shader_renderers/reflection_color_sr.js";
import { BoxBlurShaderRenderer } from "./shader_renderers/box_blur_sr.js";
import { ReflectionShaderRenderer } from "./shader_renderers/reflection_sr.js";
import { ShadowsShaderRenderer } from "./shader_renderers/shadows_sr.js";
import { BaseCombineShaderRenderer } from "./shader_renderers/base_combine_sr.js";
import { TextureShaderRenderer } from "./shader_renderers/texture_sr.js";
import { ProceduralTextureGenerator } from "../render/procedural_texture_generator.js";
import { noise_functions } from "./shader_renderers/noise_sr.js";

/**
 * SceneRenderer - Handles rendering pipeline for a 3D scene with multiple shader passes
 */
export class SceneRenderer {
  /**
   * Create a new scene renderer to display a scene on the screen
   * @param {Object} regl - The regl instance for rendering
   * @param {ResourceManager} resourceManager - Resource manager for assets
   */
  constructor(regl, resourceManager) {
    this.regl = regl;
    this.resourceManager = resourceManager;
    this.texturesAndBuffers = {};

    this._initShaderRenderers();
    this._initRenderTargets();
  }

  /**
   * Initialize all shader renderers
   * @private
   */
  _initShaderRenderers() {
    const { regl, resourceManager } = this;

    this.renderers = {
      preProcessing: new PreprocessingShaderRenderer(regl, resourceManager),
      position: new PositionShaderRenderer(regl, resourceManager),
      normals: new NormalsShaderRenderer(regl, resourceManager),
      flatColor: new FlatColorShaderRenderer(regl, resourceManager),
      terrain: new TerrainShaderRenderer(regl, resourceManager),
      blinnPhong: new BlinnPhongShaderRenderer(regl, resourceManager),
      mirror: new MirrorShaderRenderer(regl, resourceManager),
      screenSpaceReflection: new ScreenSpaceReflectionShaderRenderer(
        regl,
        resourceManager
      ),
      reflectionColor: new ReflectionColorShaderRenderer(regl, resourceManager),
      boxBlur: new BoxBlurShaderRenderer(regl, resourceManager),
      reflection: new ReflectionShaderRenderer(regl, resourceManager),
      shadows: new ShadowsShaderRenderer(regl, resourceManager),
      baseCombine: new BaseCombineShaderRenderer(regl, resourceManager),
      texture: new TextureShaderRenderer(regl, resourceManager),
      textureGenerator: new ProceduralTextureGenerator(regl, resourceManager),
    };
  }

  /**
   * Initialize render targets (textures and buffers)
   * @private
   */
  _initRenderTargets() {
    // Create textures & buffers for intermediate render passes
    const defaultConfig = {};

    const renderTargets = [
      "position",
      "normals",
      "base",
      "reflectionUV",
      "reflectionColor",
      "reflectionBlur",
      "reflections",
      "shadows",
    ];

    renderTargets.forEach((target) => {
      this.createTextureAndBuffer(target, defaultConfig);
    });
  }

  /**
   * Helper function to create regl texture & regl buffers
   * @param {string} name - The name for the texture (used to save & retrieve data)
   * @param {Object} parameters - Optional texture parameters
   * @param {string} [parameters.wrap='clamp'] - Texture wrap mode
   * @param {string} [parameters.format='rgba'] - Texture format
   * @param {string} [parameters.type='float'] - Texture data type
   */
  createTextureAndBuffer(
    name,
    { wrap = "clamp", format = "rgba", type = "float" }
  ) {
    const { regl } = this;
    const framebufferWidth = window.innerWidth;
    const framebufferHeight = window.innerHeight;

    // Create a regl texture and a regl buffer linked to the regl texture
    const texture = regl.texture({
      width: framebufferWidth,
      height: framebufferHeight,
      wrap,
      format,
      type,
    });

    const buffer = regl.framebuffer({
      color: [texture],
      width: framebufferWidth,
      height: framebufferHeight,
    });

    this.texturesAndBuffers[name] = [texture, buffer];
  }

  /**
   * Function to run a rendering process and save the result in the designated texture
   * @param {string} name - Name of the texture to render into
   * @param {Function} renderFunction - Function that is used to render the result
   * @returns {Object} - The texture object
   */
  renderInTexture(name, renderFunction) {
    const { regl } = this;
    const [texture, buffer] = this.texturesAndBuffers[name];

    regl({ framebuffer: buffer })(() => {
      regl.clear({ color: [0, 0, 0, 1], depth: 1 });
      renderFunction();
    });

    return texture;
  }

  /**
   * Retrieve a render texture with its name
   * @param {string} name - Name of the texture to retrieve
   * @returns {Object} - The texture object
   */
  texture(name) {
    const [texture] = this.texturesAndBuffers[name];
    return texture;
  }

  /**
   * Core function to render a scene
   * Call the render passes in this function
   * @param {Object} sceneState - The description of the scene, time, dynamically modified parameters, etc.
   */
  render(sceneState) {
    const { scene, frame } = sceneState;
    const { renderers } = this;

    // Update the camera ratio in case the window size changed
    scene.camera.updateFormatRatio(
      frame.framebufferWidth,
      frame.framebufferHeight
    );

    // Compute the objects matrices at the beginning of each frame
    scene.camera.computeObjectsTransformationMatrices(scene.objects);

    // Clear the screen
    this.regl.clear({ color: [0, 0, 0, 1], depth: 1 });
    renderers.preProcessing.render(sceneState);

    this.renderInTexture("position", () => {
      renderers.preProcessing.render(sceneState);
      renderers.position.render(sceneState);
    });

    this.renderInTexture("normals", () => {
      renderers.preProcessing.render(sceneState);
      renderers.normals.render(sceneState);
    });

    this.renderInTexture("base", () => {
      renderers.preProcessing.render(sceneState);
      renderers.flatColor.render(sceneState);
      renderers.terrain.render(sceneState);
      renderers.blinnPhong.render(sceneState, {
        positionTexture: this.texture("position"),
        normalTexture: this.texture("normals"),
      });
    });

    // Saves the reflection UV in a texture
    this.renderInTexture("reflectionUV", () => {
      renderers.preProcessing.render(sceneState);
      renderers.screenSpaceReflection.render(sceneState, {
        positionTexture: this.texture("position"),
        normalTexture: this.texture("normals"),
      });
    });

    // Fill the holes in the reflection color
    this.renderInTexture("reflectionColor", () => {
      renderers.preProcessing.render(sceneState);
      renderers.reflectionColor.render(sceneState, {
        baseTexture: this.texture("base"),
        reflectionUVTexture: this.texture("reflectionUV"),
      });
    });

    // Blur the reflection color
    this.renderInTexture("reflectionBlur", () => {
      renderers.preProcessing.render(sceneState);
      renderers.boxBlur.render(sceneState, {
        colorTexture: this.texture("reflectionColor"),
      });
    });

    // Render the final reflections in a texture
    this.renderInTexture("reflections", () => {
      renderers.preProcessing.render(sceneState);
      renderers.reflection.render(sceneState, {
        reflectionColorTexture: this.texture("reflectionColor"),
        reflectionBlurTexture: this.texture("reflectionBlur"),
      });
    });

    // this.renderInTexture("shadows", () => {
    //   renderers.preProcessing.render(sceneState);
    //   renderers.shadows.render(sceneState);
    // });

    renderers.preProcessing.render(sceneState);
    switch (sceneState.UIParams.renderTexture) {
      case "position":
        renderers.texture.render(sceneState, this.texture("position"));
        break;
      case "normals":
        renderers.texture.render(sceneState, this.texture("normals"));
        break;
      case "base":
        renderers.texture.render(sceneState, this.texture("base"));
        break;
      case "reflectionUV":
        renderers.texture.render(sceneState, this.texture("reflectionUV"));
        break;
      case "reflectionColor":
        renderers.texture.render(sceneState, this.texture("reflectionColor"));
        break;
      case "reflectionBlur":
        renderers.texture.render(sceneState, this.texture("reflectionBlur"));
        break;
      case "reflections":
        renderers.texture.render(sceneState, this.texture("reflections"));
        break;
      case "shadows":
        renderers.texture.render(sceneState, this.texture("shadows"));
        break;
      case "GlitchyWorley":
        renderers.texture.render(sceneState, this.texture("GlitchyWorley"));
        break;
      default:
        this.regl.clear({ color: [0, 0, 0, 0], depth: 1 });
        renderers.baseCombine.render(sceneState, {
          baseTexture: this.texture("base"),
          reflectionTexture: this.texture("reflections"),
          shadowTexture: this.texture("shadows"),
        });
        break;
    }

    // Debug visualization of cubemap (uncomment if needed)
    // this.renderers.mirror.envCapture.visualize();
  }
}
