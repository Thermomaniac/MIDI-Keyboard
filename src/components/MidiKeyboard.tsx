import React, { useCallback, useEffect, useState } from 'react';
import TopBar from './TopBar';
import PianoKey from './PianoKey';
import { NOTES, KEY_MAP } from '../constants/notes';
import { useSynth } from '../hooks/useSynth';

const WHITE_NOTES = NOTES.filter(n => !n.isBlack);
const BLACK_NOTES = NOTES.filter(n => n.isBlack);

export default function MidiKeyboard() {
  const { triggerAttack, triggerRelease } = useSynth();

  // Track which notes are active via keyboard shortcuts
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  const handleAttack = useCallback(
    (note: string) => {
      triggerAttack(note);
    },
    [triggerAttack]
  );

  const handleRelease = useCallback(
    (note: string) => {
      triggerRelease(note);
    },
    [triggerRelease]
  );

  // Keyboard shortcut handling
  useEffect(() => {
    const held = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore repeat events (key held down)
      if (e.repeat) return;
      const note = KEY_MAP[e.key.toLowerCase()];
      if (!note || held.has(e.key.toLowerCase())) return;
      held.add(e.key.toLowerCase());
      setActiveKeys(prev => new Set([...prev, note]));
      triggerAttack(note);
      window.dispatchEvent(new CustomEvent('midi-key-press'));
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const note = KEY_MAP[e.key.toLowerCase()];
      if (!note) return;
      held.delete(e.key.toLowerCase());
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
      triggerRelease(note);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [triggerAttack, triggerRelease]);

  return (
    <div className="keyboard-card">
      <TopBar />
      <div className="key-bed">
        {/* White keys — flex row, gap 8px, total 7×60+6×8 = 468px */}
        <div className="white-keys">
          {WHITE_NOTES.map(({ note }) => (
            <PianoKey
              key={note}
              note={note}
              isBlack={false}
              active={activeKeys.has(note)}
              onAttack={handleAttack}
              onRelease={handleRelease}
            />
          ))}
        </div>

        {/* Black keys — absolutely positioned over white keys */}
        {BLACK_NOTES.map(({ note, left }) => (
          <PianoKey
            key={note}
            note={note}
            isBlack={true}
            left={left}
            active={activeKeys.has(note)}
            onAttack={handleAttack}
            onRelease={handleRelease}
          />
        ))}
      </div>
    </div>
  );
}
