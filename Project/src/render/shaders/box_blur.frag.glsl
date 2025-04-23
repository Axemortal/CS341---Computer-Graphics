precision mediump float;

uniform sampler2D color_texture;
uniform vec2 tex_size;
uniform vec2 parameters;

void main() {
    vec2 texCoord = gl_FragCoord.xy / tex_size;

    gl_FragColor = texture2D(color_texture, texCoord);

    float size = float(parameters.x);
    if(size <= 0.0) {
        return;
    }

    float separation = parameters.y;
    separation = max(separation, 1.0);

    vec4 colorSum = vec4(0.0);
    float alphaSum = 0.0;
    float count = 0.0;

    for(float i = -32.0; i <= 32.0; ++i) {
        if(abs(i) > size)
            continue;
        for(float j = -32.0; j <= 32.0; ++j) {
            if(abs(j) > size)
                continue;

            vec4 sample = texture2D(color_texture, (gl_FragCoord.xy + (vec2(i, j) * separation)) / tex_size);
            colorSum += sample * sample.a;
            alphaSum += sample.a;
            count += 1.0;
        }
    }

    if(alphaSum == 0.0) {
        gl_FragColor = vec4(0.0);
        return;
    }

    gl_FragColor = vec4(colorSum.rgb / alphaSum, alphaSum / count);
}