// WebGL 1 / GLSL ES 1.00. All history buffers are ordinary RGBA8 textures.
export const vertex = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

export const feedback = `
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
}`;

export const composite = `
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
}`;
