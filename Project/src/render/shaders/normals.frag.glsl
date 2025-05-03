precision mediump float;

varying vec3 normal;

void main() {
<<<<<<< HEAD
    gl_FragColor = vec4(normal, 1.);
=======
    vec3 color = normalize(normal) * 0.5 + 0.5; // set the color from normals

    gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
>>>>>>> c614f2a9b3c6d245a00542f9390f14ef2ab70879
}
