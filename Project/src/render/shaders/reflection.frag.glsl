precision mediump float;

#define MAX_SHININESS 127.75

uniform float material_shininess;

uniform sampler2D reflection_color_texture;
uniform sampler2D reflection_blur_texture;
uniform vec2 tex_size;

void main() {
    vec2 texCoord = gl_FragCoord.xy / tex_size;

    vec4 color = texture2D(reflection_color_texture, texCoord);
    vec4 colorBlur = texture2D(reflection_blur_texture, texCoord);

    float amount = clamp(material_shininess / MAX_SHININESS, 0.0, 1.0);

    if(amount <= 0.0) {
        gl_FragColor = vec4(0.0);
        return;
    }

    float roughness = 1.0 - amount;
    gl_FragColor = mix(color, colorBlur, roughness) * amount;
}