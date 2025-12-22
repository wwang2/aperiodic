/**
 * Periodic tiling for comparison
 * 
 * A clean, obviously repeating pattern to contrast with Penrose.
 * Uses a simple rhombus grid that clearly shows translational symmetry.
 */

import type { Tile } from './penrose';

/**
 * Generate a clean periodic rhombus tiling
 */
export function generatePeriodicTiling(
  width: number,
  height: number,
  tileSize: number = 30
): Tile[] {
  const tiles: Tile[] = [];

  // Simple parallelogram grid
  const cols = Math.ceil(width / tileSize) + 4;
  const rows = Math.ceil(height / tileSize) + 4;

  for (let row = -2; row < rows; row++) {
    for (let col = -2; col < cols; col++) {
      // Offset every other row
      const baseX = col * tileSize + (row % 2) * (tileSize / 2);
      const baseY = row * tileSize * 0.9;

      // Thick rhombus (parallelogram)
      const thick: Tile = {
        type: 'thick',
        vertices: [
          { x: baseX, y: baseY },
          { x: baseX + tileSize, y: baseY },
          { x: baseX + tileSize + tileSize * 0.3, y: baseY + tileSize * 0.8 },
          { x: baseX + tileSize * 0.3, y: baseY + tileSize * 0.8 },
        ],
        center: {
          x: baseX + tileSize * 0.65,
          y: baseY + tileSize * 0.4,
        },
      };

      if (isVisible(thick, width, height)) {
        tiles.push(thick);
      }
    }
  }

  return tiles;
}

function isVisible(tile: Tile, width: number, height: number): boolean {
  const margin = 50;
  return tile.center.x > -margin && tile.center.x < width + margin &&
         tile.center.y > -margin && tile.center.y < height + margin;
}

/**
 * Shift periodic tiling to demonstrate ambiguity
 */
export function shiftPeriodicTiling(tiles: Tile[], shiftX: number, shiftY: number): Tile[] {
  return tiles.map(tile => ({
    ...tile,
    vertices: tile.vertices.map(v => ({
      x: v.x + shiftX,
      y: v.y + shiftY,
    })),
    center: {
      x: tile.center.x + shiftX,
      y: tile.center.y + shiftY,
    },
  }));
}
