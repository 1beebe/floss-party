// Floss Tooth kit: the on-model tooth, its faces, and the playback loop shared by
// the newer animations (Jump Rope, Swing, Whip, Web). Follows design/model-sheet.
(function () {
  const INK = '#262A27', ENAMEL = '#FBF6EC', FLOSS = '#BFF2DC', BLUSH = '#F7A7B8';
  const TAU = Math.PI * 2;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, p) => a + (b - a) * p;
  const eIO = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  const eOut = p => 1 - (1 - p) * (1 - p);
  const eIn = p => p * p;
  const rad = d => d * Math.PI / 180;
  const bump = (t, a, b) => Math.sin(Math.PI * seg(t, a, b));   // 0 → 1 → 0 across [a, b]

  // Keyframes [[time, value], ...], eased between keys.
  function kf(t, keys, ease = eIO) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
        return lerp(v0, v1, ease((t - t0) / (t1 - t0)));
      }
    }
    return keys[keys.length - 1][1];
  }

  const BODY = 'M112 222 C122 260 125 305 145 314 C165 323 180 312 182 290 C184 265 186 250 202 250 C218 250 220 265 222 290 C224 312 239 323 259 314 C279 305 282 260 292 222 L298 192 C304 170 306 150 306 135 C306 100 290 80 262 80 C236 80 222 94 202 96 C182 94 168 80 142 80 C114 80 98 100 98 135 C98 150 100 170 106 192 Z';
  const SHOULDER_L = [110, 205], SHOULDER_R = [294, 205], ARM = 32;
  const BASE = [202, 318], CENTER = [202, 199];
  const EYES = [164, 240], EYE_Y = 170;

  const SPARKLE = 'M0 -12 C1.5 -3 3 -1.5 12 0 C3 1.5 1.5 3 0 12 C-1.5 3 -3 1.5 -12 0 C-3 -1.5 -1.5 -3 0 -12Z';

  // The tooth, front view. `hat` is markup drawn on the crown and moved with it.
  function tooth(hat = '') {
    const capS = '<rect x="-16" y="-12" width="52" height="24" rx="12"/>';
    const capF = '<rect x="-12.5" y="-8.5" width="45" height="17" rx="8.5"/>';
    return `
    <g id="char">
      <g stroke="${INK}" stroke-width="7" fill="${ENAMEL}">
        <g id="armLs">${capS}</g><g id="armRs">${capS}</g>
        <path stroke-linejoin="round" d="${BODY}"/>
      </g>
      <g fill="${ENAMEL}"><g id="armLf">${capF}</g><g id="armRf">${capF}</g></g>
      <g id="blush" fill="${BLUSH}" opacity="0"><ellipse cx="140" cy="196" rx="13" ry="7"/><ellipse cx="264" cy="196" rx="13" ry="7"/></g>
      <ellipse id="eyeL" cx="164" cy="170" rx="9" ry="12" fill="${INK}"/>
      <ellipse id="eyeR" cx="240" cy="170" rx="9" ry="12" fill="${INK}"/>
      <rect id="lidL" x="150" y="150" width="28" height="0" fill="${ENAMEL}"/>
      <rect id="lidR" x="226" y="150" width="28" height="0" fill="${ENAMEL}"/>
      <g fill="none" stroke="${INK}" stroke-width="5.5" stroke-linecap="round">
        <path id="arcL" d="M153 174 Q164 158 175 174" opacity="0"/>
        <path id="arcR" d="M229 174 Q240 158 251 174" opacity="0"/>
        <path id="smile" d="M188 198 Q202 212 216 198" opacity="0"/>
        <path id="flat" d="M193 204 L211 204" opacity="0"/>
      </g>
      <ellipse id="mouthO" cx="202" cy="204" rx="5" ry="6" fill="${INK}" opacity="0"/>
      <path id="mouthOpen" d="M185 196 Q202 224 219 196 Z" fill="${INK}" stroke="${INK}" stroke-width="3" stroke-linejoin="round" opacity="0"/>
      <path id="sweat" d="M0 -11 C4 -4 8 1 8 5 A8 8 0 0 1 -8 5 C-8 1 -4 -4 0 -11Z" fill="#CDEBFF" stroke="${INK}" stroke-width="3" opacity="0" transform="translate(292 126)"/>
      <g id="hat">${hat}</g>
    </g>`;
  }

  // Wires up the tooth's parts inside `root` and returns helpers to pose it each frame.
  function rig(root) {
    const q = id => root.querySelector('#' + id);
    const el = {};
    ['char', 'armLs', 'armRs', 'armLf', 'armRf', 'blush', 'eyeL', 'eyeR', 'lidL', 'lidR', 'arcL', 'arcR',
      'smile', 'flat', 'mouthO', 'mouthOpen', 'sweat', 'hat'].forEach(id => el[id] = q(id));

    let m = { x: 0, y: 0, rot: 0, sx: 1, sy: 1, s: 1 };

    // Whole-body placement: squash about the feet, rotate about the middle, then move.
    function place(o = {}) {
      m = Object.assign({ x: 0, y: 0, rot: 0, sx: 1, sy: 1, s: 1 }, o);
      el.char.setAttribute('transform',
        `translate(${m.x} ${m.y}) rotate(${m.rot} ${CENTER[0]} ${CENTER[1]}) translate(${BASE[0]} ${BASE[1]}) scale(${m.s * m.sx} ${m.s * m.sy}) translate(${-BASE[0]} ${-BASE[1]})`);
    }
    function toWorld([px, py]) {
      let x = BASE[0] + (px - BASE[0]) * m.s * m.sx, y = BASE[1] + (py - BASE[1]) * m.s * m.sy;
      const c = Math.cos(rad(m.rot)), s = Math.sin(rad(m.rot)), dx = x - CENTER[0], dy = y - CENTER[1];
      return [CENTER[0] + dx * c - dy * s + m.x, CENTER[1] + dx * s + dy * c + m.y];
    }

    // Arm angles in degrees: 0 points straight out, positive swings down, negative up.
    function arms(aL, aR) {
      const r = `translate(${SHOULDER_R}) rotate(${aR})`, l = `translate(${SHOULDER_L}) scale(-1 1) rotate(${aL})`;
      el.armRs.setAttribute('transform', r); el.armRf.setAttribute('transform', r);
      el.armLs.setAttribute('transform', l); el.armLf.setAttribute('transform', l);
      return {
        L: toWorld([SHOULDER_L[0] - ARM * Math.cos(rad(aL)), SHOULDER_L[1] + ARM * Math.sin(rad(aL))]),
        R: toWorld([SHOULDER_R[0] + ARM * Math.cos(rad(aR)), SHOULDER_R[1] + ARM * Math.sin(rad(aR))])
      };
    }

    // Face from the model sheet: every field is a 0..1 weight except ex/ey (eye offset).
    function face(f = {}) {
      const { ex = 0, ey = 0, blink = 0, big = 0, focus = 0, arcs = 0, smile = 0, o = 0, open = 0, flat = 0, blush = 0, sweat = 0 } = f;
      // Expressions switch on a frame, the way a cartoon cuts between drawings, rather than cross-fading.
      const snap = w => w >= .5 ? 1 : 0;
      const a = snap(arcs), mouths = { smile, o, open, flat };
      const top = Object.keys(mouths).reduce((k, n) => mouths[n] > mouths[k] ? n : k, 'smile');
      for (const n in mouths) el[n === 'o' ? 'mouthO' : n === 'open' ? 'mouthOpen' : n].setAttribute('opacity', n === top ? snap(mouths[n]) : 0);
      const ry = 12 * (1 + .18 * big) * (1 - .92 * blink), rx = 9 * (1 + .14 * big);
      EYES.forEach((cx, i) => {
        const e = i ? el.eyeR : el.eyeL, lid = i ? el.lidR : el.lidL, arc = i ? el.arcR : el.arcL;
        e.setAttribute('cx', cx + ex); e.setAttribute('cy', EYE_Y + ey);
        e.setAttribute('rx', rx); e.setAttribute('ry', Math.max(ry, .6));
        e.setAttribute('opacity', 1 - a);
        lid.setAttribute('x', cx + ex - 14); lid.setAttribute('y', EYE_Y + ey - 16);
        lid.setAttribute('height', 11 * focus * (1 - a));
        arc.setAttribute('transform', `translate(${ex} ${ey})`); arc.setAttribute('opacity', a);
      });
      el.blush.setAttribute('opacity', blush); el.sweat.setAttribute('opacity', sweat);
    }

    return { el, place, toWorld, arms, face };
  }

  function sparkle(node, x, y, p, rot = 0, size = 1.9) {
    const s = Math.sin(Math.PI * clamp(p));
    node.setAttribute('visibility', s > 0.01 ? 'visible' : 'hidden');
    node.setAttribute('transform', `translate(${x} ${y}) rotate(${rot + p * 90}) scale(${s * size})`);
  }

  // Floss strand: an ink outline with a mint core, like every floss prop.
  const strand = (id, extra = '') =>
    `<g id="${id}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${extra}><path class="o" stroke="${INK}" stroke-width="8"/><path class="i" stroke="${FLOSS}" stroke-width="3.5"/></g>`;
  const setD = (g, d) => g.querySelectorAll('path').forEach(p => p.setAttribute('d', d));

  // Playback: loops render(t) over T seconds. Pause/Replay buttons are optional.
  // ?embed (used by the app's party) hides the page chrome and drops the background.
  function play({ T, rest, render }) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let playing = !reduce, clock = reduce ? rest : 0, last = null;
    const toggle = document.getElementById('toggle'), restart = document.getElementById('restart');
    window.renderAt = render;
    render(clock);
    function frame(now) {
      if (window.__manual) return;
      if (last !== null && playing) clock = (clock + (now - last) / 1000) % T;
      last = now;
      render(clock);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    if (toggle) {
      toggle.textContent = playing ? 'Pause' : 'Play';
      toggle.addEventListener('click', () => { playing = !playing; toggle.textContent = playing ? 'Pause' : 'Play'; });
    }
    if (restart) restart.addEventListener('click', () => { clock = 0; playing = true; if (toggle) toggle.textContent = 'Pause'; });
  }

  window.ToothKit = {
    INK, ENAMEL, FLOSS, BLUSH, TAU, SPARKLE, BODY, SHOULDER_L, SHOULDER_R, ARM, BASE, CENTER,
    clamp, seg, lerp, eIO, eOut, eIn, rad, bump, kf, tooth, rig, sparkle, strand, setD, play
  };
})();
