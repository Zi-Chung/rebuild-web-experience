// Original, fictional survey records. No remote data or image assets are used.
export const survey = {
  name: 'Northline',
  season: 'Survey 08 / Northern sky',
  fieldTitle: ['A field', 'in motion.'],
  archiveTitle: ['Traces worth', 'keeping.'],
  description: 'An atlas of faint signals. Move through the field, then follow a trace into the archive.',
  accent: '#b7f2d4',
  archiveAccent: '#f3b79c',
  retention: 0.982,
  flow: 0.62,
  wake: 1.05,
  dragFriction: 5.2,
  spring: 95,
  targets: [
    { id: 'N–041', name: 'The quiet arc', type: 'Diffuse emission', ra: '21h 18m 42s', dec: '+62° 11′ 08″', distance: '4.2 kly', exposure: '18.4 h', color: '#b7f2d4', seed: 1.4, note: 'A soft boundary between dust and light.' },
    { id: 'N–087', name: 'Tidal corridor', type: 'Stellar stream', ra: '02h 46m 17s', dec: '+41° 32′ 19″', distance: '8.6 kly', exposure: '26.1 h', color: '#b2c9ff', seed: 3.1, note: 'Two currents share a narrow passage.' },
    { id: 'N–112', name: 'Amber relay', type: 'Variable source', ra: '18h 04m 33s', dec: '+55° 09′ 24″', distance: '2.9 kly', exposure: '12.7 h', color: '#f3b79c', seed: 5.7, note: 'A small pulse inside a warmer cloud.' },
    { id: 'N–156', name: 'Blue interval', type: 'Reflection cloud', ra: '05h 39m 05s', dec: '+72° 46′ 12″', distance: '6.1 kly', exposure: '31.6 h', color: '#a7daed', seed: 8.2, note: 'A long pause, measured in scattered light.' },
    { id: 'N–203', name: 'Last light basin', type: 'Dark nebula', ra: '23h 12m 56s', dec: '+38° 27′ 51″', distance: '5.4 kly', exposure: '22.3 h', color: '#d9c0f5', seed: 10.6, note: 'The edge of a shape that almost disappears.' },
  ],
};
