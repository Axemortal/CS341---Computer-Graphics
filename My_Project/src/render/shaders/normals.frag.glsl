precision mediump float;

varying vec3 normal;

void main() {
    vec3 color = normalize(normal) * 0.5 + 0.5; // set the color from normals

    gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}