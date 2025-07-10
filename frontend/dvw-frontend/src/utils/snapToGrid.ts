export interface Position {
  x: number;
  y: number;
}

/**
 * Snaps a position to the nearest grid point
 * @param position - The position to snap
 * @param gridSize - The size of the grid (default 16)
 * @returns The snapped position
 */
export const snapToGrid = (position: Position, gridSize: number = 16): Position => {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
};

/**
 * Snaps multiple positions to the grid
 * @param positions - Array of positions to snap
 * @param gridSize - The size of the grid (default 16)
 * @returns Array of snapped positions
 */
export const snapMultipleToGrid = (positions: Position[], gridSize: number = 16): Position[] => {
  return positions.map(pos => snapToGrid(pos, gridSize));
};

/**
 * Creates a snap-to-grid handler for React Flow
 * @param gridSize - The size of the grid
 * @param enabled - Whether snap to grid is enabled
 * @returns A function that can be used as a snap grid in React Flow
 */
export const createSnapGrid = (gridSize: number, enabled: boolean) => {
  if (!enabled) {
    return undefined;
  }
  
  return (x: number, y: number) => {
    const snapped = snapToGrid({ x, y }, gridSize);
    return [snapped.x, snapped.y] as [number, number];
  };
}; 