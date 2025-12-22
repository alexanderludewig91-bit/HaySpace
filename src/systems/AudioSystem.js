let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, dur = 0.08, type = 'sine', gain = 0.05) {
  const ac = ensureAudio();
  if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = 0.0001;
  o.connect(g);
  g.connect(ac.destination);

  const t0 = ac.currentTime;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.start(t0);
  o.stop(t0 + dur + 0.01);
}

export function sfx(kind) {
  if (kind === 'shoot') { tone(780, 0.04, 'triangle', 0.028); tone(1040, 0.025, 'triangle', 0.018); return; }
  if (kind === 'overheat') { tone(220, 0.10, 'sawtooth', 0.055); tone(160, 0.12, 'sawtooth', 0.045); return; }
  if (kind === 'shield') { tone(620, 0.07, 'sine', 0.05); tone(920, 0.08, 'sine', 0.04); return; }
  if (kind === 'upgrade') { tone(660, 0.06, 'triangle', 0.055); tone(900, 0.06, 'triangle', 0.055); tone(1240, 0.09, 'triangle', 0.055); return; }
  if (kind === 'hit') { tone(260, 0.06, 'square', 0.045); tone(180, 0.08, 'square', 0.040); return; }
}

export { ensureAudio };

