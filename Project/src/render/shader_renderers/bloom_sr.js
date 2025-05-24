
export class BloomShaderRenderer {
    constructor(regl, resourceManager) {
      this.regl = regl;
  
      // Bright pass filter
      this.brightPass = regl({
        frag: `
          precision mediump float;
          uniform sampler2D u_input;
          varying vec2 v_uv;
  
          void main() {
            vec4 color = texture2D(u_input, v_uv);
            float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
            gl_FragColor = brightness > 0.25 ? color : vec4(0.0);
          }
        `,
        vert: basicVert(),
        attributes: { position: [[-1,-1],[1,-1],[1,1],[-1,1]] },
        elements: [[0, 1, 2], [0, 2, 3]],
        uniforms: {
          u_input: regl.prop('texture')
        },
        framebuffer: regl.prop('dst')
      });
  
      // Gaussian blur horizontal and vertical
      this.blur = regl({
        frag: `
          precision mediump float;
          varying vec2 v_uv;
          uniform sampler2D u_input;
          uniform vec2 u_direction;
  
          void main() {
            float weights[5];
            weights[0] = 0.204164;
            weights[1] = 0.304005;
            weights[2] = 0.093913;
            weights[3] = 0.015624;
            weights[4] = 0.002216;
  
            vec4 sum = texture2D(u_input, v_uv) * weights[0];
            for (int i = 1; i < 5; ++i) {
              sum += texture2D(u_input, v_uv + u_direction * float(i)) * weights[i];
              sum += texture2D(u_input, v_uv - u_direction * float(i)) * weights[i];
            }
  
            gl_FragColor = sum;
          }
        `,
        vert: basicVert(),
        attributes: { position: [[-1,-1],[1,-1],[1,1],[-1,1]] },
        elements: [[0, 1, 2], [0, 2, 3]],
        uniforms: {
          u_input: regl.prop('texture'),
          u_direction: regl.prop('direction')
        },
        framebuffer: regl.prop('dst')
      });
  
      // Combine blur + original
      this.combine = regl({
        frag: `
          precision mediump float;
          varying vec2 v_uv;
          uniform sampler2D u_original;
          uniform sampler2D u_bloom;
  
          void main() {
            vec4 orig = texture2D(u_original, v_uv);
            vec4 bloom = texture2D(u_bloom, v_uv);
            gl_FragColor = orig + bloom;
          }
        `,
        vert: basicVert(),
        attributes: { position: [[-1,-1],[1,-1],[1,1],[-1,1]] },
        elements: [[0, 1, 2], [0, 2, 3]],
        uniforms: {
          u_original: regl.prop('original'),
          u_bloom: regl.prop('bloom')
        },
        framebuffer: regl.prop('dst')
      });
    }
  
    apply(mesh, inputBuffer, outputBuffer) {
      const temp1 = this.createTempBuffer();
      const temp2 = this.createTempBuffer();
  
      // 1. Extract bright parts
      this.brightPass({ texture: inputBuffer, dst: temp1 });
  
      // 2. Blur horizontally then vertically
      this.blur({ texture: temp1, direction: [1.0 / inputBuffer.width, 0.0], dst: temp2 });
      this.blur({ texture: temp2, direction: [0.0, 1.0 / inputBuffer.height], dst: temp1 });
  
      // 3. Combine
      this.combine({
        original: inputBuffer,
        bloom: temp1,
        dst: outputBuffer
      });
  
      return outputBuffer;
    }
  
    createTempBuffer() {
      return this.regl.framebuffer({
        width: 512,
        height: 512,
        colorFormat: 'rgba',
        colorType: 'float',
        stencil: false,
        depth: false,
      });
    }
  }
  
  function basicVert() {
    return `
      precision mediump float;
      attribute vec2 position;
      varying vec2 v_uv;
      void main() {
        v_uv = 0.5 * (position + 1.0);
        gl_Position = vec4(position, 0, 1);
      }
    `;
  }
  