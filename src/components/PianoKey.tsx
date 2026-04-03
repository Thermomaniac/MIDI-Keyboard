import React, { useState, useCallback } from 'react';

interface PianoKeyProps {
  note: string;
  isBlack: boolean;
  left?: number;       // absolute left px (black keys only)
  active: boolean;     // controlled by parent (keyboard shortcuts)
  onAttack: (note: string) => void;
  onRelease: (note: string) => void;
}

const PianoKey = React.memo(function PianoKey({
  note,
  isBlack,
  left,
  active,
  onAttack,
  onRelease,
}: PianoKeyProps) {
  // Internal state for pointer-driven activation
  const [pointerDown, setPointerDown] = useState(false);
  const isActive = pointerDown || active;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      setPointerDown(true);
      onAttack(note);
      window.dispatchEvent(new CustomEvent('midi-key-press'));
    },
    [note, onAttack]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (pointerDown) {
        setPointerDown(false);
        onRelease(note);
      }
    },
    [pointerDown, note, onRelease]
  );

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (pointerDown) {
        setPointerDown(false);
        onRelease(note);
      }
    },
    [pointerDown, note, onRelease]
  );

  const className = [
    isBlack ? 'key--black' : 'key--white',
    isActive ? 'key--active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const style: React.CSSProperties | undefined =
    isBlack && left !== undefined ? { left } : undefined;

  return (
    <div
      className={className}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    />
  );
});

export default PianoKey;
