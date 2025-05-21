precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 viewer_position;
uniform float viewer_scale;

// Worley noise (2D, cell-based)
float worley(vec2 uv) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    float minDist = 1.0;

    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(x, y);
            vec2 point = vec2(
                fract(sin(dot(i + neighbor, vec2(127.1, 311.7))) * 43758.5453),
                fract(sin(dot(i + neighbor, vec2(269.5, 183.3))) * 43758.5453)
            );
            point = neighbor + point;
            float d = length(f - point);
            minDist = min(minDist, d);
        }
    }

    return minDist;
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = (fragCoord - viewer_position) / (u_resolution * viewer_scale);
    uv *= 30.0; // Controls tiling / density

    // Animate flow (e.g. traffic flow lines)
    uv.y += u_time * 0.2;

    float noise = worley(uv);

    // Invert and sharpen to create small glimmers
    float lights = smoothstep(0.12, 0.18, 1.0 - noise);

    float flicker = fract(
    sin(dot(floor(uv), vec2(12.9898,78.233))) * 43758.5453 + u_time * 0.3);
    lights *= step(0.85, flicker); // fewer flickers now


    // Color palette: subtle cool/warm glimmers (e.g. white headlights, red taillights)
    vec3 coolWhite = vec3(0.7, 0.8, 1.0);
    vec3 warmRed   = vec3(1.0, 0.3, 0.2);
    vec3 sparkleColor = mix(coolWhite, warmRed, fract(uv.x * 0.7 + u_time * 0.05));

    vec3 baseColor = vec3(0.05, 0.05, 0.07); // very dark asphalt base
    vec3 color = baseColor + sparkleColor * lights;

    gl_FragColor = vec4(color, 1.0);
}
