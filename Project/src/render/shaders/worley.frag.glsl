precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 viewer_position;
uniform float viewer_scale;

float length2(vec2 p) {
    return dot(p, p);
}

float w_noise(vec2 p) {
    return fract(sin(fract(sin(p.x) * 43.13311) + p.y) * 31.0011);
}

float worley(vec2 p) {
    float d = 1e30;
    for (int xo = -1; xo <= 1; ++xo) {
        for (int yo = -1; yo <= 1; ++yo) {
            vec2 tp = floor(p) + vec2(float(xo), float(yo));
            d = min(d, length2(p - (tp + vec2(w_noise(tp), w_noise(tp + 1.0)))));
        }
    }
    return 3.0 * exp(-4.0 * abs(2.5 * d - 1.0));
}

float fworley(vec2 p) {
    return sqrt(sqrt(sqrt(
        worley(p * 5.0) *
        sqrt(worley(p * 50.0 + 0.12)) *
        sqrt(sqrt(worley(p * -10.0)))
    )));
}

vec3 full_worley(vec2 point) {
    vec2 uv = point;

    float t = fworley(uv * 4.0);

    // Glitchy UV distortion
    vec2 glitchUV = uv;
    glitchUV.y += sin(glitchUV.x * 20.0) * 0.05;
    glitchUV.x += sin(glitchUV.y * 10.0) * 0.03;

    // Glitchy color bands
    float r = sin(glitchUV.x * 8.0);
    float g = sin(glitchUV.y * 8.0);
    float b = sin((glitchUV.x + glitchUV.y) * 20.0);
    vec3 glitchColor = 0.5 + 0.5 * vec3(r, g, b);

    float stripes = sin(uv.y * 400.0);
    glitchColor *= 0.9 + 0.1 * stripes;

    vec3 color_pink = vec3(0.4, 0.0, 0.3);
    vec3 color_blue = vec3(0.0, 0.3, 0.5);
    vec3 baseBlend = mix(color_pink, color_blue, t);

    return mix(baseBlend, glitchColor, 0.4);
}

void main() {
    vec2 st = (gl_FragCoord.xy - viewer_position) / (u_resolution * viewer_scale);
    st.x *= u_resolution.x / u_resolution.y;

    vec3 color = full_worley(st + u_time * 0.02); // animate subtly
    gl_FragColor = vec4(color, 1.0);
}
