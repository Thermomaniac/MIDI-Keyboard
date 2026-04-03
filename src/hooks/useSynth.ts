import { useCallback } from 'react';
import * as Tone from 'tone';

// ─── Singleton sampler ────────────────────────────────────────────────────────

let samplerInstance: Tone.Sampler | null = null;

// Tracks per-note auto-release timers so early key-up can cancel them
const releaseTimers = new Map<string, ReturnType<typeof setTimeout>>();

// How long (ms) to let the sample play before forcing release.
// 80 ms captures just the initial pluck transient and cuts off
// before any melodic content plays through.
const PLUCK_DURATION_MS = 80;

function getOrCreateSampler(): Tone.Sampler {
  if (!samplerInstance) {
    const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.3 });
    reverb.toDestination();

    samplerInstance = new Tone.Sampler({
      // G2 is the base note: detected dominant root of the banjo sample is G4;
      // keyboard is tuned 2 octaves lower (÷4 from snippet), so base = G2.
      // Every key (C2–B2) stays within ±6 semitones of G2 → clean pitch-shift.
      urls: { G2: '/freesound_community-banjo-melody-65499.mp3' },
      release: 0.15,
    }).connect(reverb);
  }
  return samplerInstance;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSynth() {
  const triggerAttack = useCallback(async (note: string) => {
    await Tone.start();
    const sampler = getOrCreateSampler();
    await Tone.loaded();

    // Cancel any pending auto-release for this note (re-press before timer fires)
    const existing = releaseTimers.get(note);
    if (existing) {
      clearTimeout(existing);
      releaseTimers.delete(note);
    }

    sampler.triggerAttack(note);

    // Auto-release after PLUCK_DURATION_MS — prevents the full melody playing
    const timer = setTimeout(() => {
      samplerInstance?.triggerRelease(note);
      releaseTimers.delete(note);
    }, PLUCK_DURATION_MS);

    releaseTimers.set(note, timer);
  }, []);

  const triggerRelease = useCallback((note: string) => {
    // Cancel auto-release timer and release immediately on key-up
    const timer = releaseTimers.get(note);
    if (timer) {
      clearTimeout(timer);
      releaseTimers.delete(note);
    }
    samplerInstance?.triggerRelease(note);
  }, []);

  return { triggerAttack, triggerRelease };
}
