import { CANON_LOOP_BEATS, CANON_TEMPO, canonNotes } from './canonScore';

export default function createCanonPlayer(onStateChange) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) throw new Error('Audio is unavailable');
  const context = new AudioContext();
  const beat = 60 / CANON_TEMPO;
  const mix = context.createGain();
  const warmth = context.createBiquadFilter();
  warmth.type = 'lowpass';
  warmth.frequency.value = 4200;
  const master = context.createGain();
  master.gain.value = .4;
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -20;
  compressor.ratio.value = 3;
  mix.connect(warmth);
  warmth.connect(master);
  master.connect(compressor);
  compressor.connect(context.destination);
  const echo = context.createDelay(.5);
  echo.delayTime.value = .22;
  const feedback = context.createGain();
  feedback.gain.value = .16;
  const wet = context.createGain();
  wet.gain.value = .14;
  mix.connect(echo);
  echo.connect(feedback);
  feedback.connect(echo);
  echo.connect(wet);
  wet.connect(warmth);
  const real = new Float32Array(12);
  const imaginary = new Float32Array([0, 1, .4, .2, .12, .07, .04, .025, .015, .008, .004, .002]);
  const piano = context.createPeriodicWave(real, imaginary);
  let timer = null;
  let nextNote = 0;
  let loopStart = context.currentTime + .08;
  let disposed = false;

  const strike = (event, when) => {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const tone = context.createBiquadFilter();
    const duration = event.length * beat + .65;
    const peak = .28 * event.velocity;
    oscillator.setPeriodicWave(piano);
    oscillator.frequency.value = 440 * 2 ** ((event.note - 69) / 12);
    tone.type = 'lowpass';
    tone.frequency.setValueAtTime(3800, when);
    tone.frequency.exponentialRampToValueAtTime(1100, when + Math.min(.5, duration));
    envelope.gain.setValueAtTime(.0001, when);
    envelope.gain.exponentialRampToValueAtTime(peak, when + .008);
    envelope.gain.exponentialRampToValueAtTime(peak * .28, when + .3);
    envelope.gain.exponentialRampToValueAtTime(.0001, when + duration);
    oscillator.connect(tone);
    tone.connect(envelope);
    envelope.connect(mix);
    oscillator.onended = () => { oscillator.disconnect(); tone.disconnect(); envelope.disconnect(); };
    oscillator.start(when);
    oscillator.stop(when + duration + .02);
  };
  const schedule = () => {
    if (disposed || context.state !== 'running') return;
    while (loopStart + canonNotes[nextNote].at * beat < context.currentTime + .18) {
      const note = canonNotes[nextNote];
      const when = loopStart + note.at * beat;
      // A throttled background tab should skip missed notes instead of piling
      // them up into one loud chord when it becomes active again.
      if (when >= context.currentTime - .05) strike(note, Math.max(context.currentTime, when));
      nextNote++;
      if (nextNote === canonNotes.length) {
        nextNote = 0;
        loopStart += CANON_LOOP_BEATS * beat;
      }
    }
  };
  context.onstatechange = () => { if (!disposed) onStateChange(context.state === 'running'); };
  return {
    async play() {
      if (disposed) return;
      // Called directly by the visitor's click, before the opening animation.
      await context.resume();
      if (timer === null) {
        schedule();
        timer = window.setInterval(schedule, 25);
      }
      onStateChange(context.state === 'running');
    },
    async pause() {
      if (timer !== null) { window.clearInterval(timer); timer = null; }
      if (!disposed && context.state !== 'closed') await context.suspend();
      if (!disposed) onStateChange(false);
    },
    dispose() {
      disposed = true;
      if (timer !== null) window.clearInterval(timer);
      context.onstatechange = null;
      void context.close().catch(() => {});
    },
  };
}
