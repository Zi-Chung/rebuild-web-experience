var _=`
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,P=`
precision highp float;
varying vec2 vUv;
uniform sampler2D uHistory;
uniform vec2 uTexel;
uniform vec2 uSize;
uniform vec2 uPointer;
uniform vec2 uPrevious;
uniform float uActive;
uniform float uTime;
uniform float uDelta;
uniform float uProgress;
uniform float uRetention;
uniform float uFlow;
uniform float uWake;
uniform float uSeed;
float segment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p-a, ba = b-a;
  return length(pa-ba*clamp(dot(pa,ba)/(dot(ba,ba)+0.00001),0.0,1.0));
}
void main() {
  float ratio = uSize.x / uSize.y;
  vec2 q = vUv - vec2(0.70,0.56);
  vec2 curl = vec2(sin(q.y*11.0+uTime*.21+uSeed), cos(q.x*10.0-uTime*.17));
  vec2 drift = vec2(-q.y,q.x)*0.0018 + curl*0.00065*uFlow;
  drift.x += uProgress*0.0012;
  vec2 uv = clamp(vUv-drift*uDelta, uTexel, 1.0-uTexel);
  vec3 old = texture2D(uHistory,uv).rgb*0.56;
  old += texture2D(uHistory,uv+vec2(uTexel.x,0.0)).rgb*.11;
  old += texture2D(uHistory,uv-vec2(uTexel.x,0.0)).rgb*.11;
  old += texture2D(uHistory,uv+vec2(0.0,uTexel.y)).rgb*.11;
  old += texture2D(uHistory,uv-vec2(0.0,uTexel.y)).rgb*.11;
  old = max(vec3(0.0),old*pow(uRetention,uDelta)-vec3(.0016*uDelta));
  vec2 p = vUv*vec2(ratio,1.0);
  float d = segment(p,uPointer*vec2(ratio,1.0),uPrevious*vec2(ratio,1.0));
  float ink = exp(-d*d/0.00040)*uActive*uWake;
  vec2 source = vec2(.70,.56)+vec2(cos(uTime*.18+uSeed)*.115,sin(uTime*.23)*.13);
  float beacon = exp(-pow(length((vUv-source)*vec2(ratio,1.0))/.023,2.0));
  vec3 pigment = mix(vec3(.34,.87,.72),vec3(.98,.46,.27),uProgress);
  gl_FragColor = vec4(clamp(old+pigment*(ink*.20+beacon*.022)*uDelta,0.0,1.0),1.0);
}`,U=`
precision highp float;
varying vec2 vUv;
uniform sampler2D uHistory;
uniform vec2 uSize;
uniform float uTime;
uniform float uProgress;
uniform float uSeed;
uniform vec3 uAccent;
uniform vec3 uArchiveAccent;
float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
void main() {
  vec2 uv = vUv;
  float aspect = uSize.x/uSize.y;
  vec2 p = (uv-vec2(.70,.56))*vec2(aspect,1.0);
  p.y *= mix(1.0,2.65,uProgress);
  float radius = length(p), angle = atan(p.y,p.x);
  float bend = sin(angle*3.0+radius*17.0-uTime*.16+uSeed)*.018;
  float rings = .5+.5*sin((radius+bend)*108.0-angle*2.0+uTime*.18);
  float filament = pow(rings,8.0)*exp(-pow((radius-.24)/.15,2.0));
  float spiral = .5+.5*sin(angle*4.0-radius*28.0+uTime*.11+uSeed);
  float cloud = pow(spiral,3.0)*exp(-pow((radius-.26)/.17,2.0));
  float core = exp(-pow(radius/.115,2.0));
  vec3 accent = mix(uAccent,uArchiveAccent,uProgress);
  vec3 base = mix(vec3(.020,.041,.055),vec3(.061,.035,.033),uProgress);
  vec3 color = base + vec3(.024,.035,.048)*cloud;
  color += accent*(filament*.23+core*.10+cloud*.065);
  vec3 history = texture2D(uHistory,uv).rgb;
  color += history*.88;
  color += accent*pow(dot(history,vec3(.333)),1.7)*.26;
  vec2 cell = floor(uv*uSize/4.0);
  float star = step(.9988,hash(cell+floor(uSeed)));
  color += star*.22*(.75+.25*sin(uTime+hash(cell)*20.0));
  float vignette = smoothstep(.9,.15,length((uv-.5)*vec2(1.2,1.0)));
  color *= .65+.35*vignette;
  color += (hash(gl_FragCoord.xy+fract(uTime)*.01)-.5)*.008;
  gl_FragColor = vec4(color,1.0);
}`;function I(m){let e=m.getContext("webgl",{alpha:!1,antialias:!1,depth:!1,preserveDrawingBuffer:!1});if(!e)throw new Error("The sky field requires WebGL.");let l=new Set,v=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,v),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW);function R(o){let u=(t,a)=>{let n=e.createShader(t);if(e.shaderSource(n,a),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(n));return n},r=[u(e.VERTEX_SHADER,_),u(e.FRAGMENT_SHADER,o)],i=e.createProgram();if(r.forEach(t=>e.attachShader(i,t)),e.linkProgram(i),r.forEach(t=>e.deleteShader(t)),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(i));let f={};for(let t=0;t<e.getProgramParameter(i,e.ACTIVE_UNIFORMS);t++){let a=e.getActiveUniform(i,t).name;f[a]=e.getUniformLocation(i,a)}return{program:i,uniforms:f,position:e.getAttribLocation(i,"aPosition")}}let d=R(P),h=R(U);function p(o){e.useProgram(o.program),e.bindBuffer(e.ARRAY_BUFFER,v),e.enableVertexAttribArray(o.position),e.vertexAttribPointer(o.position,2,e.FLOAT,!1,0,0)}function x(o,u){let r=e.createTexture();e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,o,u,0,e.RGBA,e.UNSIGNED_BYTE,null);let i=e.createFramebuffer();if(e.bindFramebuffer(e.FRAMEBUFFER,i),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,r,0),e.checkFramebufferStatus(e.FRAMEBUFFER)!==e.FRAMEBUFFER_COMPLETE)throw new Error("Sky history framebuffer is incomplete.");return e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),{texture:r,framebuffer:i}}let A=o=>{let u=parseInt(o.slice(1),16);return[(u>>16&255)/255,(u>>8&255)/255,(u&255)/255]};function g(o){(o.targets||[]).forEach(u=>{e.deleteTexture(u.texture),e.deleteFramebuffer(u.framebuffer)})}function M(o,u){let r=Math.max(2,Math.round(Math.min(1e3,u.width*.6))),i=Math.max(2,Math.round(r*u.height/u.width));o.width===r&&o.height===i||(g(o),o.width=r,o.height=i,o.targets=[x(r,i),x(r,i)],o.front=0)}let b=performance.now(),T,E=0;function F(o){let u=Math.min(2.5,(o-b)/16.6667);b=o,E+=u/60;let r=Math.min(window.devicePixelRatio||1,1.6),i=Math.round(innerWidth*r),f=Math.round(innerHeight*r);(m.width!==i||m.height!==f)&&(m.width=i,m.height=f),e.bindFramebuffer(e.FRAMEBUFFER,null),e.disable(e.SCISSOR_TEST),e.viewport(0,0,i,f),e.clearColor(.025,.04,.05,1),e.clear(e.COLOR_BUFFER_BIT),l.forEach(t=>{let a=t.element.getBoundingClientRect();if(a.bottom<=0||a.top>=innerHeight)return;M(t,a);let n=t.read(),y=t.targets[t.front],S=t.targets[1-t.front];e.disable(e.SCISSOR_TEST),e.bindFramebuffer(e.FRAMEBUFFER,S.framebuffer),e.viewport(0,0,t.width,t.height),p(d);let c=d.uniforms;e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,y.texture),e.uniform1i(c.uHistory,0),e.uniform2f(c.uTexel,1/t.width,1/t.height),e.uniform2f(c.uSize,a.width,a.height),e.uniform2fv(c.uPointer,n.pointer),e.uniform2fv(c.uPrevious,t.previous||n.pointer),e.uniform1f(c.uActive,n.active),e.uniform1f(c.uTime,E),e.uniform1f(c.uDelta,u),e.uniform1f(c.uProgress,n.progress),e.uniform1f(c.uRetention,n.retention),e.uniform1f(c.uFlow,n.flow),e.uniform1f(c.uWake,n.wake),e.uniform1f(c.uSeed,n.seed),e.drawArrays(e.TRIANGLES,0,6),t.previous=[...n.pointer],t.front=1-t.front,e.bindFramebuffer(e.FRAMEBUFFER,null),e.enable(e.SCISSOR_TEST);let w=Math.round(f-a.bottom*r);e.viewport(Math.round(a.left*r),w,Math.round(a.width*r),Math.round(a.height*r)),e.scissor(Math.max(0,Math.round(a.left*r)),Math.max(0,w),Math.round(a.width*r),Math.min(f,Math.round(a.height*r))),p(h);let s=h.uniforms;e.bindTexture(e.TEXTURE_2D,S.texture),e.uniform1i(s.uHistory,0),e.uniform2f(s.uSize,a.width,a.height),e.uniform1f(s.uTime,E),e.uniform1f(s.uProgress,n.progress),e.uniform1f(s.uSeed,n.seed),e.uniform3fv(s.uAccent,A(n.accent)),e.uniform3fv(s.uArchiveAccent,A(n.archiveAccent)),e.drawArrays(e.TRIANGLES,0,6)}),T=requestAnimationFrame(F)}return T=requestAnimationFrame(F),{register(o,u){let r={element:o,read:u,front:0};return l.add(r),()=>{l.delete(r),g(r)}},destroy(){cancelAnimationFrame(T),l.forEach(g),l.clear(),e.deleteProgram(d.program),e.deleteProgram(h.program),e.deleteBuffer(v)}}}export{I as createSharedField};
