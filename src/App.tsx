import RippleCanvas from './components/RippleCanvas';
import MidiKeyboard from './components/MidiKeyboard';

export default function App() {
  return (
    <>
      {/* z-index 0 — fixed canvas layer behind everything */}
      <RippleCanvas />

      {/* z-index 1 — keyboard floats above the canvas */}
      <div className="keyboard-wrapper">
        <MidiKeyboard />
      </div>
    </>
  );
}
