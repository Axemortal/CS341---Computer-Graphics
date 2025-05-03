precision mediump float;

varying vec3 normal;

void main() {
    gl_FragColor = vec4(normal, 1.);
}
