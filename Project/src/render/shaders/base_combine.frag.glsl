precision mediump float;

uniform sampler2D base_texture;
uniform sampler2D shadow_texture;
uniform sampler2D reflection_texture;
uniform vec2 tex_size;

void main() {
    float shadows_strength = 0.4;

    vec2 texCoord = gl_FragCoord.xy / tex_size;

    vec4 base = texture2D(base_texture, texCoord);
    vec4 shadow = texture2D(shadow_texture, texCoord);
    vec4 reflection = texture2D(reflection_texture, texCoord);

    gl_FragColor = base;
    gl_FragColor.rgb = mix(gl_FragColor.rgb, reflection.rgb, clamp(reflection.a, 0.0, 1.0));
    // Darken the area where there is shadows
    if(shadow.x > 0.0) {
        gl_FragColor.rgb *= (1.0 - (shadow.x * shadows_strength));
    }
}