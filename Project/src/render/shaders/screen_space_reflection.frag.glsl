precision highp float;

uniform mat4 lens_projection;

uniform sampler2D position_texture;
uniform sampler2D normal_texture;
uniform vec2 tex_size;

const float MAX_DISTANCE = 15.0;
const float THICKNESS = 0.05;
const float RESOLUTION = 0.8;

void main() {
    int steps = 8;

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

    // Ray setup with small initial offset to avoid self-intersection
    vec4 startView = vec4(positionFrom.xyz + (pivot * 0.075), 1.0);
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
    int delta = int(max(deltaF, 1.0));
    vec2 increment = vec2(deltaX, deltaY) / max(deltaF, 0.001);

    vec4 positionTo = vec4(0);
    float search0 = 0.0;
    float search1 = 0.0;
    int hit0 = 0;
    int hit1 = 0;
    float viewDistance = 0.0;
    float depth = 0.0;

    for(int i = 0; i < 128; ++i) {
        if(i >= delta) {
            break;
        }
        frag += increment;
        uv.xy = frag / tex_size;

        if(uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            break;
        }
        positionTo = texture2D(position_texture, uv.xy);

        search1 = mix((frag.y - startFrag.y) / deltaY, (frag.x - startFrag.x) / deltaX, useX);
        viewDistance = (startView.z * endView.z) / mix(endView.z, startView.z, search1);
        depth = viewDistance - positionTo.z;

        if(depth > 0.0 && depth < THICKNESS) {
            hit0 = 1;
            break;
        } else {
            search0 = search1;
        }
    }

    search1 = search0 + ((search1 - search0) / 2.0);
    steps *= hit0;

    for(int i = 0; i <= 8; ++i) {
        if(i >= steps) {
            break;
        }
        frag = mix(startFrag.xy, endFrag.xy, search1);
        uv.xy = frag / tex_size;
        positionTo = texture2D(position_texture, uv.xy);

        viewDistance = (startView.z * endView.z) / mix(endView.z, startView.z, search1);
        depth = viewDistance - positionTo.z;

        if(depth > 0.0 && depth < THICKNESS) {
            hit1 = 1;
            search1 = search0 + ((search1 - search0) / 2.0);
        } else {
            float temp = search1;
            search1 = search1 + ((search1 - search0) / 2.0);
            search0 = temp;
        }
    }

    float visibility = float(hit1) * positionTo.w * (1.0 - max(dot(-unitPositionFrom, pivot), 0.0)) * (1.0 - clamp(depth / THICKNESS, 0.0, 1.0)) * (1.0 - clamp(length(positionTo - positionFrom) / MAX_DISTANCE, 0.0, 1.0)) * ((uv.x < 0.0 || uv.x > 1.0) ? 0.0 : 1.0) * ((uv.y < 0.0 || uv.y > 1.0) ? 0.0 : 1.0);

    visibility = clamp(visibility, 0.0, 1.0);
    uv.ba = vec2(visibility);

    // For debugging
    // gl_FragColor = vec4(float(hit0), float(hit1), visibility, 1.0);

    gl_FragColor = uv;
}