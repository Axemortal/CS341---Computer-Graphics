import * as MATERIALS from "../render/materials.js";
import { Scene } from "./scene.js";
import { makeSphereUV } from "../cg_libraries/cg_mesh.js";
import { ResourceManager } from "../scene_resources/resource_manager.js";
import { quat } from "../../lib/gl-matrix_3.3.0/esm/index.js";
import { createDropdown, createSlider } from "../cg_libraries/cg_web.js";

export class ProjectScene extends Scene {
  /**
   * A scene featuring reflective water body
   *
   * @param {ResourceManager} resourceManager
   */
  constructor(resourceManager) {
    super();

    this.resourceManager = resourceManager;

    this.static_objects = [];
    this.dynamic_objects = [];

    this.initialize_scene();
    this.initialize_actor_actions();
    this.UIParams.renderTexture = null;
    this.UIParams.maxDistance = 15;
    this.UIParams.thickness = 0.1;
    this.UIParams.resolution = 0.65;
    this.UIParams.steps = 8;
  }

  initialize_scene() {
    // Add lights
    this.lights.push({ position: [5.0, 5.0, 5.0], color: [1.0, 0.8, 0.7] });

    this.resourceManager.addProceduralMesh(
      "mesh_sphere_env_map",
      makeSphereUV(16)
    );

    this.static_objects.push({
      translation: [0, 0, 0],
      scale: [100, 100, 100],
      rotation: [0, 0, 0, 0],
      meshReference: "mesh_sphere_env_map",
      material: MATERIALS.sunset_sky,
    });

    let rotationQuat = quat.create();
    quat.fromEuler(rotationQuat, 90, 0, 0);

    const donut_mesh = {
      translation: [0, 2, 2],
      scale: [1, 1, 1],
      rotation: rotationQuat,
      meshReference: "donut.obj",
      material: MATERIALS.BasicColors.gray,
    };

    const plane_mesh = {
      translation: [0, 0, 0],
      scale: [10, 1, 10],
      rotation: rotationQuat,
      meshReference: "plane.obj",
      material: MATERIALS.mirror,
    };

    this.dynamic_objects.push(donut_mesh);
    this.dynamic_objects.push(plane_mesh);

    const pine_positions = [
      [-3, 4, 0.3],
      [3, 5, 0.3],
      [0, 7, 0.3],
    ];
    const pine_materials = [
      MATERIALS.BasicColors.red,
      MATERIALS.BasicColors.blue,
      MATERIALS.pine,
    ];

    for (let i = 0; i < pine_positions.length; i++) {
      this.dynamic_objects.push({
        translation: pine_positions[i],
        scale: [0.8, 0.8, 0.8],
        rotation: [0, 0, 0, 1],
        meshReference: "pine.obj",
        material: pine_materials[i],
      });
    }

    // Combine the dynamic & static objects into one array
    this.objects = this.static_objects.concat(this.dynamic_objects);
  }

  initialize_actor_actions() {}

  initializeUIParams() {
    createDropdown(
      "Render Texture",
      [
        "default",
        "position",
        "normals",
        "base",
        "reflectionUV",
        "reflectionColor",
        "reflectionBlur",
        "reflections",
        "shadows",
      ],
      (value) => {
        this.UIParams.renderTexture = value;
      }
    );
    createSlider(
      "SSR Ray Marching Max Distance",
      [0, 25],
      (value) => {
        this.UIParams.maxDistance = parseFloat(value);
      },
      this.UIParams.maxDistance
    );
    createSlider(
      "SSR Thickness Threshold",
      [0, 0.5],
      (value) => {
        this.UIParams.thickness = parseFloat(value);
      },
      this.UIParams.thickness,
      0.01
    );
    createSlider(
      "SSR Resolution",
      [0, 1],
      (value) => {
        this.UIParams.resolution = parseFloat(value);
      },
      this.UIParams.resolution,
      0.01
    );
    createSlider(
      "SSR Steps",
      [0, 32],
      (value) => {
        this.UIParams.steps = parseInt(value);
      },
      this.UIParams.steps
    );
  }
}
