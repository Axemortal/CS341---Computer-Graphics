import { vec4 } from "../../lib/gl-matrix_3.3.0/esm/index.js";
import { ResourceManager } from "../scene_resources/resource_manager.js";
import { vec3FromVec4, vec4FromVec3 } from "./cg_math.js";

/**
 * Helper function to compute light position in camera view space
 * @param {*} light_position the position of the light [x,y,z]
 * @param {*} cam_mat_view the camera view matrix
 * @returns
 */
export function lightToCamView(light_position, cam_mat_view) {
  let lightPositionCam = vec4.create();
  vec4.transformMat4(
    lightPositionCam,
    vec4FromVec3(light_position, 1.0),
    cam_mat_view
  );
  lightPositionCam = vec3FromVec4(lightPositionCam);
  return lightPositionCam;
}

/**
 * Helper function to get the object texture and if it is texture or not
 * @param {*} object the object for which to get the texture data
 * @param {ResourceManager} resourceManager
 * @returns
 */
export function textureData(object, resourceManager) {
  // If the object doesn't use a texture, then return a default texture to avoid pipeline
  // error even if it is not used in the render computation
  if (!object.material.texture) {
    let texture = resourceManager.getTexture("pine.png");
    let isTextured = false;
    return { texture, isTextured };
  }

  let texture = resourceManager.getTexture(object.material.texture);
  let isTextured = true;

  return { texture, isTextured };
}
