import { mat3, mat4 } from "../../lib/gl-matrix_3.3.0/esm/index.js";
import { deg_to_rad, mat4_matmul_many } from "../cg_libraries/cg_math.js";

/**
 * Create a new turntable camera
 */
export class TurntableCamera {
  constructor() {
    this.angleZ = Math.PI * 0.2; // in radians!
    this.angleY = -Math.PI / 6; // in radians!
    this.distanceFactor = 1;
    this.distanceBase = 15;
    this.lookAt = [0, 0, 0];

    this.mat = {
      projection: mat4.create(),
      view: mat4.create(),
    };

    this.updateFormatRatio(100, 100);
    this.updateCamTransform();
  }

  /**
   * Recompute the camera perspective matrix based on the new ratio
   * @param {*} width the width of the canvas
   * @param {*} height the heigth of the canvas
   */
  updateFormatRatio(width, height) {
    mat4.perspective(
      this.mat.projection,
      deg_to_rad * 60, // fov y
      width / height, // aspect ratio
      0.01, // near
      512 // far
    );
  }

  /**
   * Recompute the view matrix (mat.view)
   */
  updateCamTransform() {
    const r = this.distanceBase * this.distanceFactor;

    const M_look_forward_X = mat4.lookAt(
      mat4.create(),
      [-r, 0, 0], // camera position in world coord
      this.lookAt, // view target point
      [0, 0, 1] // up vector
    );

    const M_rot_y = mat4.fromYRotation(mat4.create(), this.angleY);
    const M_rot_z = mat4.fromZRotation(mat4.create(), this.angleZ);
    mat4_matmul_many(this.mat.view, M_look_forward_X, M_rot_y, M_rot_z);
  }

  /**
   * Compute all the objects transformation matrices and store them into the camera
   * (For improved performance, objects' transformation matrices are computed once at the
   * beginning of every frame and are stored in the camera for shaderRenderers to use)
   * @param {*} sceneObjects
   */
  computeObjectsTransformationMatrices(sceneObjects) {
    this.objectMatrices = new Map();

    // Compute and store the objects matrices
    for (const obj of sceneObjects) {
      const transformationMatrices = this.computeTransformationMatrices(obj);
      this.objectMatrices.set(obj, transformationMatrices);
    }
  }

  /**
   * Compute the transfortmation matrix of the object for this camera
   * @param {*} object
   * @returns
   */
  computeTransformationMatrices(object) {
    const matProjection = this.mat.projection;
    const matView = this.mat.view;

    const matModelToWorld = mat4.create();
    mat4.fromRotationTranslationScale(
      matModelToWorld,
      object.rotation,
      object.translation,
      object.scale
    );

    const matModelView = mat4.create();
    const matModelViewProjection = mat4.create();
    const matNormalsModelView = mat3.create();

    // Compute matModelView, matModelViewProjection, matNormalsModelView.
    mat4_matmul_many(matModelView, matView, matModelToWorld);
    mat4_matmul_many(matModelViewProjection, matProjection, matModelView);

    // Recall that the transform matrix modelView for normal projection
    // is the inverted transpose of the vertices modelView.
    mat3.identity(matNormalsModelView);
    mat3.fromMat4(matNormalsModelView, matModelView);
    mat3.invert(matNormalsModelView, matNormalsModelView);
    mat3.transpose(matNormalsModelView, matNormalsModelView);

    // Note: to optimize we could compute matViewProjection = matProjection * matView
    // only once instead as for every object. This option is simpler, and the performance
    // difference is negligible for a moderate number of objects.
    // Consider optimizing this routine if you need to render thousands of distinct objects.
    return {
      matModelView,
      matModelViewProjection,
      matNormalsModelView,
    };
  }

  //// UI USEFUL FUNCTIONS

  /**
   * Place the camera in the defined view
   * @param {{distanceFactor, angleZ, angleY, lookAt}} view
   */
  setPresetView(view) {
    this.distanceFactor = view.distanceFactor;
    this.angleZ = view.angleZ;
    this.angleY = view.angleY;
    this.lookAt = view.lookAt;
    this.updateCamTransform();
  }

  /**
   * Helper function to get in the console the state of
   * the camera to define a preset view
   */
  logCurrentState() {
    console.log(
      "distanceFactor: " + this.distanceFactor,
      "angleZ: " + this.angleZ,
      "angleY: " + this.angleY,
      "lookAt " + this.lookAt
    );
  }

  /**
   * Update the camera distanceFactor to produce a zoom in / zoom out effect
   * @param {*} deltaY the variation
   */
  zoomAction(deltaY) {
    const factorMulBase = 1.18;
    const factorMul = deltaY > 0 ? factorMulBase : 1 / factorMulBase;
    this.distanceFactor *= factorMul;
    this.distanceFactor = Math.max(0.02, Math.min(this.distanceFactor, 4));

    this.updateCamTransform();
  }

  /**
   * Update the camera angle to make it rotate around its lookAt point
   * @param {*} movementX
   * @param {*} movementY
   */
  rotateAction(movementX, movementY) {
    this.angleZ += movementX * 0.003;
    this.angleY += -movementY * 0.003;

    this.updateCamTransform();
  }

  /**
   * Moves the camera lookAt point
   * @param {*} movementX
   * @param {*} movementY
   */
  moveAction(movementX, movementY) {
    const scaleFactor = this.distanceBase * this.distanceFactor * 0.0005; // Adjust movement speed

    const right = [Math.sin(this.angleZ), Math.cos(this.angleZ), 0];

    const up = [
      -Math.cos(this.angleZ) * Math.sin(this.angleY),
      Math.sin(this.angleZ) * Math.sin(this.angleY),
      Math.cos(this.angleY),
    ];

    this.lookAt[0] +=
      right[0] * movementX * scaleFactor + up[0] * movementY * scaleFactor;
    this.lookAt[1] +=
      right[1] * movementX * scaleFactor + up[1] * movementY * scaleFactor;
    this.lookAt[2] += up[2] * movementY * scaleFactor;

    this.updateCamTransform();
  }
}
