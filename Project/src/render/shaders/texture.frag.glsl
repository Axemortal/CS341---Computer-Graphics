precision mediump float;

uniform sampler2D sample_texture;
uniform vec2 tex_size;

void main() {
    vec2 texCoord = gl_FragCoord.xy / tex_size;
    gl_FragColor = texture2D(sample_texture, texCoord);
}