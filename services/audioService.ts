import { SongNote } from '../types';

// Frequencies for notes (4th and 5th octave)
const NOTES: Record<string, number> = {
  'G3': 196.00,
  'A3': 220.00,
  'B3': 246.94,
  'C4': 261.63,
  'D4': 293.66,
  'E4': 329.63,
  'F4': 349.23,
  'G4': 392.00,
  'A4': 440.00,
  'B4': 493.88,
  'C5': 523.25,
  'D5': 587.33,
  'E5': 659.25,
  'F5': 698.46,
  'G5': 783.99,
  'A5': 880.00,
  'REST': 0
};

// Jingle Bells (Chorus)
const JINGLE_BELLS: SongNote[] = [
  { note: 'E4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'E4', duration: 1 },
  { note: 'E4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'E4', duration: 1 },
  { note: 'E4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'C4', duration: 0.75 }, { note: 'D4', duration: 0.25 },
  { note: 'E4', duration: 2 },
  { note: 'F4', duration: 0.5 }, { note: 'F4', duration: 0.5 }, { note: 'F4', duration: 0.75 }, { note: 'F4', duration: 0.25 },
  { note: 'F4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'E4', duration: 0.25 }, { note: 'E4', duration: 0.25 },
  { note: 'E4', duration: 0.5 }, { note: 'D4', duration: 0.5 }, { note: 'D4', duration: 0.5 }, { note: 'E4', duration: 0.5 },
  { note: 'D4', duration: 1 }, { note: 'G4', duration: 1 }
];

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentNoteIndex: number = 0;
  private nextNoteTime: number = 0;
  private schedulerTimer: number | null = null;
  private tempo: number = 70; // BPM (Slowed down to 70)
  private lookahead: number = 25.0; // ms
  private scheduleAheadTime: number = 0.1; // s

  constructor() {
    // Singleton patternish via module export
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public async start() {
    if (this.isPlaying) return; // Prevent multiple starts

    this.initCtx();
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
    this.isPlaying = true;
    this.currentNoteIndex = 0;
    
    // Safety check
    if (this.ctx) {
      this.nextNoteTime = this.ctx.currentTime;
      this.scheduler();
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.schedulerTimer) {
      window.clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  private nextNote() {
    const secondsPerBeat = 60.0 / this.tempo;
    // Advance current note based on its duration
    this.nextNoteTime += JINGLE_BELLS[this.currentNoteIndex].duration * secondsPerBeat;
    
    this.currentNoteIndex++;
    if (this.currentNoteIndex === JINGLE_BELLS.length) {
      this.currentNoteIndex = 0; // Loop
    }
  }

  private playNote(note: string, time: number, duration: number) {
    if (!this.ctx || note === 'REST') return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Retro sound: 'square' or 'triangle'
    osc.type = 'square'; 
    osc.frequency.value = NOTES[note] || 0;

    // Envelope for punchy 8-bit sound
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration - 0.05);

    osc.start(time);
    osc.stop(time + duration);
  }

  private scheduler = () => {
    if (!this.isPlaying || !this.ctx) return;

    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      const currentNote = JINGLE_BELLS[this.currentNoteIndex];
      const secondsPerBeat = 60.0 / this.tempo;
      const noteDuration = currentNote.duration * secondsPerBeat;
      
      this.playNote(currentNote.note, this.nextNoteTime, noteDuration);
      this.nextNote();
    }
    
    this.schedulerTimer = window.setTimeout(this.scheduler, this.lookahead);
  }
}

export const audioService = new AudioEngine();