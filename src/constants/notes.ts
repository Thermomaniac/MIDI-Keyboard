// Keyboard shortcut → MIDI note mapping
// Frequencies taken from source snippet (all ÷4 from standard = octave 2):
//   C2=65.41Hz  C#2=69.30Hz  D2=73.42Hz  D#2=77.78Hz  E2=82.41Hz  F2=87.31Hz
//   F#2=92.50Hz G2=98.00Hz   G#2=103.83Hz A2=110.00Hz  A#2=116.54Hz B2=123.47Hz
// Key map taken from noteKeys in source snippet (1→d, 2→r, 3→f, 4→t, 5→g, 6→h,
//   7→u, 8→j, 9→i, 10→k, 11→o, 12→l)
export interface NoteDefinition {
  note: string;
  isBlack: boolean;
  left?: number;  // absolute left px for black keys within key-bed
  shortcut: string;
}

// White key width = 60px, gap = 8px → stride = 68px
// Black key width = 36px → center = leftWhiteIndex * 68 + 60 + 4 = leftWhiteIndex * 68 + 64
// Black key left  = center - 18 = leftWhiteIndex * 68 + 46
export const NOTES: NoteDefinition[] = [
  { note: 'C2',  isBlack: false,            shortcut: 'd' },
  { note: 'C#2', isBlack: true,  left:  46, shortcut: 'r' },
  { note: 'D2',  isBlack: false,            shortcut: 'f' },
  { note: 'D#2', isBlack: true,  left: 114, shortcut: 't' },
  { note: 'E2',  isBlack: false,            shortcut: 'g' },
  { note: 'F2',  isBlack: false,            shortcut: 'h' },
  { note: 'F#2', isBlack: true,  left: 250, shortcut: 'u' },
  { note: 'G2',  isBlack: false,            shortcut: 'j' },
  { note: 'G#2', isBlack: true,  left: 318, shortcut: 'i' },
  { note: 'A2',  isBlack: false,            shortcut: 'k' },
  { note: 'A#2', isBlack: true,  left: 386, shortcut: 'o' },
  { note: 'B2',  isBlack: false,            shortcut: 'l' },
];

// Quick lookup: keyboard key → note name
export const KEY_MAP: Record<string, string> = Object.fromEntries(
  NOTES.map(n => [n.shortcut, n.note])
);
