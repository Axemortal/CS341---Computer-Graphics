<<<<<<< HEAD
/**
 * Common utilities
 * @module glMatrix
=======
/**
 * Common utilities
 * @module glMatrix
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
 */
// Configuration Constants
export var EPSILON = 0.000001;
export var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
export var RANDOM = Math.random;
<<<<<<< HEAD
/**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Float32ArrayConstructor | ArrayConstructor} type Array type, such as Float32Array or Array
=======
/**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Float32ArrayConstructor | ArrayConstructor} type Array type, such as Float32Array or Array
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
 */

export function setMatrixArrayType(type) {
  ARRAY_TYPE = type;
}
var degree = Math.PI / 180;
<<<<<<< HEAD
/**
 * Convert Degree To Radian
 *
 * @param {Number} a Angle in Degrees
=======
/**
 * Convert Degree To Radian
 *
 * @param {Number} a Angle in Degrees
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
 */

export function toRadian(a) {
  return a * degree;
}
<<<<<<< HEAD
/**
 * Tests whether or not the arguments have approximately the same value, within an absolute
 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less
 * than or equal to 1.0, and a relative tolerance is used for larger values)
 *
 * @param {Number} a The first number to test.
 * @param {Number} b The second number to test.
 * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
=======
/**
 * Tests whether or not the arguments have approximately the same value, within an absolute
 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less
 * than or equal to 1.0, and a relative tolerance is used for larger values)
 *
 * @param {Number} a The first number to test.
 * @param {Number} b The second number to test.
 * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
 */

export function equals(a, b) {
  return Math.abs(a - b) <= EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
}
if (!Math.hypot) Math.hypot = function () {
  var y = 0,
      i = arguments.length;

  while (i--) {
    y += arguments[i] * arguments[i];
  }

  return Math.sqrt(y);
};