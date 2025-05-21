precision highp float;

uniform mat4 lens_projection;

uniform sampler2D position_texture;
uniform sampler2D normal_texture;
uniform vec2 tex_size;

uniform float MAX_DISTANCE;
uniform float THICKNESS;
uniform float RESOLUTION;
uniform int STEPS;

void main() {
    vec2 texCoord = gl_FragCoord.xy / tex_size;

    vec4 positionFrom = texture2D(position_texture, texCoord);
    if(positionFrom.w <= 0.0) {
        gl_FragColor = vec4(0.0);
        return;
    }

    vec3 unitPositionFrom = normalize(positionFrom.xyz);
    vec3 normal = normalize(texture2D(normal_texture, texCoord).xyz);

    // Prevent erroneous reflection when normal is facing away from camera
    if(dot(normal, unitPositionFrom) >= 0.0) {
        gl_FragColor = vec4(0.0);
        return;
    }

    vec3 pivot = normalize(reflect(unitPositionFrom, normal));

    vec4 startView = vec4(positionFrom.xyz + (pivot * 0.0), 1.0);
    vec4 endView = vec4(positionFrom.xyz + (pivot * MAX_DISTANCE), 1.0);

    // Project ray to screen space
    vec4 startFrag = lens_projection * startView;
    startFrag.xyz /= startFrag.w;
    startFrag.xy = startFrag.xy * 0.5 + 0.5;
    startFrag.xy *= tex_size;

    vec4 endFrag = lens_projection * endView;
    endFrag.xyz /= endFrag.w;
    endFrag.xy = endFrag.xy * 0.5 + 0.5;
    endFrag.xy *= tex_size;

    vec2 frag = startFrag.xy;
    vec4 uv = vec4(0.0);
    uv.xy = frag / tex_size;

    float deltaX = endFrag.x - startFrag.x;
    float deltaY = endFrag.y - startFrag.y;
    float useX = abs(deltaX) >= abs(deltaY) ? 1.0 : 0.0;
    float deltaF = mix(abs(deltaY), abs(deltaX), useX) * clamp(RESOLUTION, 0.0, 1.0);
    vec2 increment = vec2(deltaX, deltaY) / max(deltaF, 0.001);

    vec4 positionTo = vec4(0);
    float search0 = 0.0;
    float search1 = 0.0;
    int hit0 = 0;
    int hit1 = 0;
    float viewDistance = 0.0;
    float depth = 0.0;

    int delta = int(deltaF);
    for(int i = 0; i < 128; ++i) {
        // Ray marching has travelled the entire length of the line
        if(i >= delta) {
            break;
        }

        frag += increment;
        uv.xy = frag / tex_size;

        // Ray marching outside of screen space, stop searching for hits
        if(uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            break;
        }

        positionTo = texture2D(position_texture, uv.xy);

        // Invalid point to sample from
        if(positionTo.w <= 0.0) {
            continue;
        }

        search1 = mix((frag.y - startFrag.y) / deltaY, (frag.x - startFrag.x) / deltaX, useX);
        search1 = clamp(search1, 0.0, 1.0);

        viewDistance = (startView.z * endView.z) / mix(endView.z, startView.z, search1);
        depth = viewDistance - positionTo.z;

        vec3 normalTo = normalize(texture2D(normal_texture, uv.xy).xyz);
        bool differentSurface = dot(normalTo, normal) < 0.99;

        if(depth > 0.0 && depth < THICKNESS && differentSurface) {
            hit0 = 1;
            break;
        }
        search0 = search1;
    }

    // No hit found, return transparent color
    if(hit0 == 0) {
        gl_FragColor = vec4(0.0);
        return;
    }

    float searchMin = search0;
    float searchMax = search1;

    for(int i = 0; i < 32; ++i) {
        if(i >= STEPS) {
            break;
        }
        float searchMid = (searchMin + searchMax) * 0.5;

        vec2 testFrag = mix(startFrag.xy, endFrag.xy, searchMid);
        vec2 testUV = testFrag / tex_size;

        if(testUV.x < 0.0 || testUV.x > 1.0 || testUV.y < 0.0 || testUV.y > 1.0) {
            break;
        }

        positionTo = texture2D(position_texture, testUV);

        // Invalid point to sample from
        if(positionTo.w <= 0.0) {
            continue;
        }

        viewDistance = (startView.z * endView.z) / mix(endView.z, startView.z, searchMid);
        depth = viewDistance - positionTo.z;

        if(depth > 0.0 && depth < THICKNESS) {
            hit1 = 1;
            searchMax = searchMid;
            uv.xy = testUV;
        } else {
            searchMin = searchMid;
        }
    }

    float edgeFade = 1.0;
    edgeFade *= smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x);
    edgeFade *= smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);

    float distanceFade = 1.0 - clamp(length(positionTo.xyz - positionFrom.xyz) / MAX_DISTANCE, 0.0, 1.0);
    float depthFade = 1.0 - clamp(depth / THICKNESS, 0.0, 1.0) * 0.2;
    float angleFade = 1.0 - max(dot(-unitPositionFrom, pivot), 0.0);

    float visibility = float(hit1) * positionTo.w * angleFade * depthFade * distanceFade * edgeFade;
    visibility = clamp(visibility, 0.0, 1.0);

    uv.ba = vec2(visibility);

    gl_FragColor = uv;
}