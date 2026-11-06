import { vertex, feedback, composite } from './shaders.js';

// The page owns one fixed render surface. Sections register their bounds and
// state; a section's DOM intentionally does not contain its visible canvas.
export function createSharedField(canvas) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, preserveDrawingBuffer: false });
  if (!gl) throw new Error('The sky field requires WebGL.');
  const panels = new Set();
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

  function program(fragment) {
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    };
    const shaders = [compile(gl.VERTEX_SHADER, vertex), compile(gl.FRAGMENT_SHADER, fragment)];
    const result = gl.createProgram();
    shaders.forEach(shader => gl.attachShader(result, shader));
    gl.linkProgram(result);
    shaders.forEach(shader => gl.deleteShader(shader));
    if (!gl.getProgramParameter(result, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(result));
    const uniforms = {};
    for (let i = 0; i < gl.getProgramParameter(result, gl.ACTIVE_UNIFORMS); i++) {
      const name = gl.getActiveUniform(result,i).name;
      uniforms[name] = gl.getUniformLocation(result,name);
    }
    return { program: result, uniforms, position: gl.getAttribLocation(result,'aPosition') };
  }
  const simulation = program(feedback);
  const presentation = program(composite);

  function use(shader) {
    gl.useProgram(shader.program);
    gl.bindBuffer(gl.ARRAY_BUFFER,quad);
    gl.enableVertexAttribArray(shader.position);
    gl.vertexAttribPointer(shader.position,2,gl.FLOAT,false,0,0);
  }
  function target(width,height) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('Sky history framebuffer is incomplete.');
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { texture, framebuffer };
  }
  const color = hex => {
    const value = parseInt(hex.slice(1),16);
    return [(value>>16&255)/255,(value>>8&255)/255,(value&255)/255];
  };
  function releaseTargets(panel) {
    (panel.targets || []).forEach(item => {
      gl.deleteTexture(item.texture);
      gl.deleteFramebuffer(item.framebuffer);
    });
  }
  function size(panel,rect) {
    const width = Math.max(2,Math.round(Math.min(1000,rect.width*.6)));
    const height = Math.max(2,Math.round(width*rect.height/rect.width));
    if (panel.width === width && panel.height === height) return;
    releaseTargets(panel);
    panel.width = width;
    panel.height = height;
    panel.targets = [target(width,height),target(width,height)];
    panel.front = 0;
  }
  let last = performance.now(), frame, time = 0;
  function render(now) {
    const delta = Math.min(2.5,(now-last)/16.6667);
    last = now;
    time += delta/60;
    const dpr = Math.min(window.devicePixelRatio || 1,1.6);
    const width = Math.round(innerWidth*dpr), height = Math.round(innerHeight*dpr);
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    gl.disable(gl.SCISSOR_TEST);
    gl.viewport(0,0,width,height);
    gl.clearColor(.025,.04,.05,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    panels.forEach(panel => {
      const rect = panel.element.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= innerHeight) return;
      size(panel,rect);
      const state = panel.read();
      const front = panel.targets[panel.front], back = panel.targets[1-panel.front];
      gl.disable(gl.SCISSOR_TEST);
      gl.bindFramebuffer(gl.FRAMEBUFFER,back.framebuffer);
      gl.viewport(0,0,panel.width,panel.height);
      use(simulation);
      const u = simulation.uniforms;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D,front.texture);
      gl.uniform1i(u.uHistory,0);
      gl.uniform2f(u.uTexel,1/panel.width,1/panel.height);
      gl.uniform2f(u.uSize,rect.width,rect.height);
      gl.uniform2fv(u.uPointer,state.pointer);
      gl.uniform2fv(u.uPrevious,panel.previous || state.pointer);
      gl.uniform1f(u.uActive,state.active);
      gl.uniform1f(u.uTime,time);
      gl.uniform1f(u.uDelta,delta);
      gl.uniform1f(u.uProgress,state.progress);
      gl.uniform1f(u.uRetention,state.retention);
      gl.uniform1f(u.uFlow,state.flow);
      gl.uniform1f(u.uWake,state.wake);
      gl.uniform1f(u.uSeed,state.seed);
      gl.drawArrays(gl.TRIANGLES,0,6);
      panel.previous = [...state.pointer];
      panel.front = 1-panel.front;
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);
      gl.enable(gl.SCISSOR_TEST);
      const bottom = Math.round(height-rect.bottom*dpr);
      gl.viewport(Math.round(rect.left*dpr),bottom,Math.round(rect.width*dpr),Math.round(rect.height*dpr));
      gl.scissor(Math.max(0,Math.round(rect.left*dpr)),Math.max(0,bottom),Math.round(rect.width*dpr),Math.min(height,Math.round(rect.height*dpr)));
      use(presentation);
      const p = presentation.uniforms;
      gl.bindTexture(gl.TEXTURE_2D,back.texture);
      gl.uniform1i(p.uHistory,0);
      gl.uniform2f(p.uSize,rect.width,rect.height);
      gl.uniform1f(p.uTime,time);
      gl.uniform1f(p.uProgress,state.progress);
      gl.uniform1f(p.uSeed,state.seed);
      gl.uniform3fv(p.uAccent,color(state.accent));
      gl.uniform3fv(p.uArchiveAccent,color(state.archiveAccent));
      gl.drawArrays(gl.TRIANGLES,0,6);
    });
    frame = requestAnimationFrame(render);
  }
  frame = requestAnimationFrame(render);
  return {
    register(element,read) {
      const panel = { element,read,front:0 };
      panels.add(panel);
      return () => { panels.delete(panel); releaseTargets(panel); };
    },
    destroy() {
      cancelAnimationFrame(frame);
      panels.forEach(releaseTargets);
      panels.clear();
      gl.deleteProgram(simulation.program);
      gl.deleteProgram(presentation.program);
      gl.deleteBuffer(quad);
    },
  };
}
