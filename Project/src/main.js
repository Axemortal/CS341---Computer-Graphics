<<<<<<< HEAD
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
import { CityScene } from "./scenes/city_scene.js";

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
    // this.activeScene = this.scenes.project;
    this.activeScene = this.scenes.city;

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
      demo: new DemoScene(
        this.resourceManager,
        this.proceduralTextureGenerator
      ),
      tutorial: new TutorialScene(
        this.resourceManager,
        this.proceduralTextureGenerator
      ),
      project: new ProjectScene(
        this.resourceManager,
        this.proceduralTextureGenerator
      ),
      city: new CityScene(
        this.resourceManager,
        this.proceduralTextureGenerator
      ),
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
=======
import { createREGL } from "../lib/regljs_2.1.0/regl.module.js"

// UI functions
import {
  DOM_loaded_promise,
  create_button,
  create_slider,
  clear_overlay,
  create_button_with_hotkey,
  create_hotkey_action,
  toggle_overlay_visibility
} from "./cg_libraries/cg_web.js"

// Render
import { SceneRenderer } from "./render/scene_renderer.js"
import { ResourceManager } from "./scene_resources/resource_manager.js"
import { ProceduralTextureGenerator } from "./render/procedural_texture_generator.js";

// Scenes
import { TutorialScene } from "./scenes/tutorial_scene.js";
import { DemoScene } from "./scenes/demo_scene.js";
import { CityScene } from "./scenes/city_scene.js";
// import { distance } from "../lib/gl-matrix_3.3.0/esm/vec3.js";

DOM_loaded_promise.then(main)

async function main() {

  /*---------------------------------------------------------------
    1. Canvas Setup
  ---------------------------------------------------------------*/

  // REGL creates their own canvas
  const regl = createREGL({
    profile: true, // Can be useful to measure the size of buffers/textures in memory
    extensions: [  // Activate some WebGL extensions to access advanced features that are not part of the core WebGL specification
      'OES_texture_float', 'OES_texture_float_linear', 'WEBGL_color_buffer_float',
      'OES_vertex_array_object', 'OES_element_index_uint', 'WEBGL_depth_texture'
    ],
  })

  // The <canvas> object (HTML element for drawing graphics) was created by REGL: we take a handle to it
  const canvas_elem = document.getElementsByTagName('canvas')[0]
  {
    // Resize canvas to fit the window
    function resize_canvas() {
      canvas_elem.width = window.innerWidth
      canvas_elem.height = window.innerHeight
    }
    resize_canvas()
    window.addEventListener('resize', resize_canvas)
  }

  /*---------------------------------------------------------------
    2. UI Setup
  ---------------------------------------------------------------*/

  /**
   * Object used to propagate parameters that the user can change in the interface.
   * Define here your parameters.
   */
  const ui_global_params = {
    is_paused: false,
  }

  function initialize_ui_params() {

    // Bind a hotkey to hide the overlay
    create_hotkey_action("Hide overlay", "h", () => { toggle_overlay_visibility() });

    // Create a pause button
    create_hotkey_action("Pause", "p", () => {
      ui_global_params.is_paused = !ui_global_params.is_paused;
    });

  }

  /*---------------------------------------------------------------
    3. Camera Listeners
  ---------------------------------------------------------------*/

  // Rotate camera position by dragging with the mouse
  canvas_elem.addEventListener('mousemove', (event) => {
    // If left or middle button is pressed
    if (event.buttons & 1) {
      active_scene.camera.rotate_action(event.movementX, event.movementY);
    }
    else if (event.buttons & 4) {
      active_scene.camera.move_action(event.movementX, event.movementY);
    }
  })

  // zoom
  canvas_elem.addEventListener('wheel', (event) => {
    active_scene.camera.zoom_action(event.deltaY);
  })

  /*---------------------------------------------------------------
    4. Resources and Scene Instantiation
  ---------------------------------------------------------------*/

  // Instantiate the resources manager
  const resource_manager = await new ResourceManager(regl).load_resources();
  const procedural_texture_generator = new ProceduralTextureGenerator(regl, resource_manager);

  // Instantiate the scene renderer, i.e. the entry point for rendering a scene
  const scene_renderer = new SceneRenderer(regl, resource_manager);

  // Instantiate scenes. Multiple different scenes can be set up here: 
  // which one is rendered depends on the value of the active_scene variable.
  const demo_scene = new DemoScene(resource_manager, procedural_texture_generator);
  const tutorial_scene = new TutorialScene(resource_manager, procedural_texture_generator);
  const city_scene = new CityScene(resource_manager)

  const active_scene = city_scene;   // Assign the scene to be rendered to active_scene

  /*---------------------------------------------------------------
    5. UI Instantiation
  ---------------------------------------------------------------*/

  clear_overlay();
  initialize_ui_params();  // add general UI controls
  active_scene.initialize_ui_params();  // add scene-specific UI controls

  /*---------------------------------------------------------------
    6. Rendering Loop
  ---------------------------------------------------------------*/

  // Time variable
  let dt = 0;
  let prev_regl_time = 0;

  regl.frame((frame) => {

    // Reset canvas
    const background_color = [0.0, 0.0, 0.0, 1];
    regl.clear({ color: background_color });

    /*---------------------------------------------------------------
      Update the current frame data
    ---------------------------------------------------------------*/

    // Compute the time elapsed since last frame
    dt = frame.time - prev_regl_time;
    prev_regl_time = frame.time;

    // If the time is not paused, iterate over all actors and call their evolve function
    if (!ui_global_params.is_paused) {
      for (const name in active_scene.actors) {
        active_scene.actors[name].evolve(dt);
      }
    }

    // The scene state contains all information necessary to render the scene in this frame
    const scene_state = {
      scene: active_scene,
      frame: frame,
      background_color: background_color,
      ui_params: { ...ui_global_params, ...active_scene.ui_params },
    }

    /*---------------------------------------------------------------
      Render the scene
    ---------------------------------------------------------------*/

    scene_renderer.render(scene_state);

  })


}


>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
