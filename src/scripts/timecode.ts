export const FPS = 25;

// sekunde -> 00:MM:SS:FF, kao timecode u montažnom programu
export const tcFormat = (t: number) => {
  const f = Math.floor(Math.max(0, t) * FPS);
  const ff = f % FPS, s = Math.floor(f / FPS) % 60, m = Math.floor(f / FPS / 60);
  return `00:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(ff).padStart(2, '0')}`;
};
