export interface Voxel {
  x: number;
  y: number;
  z: number;
  color: string;
}

export interface SongNote {
  note: string; // e.g., "C4", "D#4", or "REST"
  duration: number; // 1 = quarter note, 0.5 = eighth note
}

export enum PlayState {
  STOPPED,
  PLAYING
}

export interface TreeConfig {
  rotationSpeed: number;
  pixelSize: number;
  showDecorations: boolean;
}