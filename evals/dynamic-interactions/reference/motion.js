const tile = document.querySelector('.tile');
const track = document.querySelector('.track');
const status = document.querySelector('.status');
const story = document.querySelector('.story');
const fill = document.querySelector('.fill');
const orb = document.querySelector('.orb');
const phase = document.querySelector('.phase');
let position = 0;
let velocity = 0;
let activePointer = null;
let previousX = 0;
let previousInputTime = 0;
let shownProgress = 0;
let previousFrameTime = performance.now();

tile.addEventListener('pointerdown', (event) => {
  if (activePointer !== null || event.button !== 0) return;
  activePointer = event.pointerId;
  tile.setPointerCapture(activePointer);
  previousX = event.clientX;
  previousInputTime = event.timeStamp;
  velocity = 0;
  status.textContent = 'Dragging';
});

tile.addEventListener('pointermove', (event) => {
  if (event.pointerId !== activePointer) return;
  const seconds = Math.max((event.timeStamp - previousInputTime) / 1000, 0.001);
  const limit = Math.max(0, (track.clientWidth - tile.offsetWidth) / 2);
  const next = Math.max(-limit, Math.min(limit, position + event.clientX - previousX));
  velocity = velocity * 0.35 + ((next - position) / seconds) * 0.65;
  position = next;
  previousX = event.clientX;
  previousInputTime = event.timeStamp;
});

function finishDrag(event) {
  if (event.pointerId !== activePointer) return;
  if (event.type === 'pointercancel') velocity = 0;
  if (event.timeStamp - previousInputTime > 100) velocity = 0;
  velocity = Math.max(-1800, Math.min(1800, velocity));
  activePointer = null;
  if (tile.hasPointerCapture(event.pointerId)) tile.releasePointerCapture(event.pointerId);
  status.textContent = 'Returning';
}
tile.addEventListener('pointerup', finishDrag);
tile.addEventListener('pointercancel', finishDrag);
tile.addEventListener('lostpointercapture', (event) => {
  if (event.pointerId === activePointer) {
    activePointer = null;
    velocity = 0;
    status.textContent = 'Returning';
  }
});

function render(time) {
  const seconds = Math.min(Math.max((time - previousFrameTime) / 1000, 0), 0.032);
  previousFrameTime = time;
  if (activePointer === null) {
    velocity += (-140 * position - 12 * velocity) * seconds;
    position += velocity * seconds;
    if (Math.abs(position) < 0.02 && Math.abs(velocity) < 0.1) {
      position = 0;
      velocity = 0;
      status.textContent = 'Ready';
    }
  }
  tile.style.transform = `translateX(${position}px)`;
  const targetProgress = story.scrollTop / (story.scrollHeight - story.clientHeight);
  shownProgress += (targetProgress - shownProgress) * (1 - Math.exp(-seconds / 0.22));
  fill.style.transform = `scaleX(${shownProgress})`;
  orb.style.transform = `translateX(${Math.sin(shownProgress * Math.PI * 2) * 160}px) rotate(${shownProgress * 360}deg)`;
  phase.textContent = shownProgress < 1 / 3 ? 'Discover' : shownProgress < 2 / 3 ? 'Build' : 'Share';
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
