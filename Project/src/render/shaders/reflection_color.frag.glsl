precision mediump float;

uniform sampler2D base_texture;
uniform sampler2D reflection_uv_texture;
uniform vec2 tex_size;

void main() {
    const float separation = 2.0;

    vec2 texCoord = gl_FragCoord.xy / tex_size;
    vec4 uv = texture2D(reflection_uv_texture, texCoord);

    // Removes holes in the UV map.
    if(uv.b <= 0.0) {
        uv = vec4(0.0);
        float count = 0.0;

        for(int i = -6; i <= 6; ++i) {
            for(int j = -6; j <= 6; ++j) {
                uv += texture2D(reflection_uv_texture, ((vec2(i, j) * separation) + gl_FragCoord.xy) / tex_size);
                count += 1.0;
            }
        }

        uv.xyz /= count;
    }

    if(uv.b <= 0.0) {
        gl_FragColor = vec4(0.0);
        return;
    }

    vec3 color = texture2D(base_texture, uv.xy).rgb;
    float alpha = clamp(uv.b, 0.0, 1.0);

    gl_FragColor = vec4(mix(vec3(0.0), color, alpha), alpha);
}