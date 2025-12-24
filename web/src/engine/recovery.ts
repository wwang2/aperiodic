/**
 * Recovery algorithm for tile erasure
 * 
 * For Penrose tilings: The matching rules force a unique solution.
 * For periodic tilings: Multiple valid completions exist (phase ambiguity).
 */

import { getTileCenter } from './penrose';
import type { Tile, Point } from './penrose';

/**
 * Simulate recovery of erased tiles
 * 
 * For Penrose: Returns the same tiles (unique recovery)
 * For Periodic: Returns shifted tiles (demonstrates ambiguity)
 */
export function recoverTiles(
  allTiles: Tile[],
  erasedIndices: number[],
  mode: 'penrose' | 'periodic'
): Tile[] {
  if (mode === 'penrose') {
    // In Penrose tiling, recovery is deterministic
    return allTiles;
  } else {
    // In periodic tiling, demonstrate ambiguity by shifting ALL erased tiles
    // by the same amount (showing a valid translated copy)
    const shiftX = 8;
    const shiftY = 6;

    return allTiles.map((tile, index) => {
      if (erasedIndices.includes(index)) {
        return {
          ...tile,
          vertices: tile.vertices.map(v => ({
            x: v.x + shiftX,
            y: v.y + shiftY,
          })),
          center: {
            x: tile.center.x + shiftX,
            y: tile.center.y + shiftY,
          },
        };
      }
      return tile;
    });
  }
}

/**
 * Get tiles adjacent to the erased region (the boundary)
 */
export function getBoundaryTiles(
  allTiles: Tile[],
  erasedIndices: Set<number>,
  eraseCenter: Point,
  eraseRadius: number
): number[] {
  const boundary: number[] = [];
  const expandedRadius = eraseRadius * 1.5;

  allTiles.forEach((tile, index) => {
    if (erasedIndices.has(index)) return;

    const center = getTileCenter(tile);
    const dist = Math.sqrt(
      (center.x - eraseCenter.x) ** 2 +
      (center.y - eraseCenter.y) ** 2
    );

    if (dist < expandedRadius && dist >= eraseRadius * 0.8) {
      boundary.push(index);
    }
  });

  return boundary;
}

/**
 * Order erased tiles for animated recovery (outside-in)
 */
export function getRecoveryOrder(
  allTiles: Tile[],
  erasedIndices: number[],
  eraseCenter: Point
): number[] {
  return [...erasedIndices].sort((a, b) => {
    const centerA = getTileCenter(allTiles[a]);
    const centerB = getTileCenter(allTiles[b]);
    const distA = Math.sqrt(
      (centerA.x - eraseCenter.x) ** 2 +
      (centerA.y - eraseCenter.y) ** 2
    );
    const distB = Math.sqrt(
      (centerB.x - eraseCenter.x) ** 2 +
      (centerB.y - eraseCenter.y) ** 2
    );
    return distB - distA; // Outer tiles first
  });
}

/**
 * Find neighbors of a specific tile
 * Uses shared vertices to identify adjacency (sharing an edge)
 */
export function getNeighbors(
  targetIndex: number,
  allTiles: Tile[]
): number[] {
  const target = allTiles[targetIndex];
  const neighbors: number[] = [];
  const eps = 1.0; // Tolerance for vertex matching

  allTiles.forEach((tile, index) => {
    if (index === targetIndex) return;

    // Count shared vertices
    let shared = 0;
    for (const v1 of target.vertices) {
      for (const v2 of tile.vertices) {
        if (Math.abs(v1.x - v2.x) < eps && Math.abs(v1.y - v2.y) < eps) {
          shared++;
          break; // Move to next v1
        }
      }
    }

    // Sharing 2 vertices means sharing an edge
    if (shared >= 2) {
      neighbors.push(index);
    }
  });

  return neighbors;
}
