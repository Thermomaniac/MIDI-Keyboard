# MIDI Keyboard

A browser-based MIDI keyboard UI built with React, TypeScript, and Tone.js — pixel-matched to a Figma design with a neumorphic dark aesthetic, real-time audio sampling, keyboard shortcuts, and an animated ripple canvas effect.

![MIDI Keyboard Preview](public/freesound_community-banjo-melody-65499.mp3)

---

## Features

- **12-key chromatic keyboard** (C2 – B2) with white and black keys
- **Banjo sample playback** via Tone.js Sampler — pitch-shifted per key, pluck-only (no melody runon)
- **Keyboard shortcuts** — play notes without touching the mouse
- **Multi-touch & pointer support** — works on touch screens and desktop
- **Ripple canvas effect** — animated dot grid ring expands from the keyboard on every key press
- **Neumorphic dark UI** — gradient card, inset shadows, pink glow on active keys, spring bounce animation
- **Breathing LED indicator** — animated glow pulse in the top bar
- **Reverb chain** — Tone.js Reverb applied to all notes for natural room sound

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Audio | Tone.js 14 |
| Styling | Pure CSS (no Tailwind / component libs) |
| Canvas | Browser Canvas 2D API |
| Font | TT Firs Neue Trial Var Roman |

---

## Keyboard Shortcuts

| Key | Note |
|-----|------|
| `d` | C2 |
| `r` | C#2 |
| `f` | D2 |
| `t` | D#2 |
| `g` | E2 |
| `h` | F2 |
| `u` | F#2 |
| `j` | G2 |
| `i` | G#2 |
| `k` | A2 |
| `o` | A#2 |
| `l` | B2 |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
# Clone the repo
git clone https://github.com/Thermomaniac/MIDI-Keyboard.git
cd MIDI-Keyboard

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── MidiKeyboard.tsx   # Root keyboard layout, keyboard shortcut handling
│   ├── PianoKey.tsx       # Individual key with pointer + active state
│   ├── RippleCanvas.tsx   # Full-screen canvas ripple animation
│   └── TopBar.tsx         # LED indicator + brand text
├── constants/
│   └── notes.ts           # Note definitions, black key positions, key map
├── hooks/
│   └── useSynth.ts        # Tone.js Sampler singleton + pluck logic
├── styles/
│   └── keyboard.css       # All styling — neumorphic card, keys, LED, animations
└── main.tsx
public/
└── freesound_community-banjo-melody-65499.mp3  # Audio sample (base note G2)
```

---

## Audio Notes

The keyboard uses a **banjo melody sample** (root G2) loaded into Tone.js `Sampler`. Each key pitch-shifts the sample by at most ±6 semitones from G2 for natural-sounding transposition. A short 80 ms pluck window ensures only the initial attack plays — no melody continuation on long press.

---

## License

MIT
