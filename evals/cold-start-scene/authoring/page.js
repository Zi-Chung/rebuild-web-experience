import './scene.css';
import { survey } from './survey-data.js';

// The visible render surface belongs to page chrome, before the scoped section.
const canvas = document.createElement('canvas');
canvas.id = 'page-render-surface';
canvas.setAttribute('aria-hidden','true');
document.body.prepend(canvas);
const [{ createSharedField },{ createObservatory }] = await Promise.all([
  import('./shared-field.js'), import('./observatory.js'),
]);
const field = createSharedField(canvas);
const observatory = createObservatory(document.querySelector('#observatory'),survey,field);
document.querySelector('[data-enter]').addEventListener('click',() => document.querySelector('#observatory').scrollIntoView({behavior:'smooth'}));
window.addEventListener('pagehide',() => { observatory.destroy(); field.destroy(); },{once:true});
