/**
 * Generates notification sounds using the Web Audio API (no audio files needed).
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx || audioCtx.state === 'closed') {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new Ctx();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function playTone(
  frequency: number,
  endFrequency: number,
  duration: number,
  gain: number
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') ctx.resume();

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(endFrequency, ctx.currentTime + duration);

  gainNode.gain.setValueAtTime(gain, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/** Short pop for notifications */
export function playNotificationSound() {
  playTone(880, 660, 0.22, 0.18);
}

/** Softer chime for incoming messages */
export function playMessageSound() {
  playTone(660, 880, 0.18, 0.14);
}
