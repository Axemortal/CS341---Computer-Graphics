precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

// Compact smooth noise function
float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    p -= i;
    p *= p * (3.0 - 2.0 * p);
    
    vec4 s = fract(sin(vec4(0.0, 1.0, 27.0, 28.0) + i.x + i.y * 27.0) * 1e5);
    mat2 m = mat2(s.xy, s.zw);
    
    return dot(m * vec2(1.0 - p.y, p.y), vec2(1.0 - p.x, p.x));
}

// Fractal noise with 4 layers
float fractalNoise(vec2 p) {
    return smoothNoise(p) * 0.5333 +
           smoothNoise(p * 2.0) * 0.2667 +
           smoothNoise(p * 4.0) * 0.1333 +
           smoothNoise(p * 8.0) * 0.0667;
}

// Warped noise combining fractal noise layers with time-based offsets
float warpedNoise(vec2 p) {
    vec2 m = vec2(u_time*0.1, -u_time*0.1) * 0.5;
    float x = fractalNoise(p + m);
    float y = fractalNoise(p + m.yx + x);
    float z = fractalNoise(p - m - x + y);
    return fractalNoise(p + vec2(x, y) + vec2(y, z) + vec2(z, x) + length(vec3(x, y, z)) * 0.25);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.y;

    float n = warpedNoise(uv * 6.0);
    float n2 = warpedNoise(uv * 6.0 + 0.02);

    float bump = max(n2 - n, 0.0) / 0.02 * 0.7071;
    float bump2 = max(n - n2, 0.0) / 0.02 * 0.7071;

    bump = bump * bump + pow(bump, 4.0) * 0.5;
    bump2 = bump2 * bump2 + pow(bump2, 4.0) * 0.5;

    vec3 baseColor = vec3(0.016, 0.05, 0.11);  // Deep blue base (not black)
    vec3 highlightColor = vec3(0.7, 0.7, 0.7); // Soft bluish highlights

    vec3 col = n * n * (baseColor + highlightColor * smoothstep(0.0, 1.0, bump + bump2) * 0.6) + vec3(0.05, 0.1, 0.15);

    // Rough gamma correction
    gl_FragColor = vec4(sqrt(max(col, 0.0)), 1.0);
}
