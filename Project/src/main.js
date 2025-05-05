import { createREGL } from "../lib/regljs_2.1.0/regl.module.js";

// UI functions
import {
  isDOMLoadedPromise,
  clearOverlay,
  createHotkeyAction,
  toggleOverlayVisibility,
} from "./cg_libraries/cg_web.js";

// Core components
import { SceneRenderer } from "./render/scene_renderer.js";
import { ResourceManager } from "./scene_resources/resource_manager.js";
import { ProceduralTextureGenerator } from "./render/procedural_texture_generator.js";

// Scene definitions
import { TutorialScene } from "./scenes/tutorial_scene.js";
import { DemoScene } from "./scenes/demo_scene.js";
import { ProjectScene } from "./scenes/project_scene.js";
import { TrialScene } from "./scenes/trial_scene.js";

/**
 * Application class to manage the WebGL rendering application
 */
class Application {
  constructor() {
    this.uiGlobalParams = {
      isPaused: false,
    };

    this.regl = null;
    this.canvasElement = null;
    this.resourceManager = null;
    this.proceduralTextureGenerator = null;
    this.sceneRenderer = null;
    this.scenes = {};
    this.activeScene = null;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    // Setup WebGL canvas
    this.regl = this.setupCanvas();
    this.canvasElement = document.getElementsByTagName("canvas")[0];
    this.setupWindowResize();

    // Load resources and create managers
    this.resourceManager = await new ResourceManager(this.regl).loadResources();
    this.proceduralTextureGenerator = new ProceduralTextureGenerator(
      this.regl,
      this.resourceManager
    );
    this.sceneRenderer = new SceneRenderer(this.regl, this.resourceManager);

    // Setup scenes
    this.setupScenes();
    this.activeScene = this.scenes.Trial;

    // Setup input and UI
    this.setupCameraListeners();
    clearOverlay();
    this.setupUIGlobalParamsListeners();
    this.activeScene.initializeUIParams();

    // Start the render loop
    this.startRenderLoop();
  }

  /**
   * Set up the WebGL canvas with required extensions
   */
  setupCanvas() {
    return createREGL({
      profile: true, // Can be useful to measure the size of buffers/textures in memory
      extensions: [
        // Extensions for advanced WebGL features
        "OES_texture_float",
        "OES_texture_float_linear",
        "WEBGL_color_buffer_float",
        "OES_vertex_array_object",
        "OES_element_index_uint",
        "WEBGL_depth_texture",
      ],
    });
  }

  /**
   * Configure canvas to resize with the window
   */
  setupWindowResize() {
    const resizeCanvas = () => {
      this.canvasElement.width = window.innerWidth;
      this.canvasElement.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }

  /**
   * Initialize all available scenes
   */
  setupScenes() {
    this.scenes = {
      tutorial: new TutorialScene(
        this.resourceManager,
        this.proceduralTextureGenerator
      ),
      project: new ProjectScene(
        this.resourceManager,
        this.proceduralTextureGenerator
      ),
      Trial: new TrialScene(this.regl, this.resourceManager),
    };
  }

  /**
   * Setup camera input listeners
   */
  setupCameraListeners() {
    // Rotate camera position by dragging with the mouse
    this.canvasElement.addEventListener("mousemove", (event) => {
      // Left button for rotation
      if (event.buttons & 1) {
        this.activeScene.camera.rotateAction(event.movementX, event.movementY);
      }
      // Middle button for movement
      else if (event.buttons & 4) {
        this.activeScene.camera.moveAction(event.movementX, event.movementY);
      }
    });

    // Zoom with mouse wheel
    this.canvasElement.addEventListener("wheel", (event) => {
      this.activeScene.camera.zoomAction(event.deltaY);
    });
  }

  /**
   * Setup global hotkeys and UI parameters
   */
  setupUIGlobalParamsListeners() {
    createHotkeyAction("Hide overlay", "h", () => {
      toggleOverlayVisibility();
    });

    createHotkeyAction("Pause", "p", () => {
      this.uiGlobalParams.isPaused = !this.uiGlobalParams.isPaused;
    });

    createHotkeyAction("Preset view", "1", () => {
      this.activeScene.camera.setPresetView({
        distanceFactor: 0.3,
        angleZ: 0,
        angleY: -Math.PI / 2,
        lookAt: [0, 0, 0],
      });
    });
  }

  /**
   * Start the main rendering loop
   */
  startRenderLoop() {
    let dt = 0;
    let prevREGLTime = 0;

    this.regl.frame((frame) => {
      // Reset canvas
      const backgroundColor = [0.0, 0.0, 0.0, 1];
      this.regl.clear({ color: backgroundColor });

      dt = frame.time - prevREGLTime;
      prevREGLTime = frame.time;

      if (!this.uiGlobalParams.isPaused) {
        this.updateSceneActors(dt);
        this.activeScene.updateSceneState(dt, frame.time);
      }

      // Build scene state and render
      const sceneState = {
        scene: this.activeScene,
        frame: frame,
        backgroundColor: backgroundColor,
        UIParams: { ...this.uiGlobalParams, ...this.activeScene.UIParams },
      };

      this.sceneRenderer.render(sceneState);
    });
  }

  /**
   * Update all actors in the active scene
   */
  updateSceneActors(dt) {
    for (const name in this.activeScene.actors) {
      this.activeScene.actors[name].evolve(dt);
    }
  }
}

// Initialize application when DOM is ready
isDOMLoadedPromise.then(() => {
  const app = new Application();
  app.initialize();
});
