export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const REEL_COLS = 5;
export const REEL_ROWS = 4;
export const CELL_W = 120;
export const CELL_H = 90;

// Slot frame bounds (matches the visual reference)
export const FRAME_X = 143;
export const FRAME_Y = 38;
export const FRAME_W = 673;
export const FRAME_H = 400;

// Grid inside the frame
export const GRID_X = FRAME_X + 17;
export const GRID_Y = FRAME_Y + 17;

export const INITIAL_BALANCE = 4000;
export const INITIAL_BET = 100;

export const SYMBOLS = [
  { id: 'Bank',       frames: 46, value: 100, weight: 3 },
  { id: 'Safe',       frames: 46, value:  80, weight: 5 },
  { id: 'Dynamit',    frames: 46, value:  60, weight: 8 },
  { id: 'Cell',       frames: 46, value:  40, weight: 10 },
  { id: 'Handcuffs',  frames: 46, value:  30, weight: 12 },
  { id: 'Littera_A',  frames: 46, value:  20, weight: 18 },
  { id: 'Littera_K',  frames: 46, value:  15, weight: 20 },
  { id: 'Littera_Q',  frames: 46, value:  10, weight: 22 },
  { id: 'Littera_J',  frames: 46, value:   8, weight: 25 },
  { id: 'Number_10',  frames: 46, value:   5, weight: 30 },
];

export const WIN_TYPES = [
  { name: 'Total_Win',     minValue: 1000000, frames: 46 },
  { name: 'Super_Mega_Win', minValue: 500000, frames: 46 },
  { name: 'Mega_Win',      minValue: 100000,  frames: 46 },
  { name: 'Big_Win',       minValue: 10000,   frames: 46 },
];

export const FOX_IDLE_COUNT = 61;
export const FOX_WIN_COUNT = 61;
