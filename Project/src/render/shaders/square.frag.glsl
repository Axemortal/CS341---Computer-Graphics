precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 viewer_position;
uniform float viewer_scale;

float hash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
}

vec3 hue2rgb(float hue) {
    return 0.5 + 0.5 * cos(6.2831 * (hue + vec3(0.0, 1.0 / 3.0, 2.0 / 3.0)));
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = (fragCoord - viewer_position) / (u_resolution * viewer_scale);
    uv.x *= u_resolution.x / u_resolution.y;

    // Slight vertical drift to simulate LED panel movement
    uv.y += sin(u_time * 0.2 + uv.x * 5.0) * 0.01;

    vec3 col = vec3(0.0);

    float flicker, scale, hue;
    vec2 guv;
    float t;

    // Layer 1 - Sparse neon blocks (like street signs)
    scale = 10.0;
    guv = floor(uv * scale) / scale;
    t = floor(u_time * 0.3) * 0.3;
    flicker = hash(vec3(guv, t));
    if (flicker > 0.87) {
        hue = 0.8 + 0.2 * hash(vec3(guv, t + 1.0)); // Lean toward magenta-pink
        col += hue2rgb(hue) * 0.5;
    }

    // Layer 2 - Medium neon sparkles
    scale = 40.0;
    guv = floor(uv * scale) / scale;
    t = floor(u_time * 1.0) * 1.0;
    flicker = hash(vec3(guv, t));
    if (flicker > 0.93) {
        hue = 0.6 + 0.2 * hash(vec3(guv, t + 1.0)); // Lean toward cyan-blue
        col += hue2rgb(hue) * 0.7;
    }

    // Layer 3 - Tiny bright flicks
    scale = 120.0;
    guv = floor(uv * scale) / scale;
    t = floor(u_time * 2.0) * 2.0;
    flicker = hash(vec3(guv, t));
    if (flicker > 0.965) {
        hue = 0.65 + 0.3 * hash(vec3(guv, t + 2.0)); // Blue-purple accents
        col += hue2rgb(hue) * 1.8;
    }

    // Add horizontal scanline shimmer
    float scanline = 0.95 + 0.05 * sin(uv.y * 800.0 + u_time * 10.0);
    col *= scanline;

    // Glow boost and gamma
    col = clamp(col * col * 3.5, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
}
