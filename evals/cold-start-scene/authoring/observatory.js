const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
const mix = (a,b,t) => a+(b-a)*t;
const smooth = (a,b,t) => { const x = clamp((t-a)/(b-a),0,1); return x*x*(3-2*x); };
const escape = value => String(value).replace(/[&<>"']/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function thumbnail(seed) {
  // An original procedural SVG observation plate; it needs no external media.
  const points = Array.from({length:36},(_,i) => {
    const x = (Math.sin(i*127.1+seed)*43758.54%1+1)%1*280;
    const y = (Math.sin(i*311.7+seed)*16589.71%1+1)%1*90;
    return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${i%6===0?1.1:.45}" opacity="${i%3===0?.8:.35}"/>`;
  }).join('');
  return `<svg viewBox="0 0 280 90" aria-hidden="true"><g fill="currentColor">${points}</g><g fill="none" stroke="currentColor" stroke-width=".5" opacity=".5"><ellipse cx="140" cy="45" rx="${70+seed}" ry="22" transform="rotate(${seed*7} 140 45)"/><ellipse cx="140" cy="45" rx="${44+seed}" ry="12" transform="rotate(${seed*7} 140 45)"/><path d="M16 45H264M140 8V82" opacity=".45"/></g></svg>`;
}

export function createObservatory(section,data,field) {
  section.innerHTML = `<div class="observatory-stage">
    <div class="scene-topline"><span><i class="status-dot"></i>${escape(data.name)} / ${escape(data.season)}</span><span class="phase-label">01 — Wide field</span></div>
    <div class="scene-copy field-copy"><p class="eyebrow">A listening station for distant light</p><h1>${data.fieldTitle.map(escape).join('<br>')}</h1><p class="scene-description">${escape(data.description)}</p></div>
    <div class="scene-copy archive-copy"><p class="eyebrow">The signal archive</p><h2>${data.archiveTitle.map(escape).join('<br>')}</h2><p class="scene-description">Every observation leaves a trace.<br>These are the ones we returned to.</p></div>
    <div class="sky-instrument" aria-label="Interactive sky field">
      <div class="instrument-plane"><div class="orbit orbit-outer"></div><div class="orbit orbit-middle"></div><div class="orbit orbit-inner"></div><div class="axis axis-x"></div><div class="axis axis-y"></div>
      ${Array.from({length:12},(_,i) => `<i class="sky-tick" style="--angle:${i*30}deg"><b>${String(i*2).padStart(2,'0')}</b></i>`).join('')}
      <span class="sky-point point-a"></span><span class="sky-point point-b"></span><span class="sky-point point-c"></span><span class="target-reticle"><i></i></span></div>
      <span class="instrument-north">N / 00°</span><span class="instrument-east">06h</span><span class="field-scale">FIELD OF VIEW <b>12.8°</b></span><span class="coordinate-label">RA <b class="live-ra"></b><br>DEC <b class="live-dec"></b></span>
    </div>
    <div class="observation-detail"><span class="eyebrow">Tracking <b class="live-id"></b></span><h3 class="live-name"></h3><p class="live-note"></p><div><span>EXPOSURE <b class="live-exposure"></b></span><span>DISTANCE <b class="live-distance"></b></span></div></div>
    <div class="scroll-cue"><span class="scroll-rule"></span><span>SCROLL TO DEVELOP THE FIELD</span><b>↓</b></div>
    <div class="survey-controls"><div><span class="eyebrow">Observation strip</span><span class="selection-count"></span></div><div class="strip-navigation"><span>DRAG TO EXPLORE</span><button type="button" class="previous-target" aria-label="Previous observation">←</button><button type="button" class="next-target" aria-label="Next observation">→</button></div></div>
    <div class="survey-window" tabindex="0" role="region" aria-label="Survey observations. Drag or use arrow keys."><div class="survey-track">${data.targets.map((item,index) => `<button class="survey-card" type="button" data-record="${index}" style="--record-color:${escape(item.color)}"><span class="card-plate">${thumbnail(item.seed)}<span>${escape(item.id)}</span><i>↗</i></span><span class="card-caption"><span><b>${escape(item.name)}</b><small>${escape(item.type)}</small></span><span class="record-index">${String(index+1).padStart(2,'0')}</span></span></button>`).join('')}</div></div>
    <div class="scene-bottomline"><span>LOCAL TIME <span class="observatory-time">00:00:00</span> UTC</span><span>MOVE YOUR POINTER THROUGH THE FIELD</span><span>© NORTHLINE / FICTIONAL SKY STUDIES</span></div>
  </div>`;
  const stage = section.querySelector('.observatory-stage');
  const instrument = section.querySelector('.sky-instrument');
  const fieldCopy = section.querySelector('.field-copy');
  const archiveCopy = section.querySelector('.archive-copy');
  const detail = section.querySelector('.observation-detail');
  const track = section.querySelector('.survey-track');
  const strip = section.querySelector('.survey-window');
  const cards = [...section.querySelectorAll('.survey-card')];
  const previous = section.querySelector('.previous-target');
  const next = section.querySelector('.next-target');
  const labels = {};
  ['id','name','note','ra','dec','exposure','distance'].forEach(name => labels[name] = section.querySelector(`.live-${name}`));
  let progress = 0, selected = -1, position = 0, velocity = 0, destination = 0;
  let dragging = false, pointerId, lastX = 0, lastInput = 0, moved = 0, step = 0;
  let pointer = [.7,.56], active = 0, seed = data.targets[0].seed;
  let frame, disposed = false, lastTime = performance.now(), elapsed = 0;
  const removers = [];
  const listen = (element,event,handler,options) => {
    element.addEventListener(event,handler,options);
    removers.push(() => element.removeEventListener(event,handler,options));
  };
  function choose(index) {
    const actual = clamp(index,0,data.targets.length-1);
    if (selected === actual) return;
    selected = actual;
    const item = data.targets[selected];
    Object.entries(labels).forEach(([name,node]) => node.textContent = item[name]);
    cards.forEach((card,i) => {
      card.classList.toggle('is-current',i===selected);
      card.setAttribute('aria-pressed',String(i===selected));
    });
    section.querySelector('.selection-count').textContent = `${String(selected+1).padStart(2,'0')} / ${String(data.targets.length).padStart(2,'0')}`;
    previous.disabled = selected === 0;
    next.disabled = selected === data.targets.length-1;
    section.style.setProperty('--selected-color',item.color);
  }
  function go(index) {
    destination = clamp(index,0,data.targets.length-1);
    choose(destination);
  }
  function geometry() {
    step = cards.length > 1 ? cards[1].offsetLeft-cards[0].offsetLeft : cards[0].offsetWidth+16;
  }
  const resize = new ResizeObserver(geometry);
  resize.observe(strip);
  geometry();
  listen(previous,'click',() => go(selected-1));
  listen(next,'click',() => go(selected+1));
  listen(strip,'keydown',event => {
    const change = {ArrowLeft:-1,ArrowRight:1}[event.key];
    if (change) { event.preventDefault(); go(selected+change); }
    if (event.key === 'Home') { event.preventDefault(); go(0); }
    if (event.key === 'End') { event.preventDefault(); go(data.targets.length-1); }
  });
  listen(strip,'pointerdown',event => {
    if (event.button !== 0) return;
    dragging = true;
    pointerId = event.pointerId;
    lastX = event.clientX;
    lastInput = performance.now();
    moved = 0;
    velocity = 0;
    strip.setPointerCapture(pointerId);
    strip.classList.add('is-dragging');
  });
  listen(strip,'pointermove',event => {
    if (!dragging || event.pointerId !== pointerId) return;
    const now = performance.now();
    const dx = event.clientX-lastX;
    const dt = Math.max(8,now-lastInput)/1000;
    const outside = position < 0 || position > data.targets.length-1;
    const movement = -dx/step*(outside?.34:1);
    position += movement;
    velocity = mix(velocity,movement/dt,.7);
    lastX = event.clientX;
    lastInput = now;
    moved += Math.abs(dx);
    choose(Math.round(position));
  });
  const release = event => {
    if (!dragging || event.pointerId !== pointerId) return;
    dragging = false;
    if (performance.now()-lastInput > 90) velocity *= .2;
    destination = clamp(Math.round(position+velocity*.15),0,data.targets.length-1);
    choose(destination);
    strip.classList.remove('is-dragging');
    if (strip.hasPointerCapture(pointerId)) strip.releasePointerCapture(pointerId);
  };
  listen(strip,'pointerup',release);
  listen(strip,'pointercancel',release);
  listen(strip,'click',event => {
    if (moved > 6) { event.preventDefault(); return; }
    const card = event.target.closest('[data-record]');
    if (card) go(Number(card.dataset.record));
  });
  listen(stage,'pointermove',event => {
    const rect = stage.getBoundingClientRect();
    pointer = [clamp((event.clientX-rect.left)/rect.width,0,1),clamp(1-(event.clientY-rect.top)/rect.height,0,1)];
    active = 1;
  });
  listen(stage,'pointerleave',() => active = 0);
  const unregister = field.register(stage,() => ({ pointer,active,progress,seed,accent:data.accent,archiveAccent:data.archiveAccent,retention:data.retention,flow:data.flow,wake:data.wake }));
  choose(0);
  function tick(now) {
    if (disposed) return;
    const dt = Math.min(.034,(now-lastTime)/1000);
    lastTime = now;
    elapsed += dt;
    active = Math.max(0,active-dt*4);
    const rect = section.getBoundingClientRect();
    progress = smooth(0,1,clamp(-rect.top/(section.offsetHeight-stage.offsetHeight),0,1));
    const phase = smooth(.12,.8,progress);
    stage.style.setProperty('--phase',phase.toFixed(5));
    fieldCopy.style.transform = `translateY(${-phase*74}px)`;
    fieldCopy.style.opacity = 1-smooth(.05,.65,phase);
    archiveCopy.style.transform = `translateY(${(1-phase)*56}px)`;
    archiveCopy.style.opacity = smooth(.38,.92,phase);
    instrument.style.transform = `translateY(${-phase*32}px) scaleY(${1-phase*.38}) rotate(${-phase*12}deg)`;
    detail.style.transform = `translateY(${-phase*18}px)`;
    section.querySelector('.phase-label').textContent = progress > .52 ? '02 — Signal archive' : '01 — Wide field';
    section.querySelector('.scroll-cue').style.opacity = 1-smooth(.05,.5,progress);
    if (!dragging) {
      const force = (destination-position)*data.spring;
      velocity += force*dt;
      velocity *= Math.exp(-(data.dragFriction+7.2)*dt);
      position += velocity*dt;
      if (Math.abs(destination-position)<.0002 && Math.abs(velocity)<.001) { position=destination; velocity=0; }
    }
    track.style.transform = `translate3d(${-position*step}px,0,0)`;
    cards.forEach((card,index) => {
      const distance = Math.abs(index-position);
      card.style.opacity = clamp(1-distance*.17,.43,1);
      card.style.transform = `translateY(${Math.min(distance,2)*7}px)`;
    });
    seed = mix(seed,data.targets[selected].seed,1-Math.exp(-dt*2.5));
    const seconds = Math.floor(elapsed);
    section.querySelector('.observatory-time').textContent = `03:${String(14+Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
  return { destroy() { disposed=true; cancelAnimationFrame(frame); resize.disconnect(); unregister(); removers.forEach(remove=>remove()); section.innerHTML=''; } };
}
