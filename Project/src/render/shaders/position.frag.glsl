precision mediump float;

varying vec3 v2f_position;

void main() {
    gl_FragColor = vec4(v2f_position, 1.);
}