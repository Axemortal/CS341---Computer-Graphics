import {
  loadObjectToGPU,
  uploadMeshToBuffer,
} from "../cg_libraries/cg_mesh.js";
import { loadImage, loadText, loadTexture } from "../cg_libraries/cg_web.js";
import { vec3 } from "../../lib/gl-matrix_3.3.0/esm/index.js";
import { futuristic_concrete } from "../render/materials.js";

export class ResourceManager {
  /**
   * This class handles all the resources need by the render process
   * - shader file content
   * - mesh description
   * - texture data
   * - heigth map
   * @param {*} regl
   */
  constructor(regl) {
    this.regl = regl;
    this.resources = null;
  }

  /**
   * Function to call right after creation. It will start loading
   * all the wanted resources from the folder
   * @returns
   */
  async loadResources() {
    const regl = this.regl;

    const path_to_meshes_folder = "./assets/meshes";
    const path_to_textures_folder = "./assets/textures";
    const path_to_shaders_folder = "./src/render/shaders";

    // Start downloads in parallel
    const resource_promises = {};

    // load textures
    for (const texture_name of this.textures_to_load()) {
      resource_promises[texture_name] = loadTexture(
        regl,
        `${path_to_textures_folder}/${texture_name}`
      );
    }
    // load shaders
    for (const shader_name of this.shaders_to_load()) {
      resource_promises[shader_name] = loadText(
        `${path_to_shaders_folder}/${shader_name}`
      );
    }
    // load meshes
    for (const mesh_name of this.meshes_to_load()) {
      resource_promises[mesh_name] = loadObjectToGPU(
        regl,
        `${path_to_meshes_folder}/${mesh_name}`
      );
    }

    // Cube map
    // We load cube sides as images because we will put them into the cubemap constructor
    for (let cube_side_idx = 0; cube_side_idx < 6; cube_side_idx++) {
      const texture_name = `cube_side_${cube_side_idx}.png`;
      resource_promises[texture_name] = loadImage(
        `${path_to_textures_folder}/${texture_name}`
      );
    }

    // Wait for all downloads to complete
    const resources = {};
    for (const [key, promise] of Object.entries(resource_promises)) {
      resources[key] = await promise;
    }

    this.resources = resources;
    return this;
  }

  /**
   * Get the shader_name shader data from the resources
   * @param {*} shader_name
   * @returns the shader_name file content
   */
  getShader(shader_name) {
    return this.get(shader_name);
  }

  /**
   * Test wether this mesh exists in the resources and returns it
   * @param {*} meshReference
   * @returns
   */
  getMesh(meshReference) {
    return this.get(meshReference);
  }

  /**
   * Test wether this texture exists in the resources and returns it
   * @param {*} texture_name
   * @returns
   */
  getTexture(texture_name) {
    return this.get(texture_name);
  }

  /**
   * Try to get a resource based on its name
   * @param {*} name the name of the resource to get
   * @returns
   */
  get(name) {
    if (!name) {
      throw new Error(`Bad resource name ${name}`);
    }

    const resourceContent = this.resources[name];
    if (!resourceContent) {
      throw new ReferenceError(
        `No resource "${resourceContent}"
          1. Check the name "${name}" is correct
          2. Check the file is correctly loaded
        `
      );
    }
    return resourceContent;
  }

  /**
   * Add a newly computed mesh to this resources manager
   * @param {*} name the name that will be used to retrieve the mesh data
   * @param {*} mesh the vertices, normals, faces, uv_coord arrays
   */
  addProceduralMesh(name, mesh) {
    this.resources[name] = uploadMeshToBuffer(this.regl, mesh);
  }

  // Resources to be loaded
  textures_to_load() {
    return ["kloppenheim_07_puresky_blur.jpg", "pine.png", "futuristic_concrete.png", "sky.jpg"];
  }

  shaders_to_load() {
    return [
      "blinn_phong.vert.glsl",
      "blinn_phong.frag.glsl",
      "point_light_shadows.vert.glsl",
      "point_light_shadows.frag.glsl",
      "flat_color.vert.glsl",
      "flat_color.frag.glsl",
      "base_combine.frag.glsl",
      "mirror.vert.glsl",
      "mirror.frag.glsl",
      "shadow_map.vert.glsl",
      "shadow_map.frag.glsl",
      "cubemap_visualization.vert.glsl",
      "cubemap_visualization.frag.glsl",
      "noise.vert.glsl",
      "noise.frag.glsl",
      `buffer_to_screen.vert.glsl`,
      `buffer_to_screen.frag.glsl`,
      "terrain.vert.glsl",
      "terrain.frag.glsl",
      "normals.vert.glsl",
      "normals.frag.glsl",
      "screen_space_reflection.frag.glsl",
      "position.vert.glsl",
      "position.frag.glsl",
      "pass_through.vert.glsl",
      "reflection_color.frag.glsl",
      "reflection.frag.glsl",
      "texture.frag.glsl",
      "pre_processing.frag.glsl",
      "box_blur.frag.glsl",
      "worley.frag.glsl",
      "zippy.frag.glsl",
      "square.frag.glsl",
      "water.frag.glsl"
    ];
  }

  meshes_to_load() {
    return ["pine.obj", "suzanne.obj", "donut.obj", "plane.obj", "city_block1.obj",
        "city_block2.obj",
        "city_block3.obj",
        "city_block4.obj",
      "khalifa.obj",
    "tall1.obj", "tall2.obj"];
  }
}
