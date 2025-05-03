precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 viewer_position;
uniform float viewer_scale;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float worley(vec2 st, float scale) {
  st *= scale;
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);

  float min_dist = 1.0;
  
  for(int y=-1; y<=1; y++) {
    for(int x=-1; x<=1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = vec2(
        random(i_st + neighbor),
        random(i_st + neighbor + 1.23)
      );
      // Animate the feature points
      point = 0.3 + 0.7 * sin(u_time + 6.2831 * point);
      vec2 diff = neighbor + point - f_st;
      float dist = length(diff);
      min_dist = min(min_dist, dist);
    }
  }
  return min_dist;
}

void main() {
  vec2 st = (gl_FragCoord.xy - viewer_position) / (u_resolution * viewer_scale);
  st.x *= u_resolution.x / u_resolution.y;
  
  float noise = worley(st, 8.0);
  vec3 color = vec3(noise);

  gl_FragColor = vec4(color, 1.0);
}
