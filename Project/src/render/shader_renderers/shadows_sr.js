import { lightToCamView } from "../../cg_libraries/cg_render_utils.js";
import { ResourceManager } from "../../scene_resources/resource_manager.js";
import { EnvironmentCapture } from "../env_capture.js";
import { ShaderRenderer } from "./shader_renderer.js";
import { ShadowMapShaderRenderer } from "./shadow_map_sr.js";

export class ShadowsShaderRenderer extends ShaderRenderer {
  /**
   * Used to produce a black & white map of the shadows of
   * the scene using the cube map method for a point light
   * @param {*} regl
   * @param {ResourceManager} resourceManager
   */
  constructor(regl, resourceManager) {
    super(
      regl,
      resourceManager,
      `point_light_shadows.vert.glsl`,
      `point_light_shadows.frag.glsl`
    );
    this.env_capture = new EnvironmentCapture(regl, resourceManager);
    // Here we instantiate the ShadowMapShaderRenderer directly into the ShadowsShaderRenderer
    // because the latter needs to pass shadow_map render function to the env_capture to generate the cube_map
    this.shadow_map = new ShadowMapShaderRenderer(regl, resourceManager);
  }

  /**
   * The result is a combination of all the light's cast shadows.
   * White means "shadows" black means "no shadows"
   * @param {*} sceneState
   */
  render(sceneState) {
    const scene = sceneState.scene;

    // For every light build a shadow map and do a render of the shadows
    this.regl.clear({ color: [0, 0, 0, 1] });

    const numLights = scene.lights.length;

    scene.lights.forEach((light) => {
      const inputs = [];
      // Transform light position into camera space
      const lightPositionCam = lightToCamView(
        light.position,
        scene.camera.mat.view
      );

      // Computation of the cube map from the light
      const cubeShadowMap = this.computeCubeShadowMap(sceneState, light);

      for (const obj of scene.objects) {
        if (this.excludeObject(obj)) continue;

        const mesh = this.resourceManager.getMesh(obj.meshReference);

        const { matModelView, matModelViewProjection } =
          scene.camera.objectMatrices.get(obj);

        inputs.push({
          mesh: mesh,

          matModelViewProjection: matModelViewProjection,
          matModelView: matModelView,

          lightPositionCam: lightPositionCam,
          numLights: numLights,

          cubeShadowMap: cubeShadowMap,
        });
      }

      this.pipeline(inputs);
    });
  }

  excludeObject(obj) {
    // Exclude object with environment material: the sky does not cast shadows
    return obj.material.properties.includes("environment");
  }

  computeCubeShadowMap(sceneState, light) {
    const light_position = light.position;

    this.env_capture.capture_scene_cubemap(
      sceneState,
      light_position, // position from which to render the cube map
      (s_s) => {
        this.shadow_map.render(s_s);
      } // function used to render the cube map
    );
    return this.env_capture.env_cubemap;
  }

  depth() {
    // Use the z-buffer
    return {
      enable: true,
      mask: true,
      func: "<=",
    };
  }

  blend() {
    // Additive blend mode
    return {
      enable: true,
      func: {
        src: 1,
        dst: 1,
      },
    };
  }

  uniforms(regl) {
    return {
      // View (camera) related matrix
      mat_model_view_projection: regl.prop("matModelViewProjection"),
      mat_model_view: regl.prop("matModelView"),

      // Light
      light_position_cam: regl.prop("lightPositionCam"),
      num_lights: regl.prop("numLights"),

      // Cube map
      cube_shadowmap: regl.prop("cubeShadowMap"),
    };
  }
}
