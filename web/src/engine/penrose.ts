/**
 * Penrose P3 Rhombus Tiling via direct construction
 */

export interface Point {
  x: number;
  y: number;
}

export interface Tile {
  type: 'thick' | 'thin';
  vertices: Point[];
  center: Point;
}

const PHI = (1 + Math.sqrt(5)) / 2;

// Half-kite and half-dart triangles for subdivision
interface HalfTile {
  type: 'L' | 'S';  // L = large (half of thick), S = small (half of thin)
  A: Point;         // apex
  B: Point;
  C: Point;
}

function subdivide(halves: HalfTile[]): HalfTile[] {
  const result: HalfTile[] = [];
  
  for (const h of halves) {
    const { A, B, C } = h;
    
    if (h.type === 'L') {
      // Large triangle subdivides into 1 large + 1 small
      const P = lerp(A, B, 1 / PHI);
      result.push({ type: 'L', A: C, B: P, C: B });
      result.push({ type: 'S', A: P, B: C, C: A });
    } else {
      // Small triangle subdivides into 1 large + 2 small
      const Q = lerp(B, A, 1 / PHI);
      const R = lerp(B, C, 1 / PHI);
      result.push({ type: 'S', A: Q, B: R, C: B });
      result.push({ type: 'S', A: R, B: C, C: A });
      result.push({ type: 'L', A: R, B: Q, C: A });
    }
  }
  
  return result;
}

function createInitialSun(cx: number, cy: number, radius: number): HalfTile[] {
  const halves: HalfTile[] = [];
  
  for (let i = 0; i < 10; i++) {
    const angle = (2 * Math.PI * i) / 10 - Math.PI / 2;
    const nextAngle = (2 * Math.PI * (i + 1)) / 10 - Math.PI / 2;
    
    const A: Point = { x: cx, y: cy };
    const B: Point = { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    const C: Point = { x: cx + radius * Math.cos(nextAngle), y: cy + radius * Math.sin(nextAngle) };
    
    // Alternate orientation for proper matching
    if (i % 2 === 0) {
      halves.push({ type: 'L', A, B, C });
    } else {
      halves.push({ type: 'L', A, B: C, C: B });
    }
  }
  
  return halves;
}

function halvesToTiles(halves: HalfTile[]): Tile[] {
  const tiles: Tile[] = [];
  const used = new Set<number>();
  const eps = 2;  // tolerance for matching
  
  for (let i = 0; i < halves.length; i++) {
    if (used.has(i)) continue;
    const h1 = halves[i];
    
    // Find matching half (same type, shared BC edge in either direction)
    for (let j = i + 1; j < halves.length; j++) {
      if (used.has(j)) continue;
      const h2 = halves[j];
      
      if (h1.type !== h2.type) continue;
      
      // Check if edges match (BC of h1 matches BC of h2 in either direction)
      const match1 = dist(h1.B, h2.B) < eps && dist(h1.C, h2.C) < eps;
      const match2 = dist(h1.B, h2.C) < eps && dist(h1.C, h2.B) < eps;
      
      if (match1 || match2) {
        used.add(i);
        used.add(j);
        
        const vertices = [h1.A, h1.B, h2.A, h1.C];
        const center = {
          x: (vertices[0].x + vertices[1].x + vertices[2].x + vertices[3].x) / 4,
          y: (vertices[0].y + vertices[1].y + vertices[2].y + vertices[3].y) / 4,
        };
        
        tiles.push({
          type: h1.type === 'L' ? 'thick' : 'thin',
          vertices,
          center,
        });
        break;
      }
    }
  }
  
  return tiles;
}

export function generatePenroseTiling(
  width: number,
  height: number,
  iterations: number = 5
): Tile[] {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.max(width, height) * 1.5;
  
  let halves = createInitialSun(cx, cy, radius);
  
  for (let i = 0; i < iterations; i++) {
    halves = subdivide(halves);
  }
  
  const tiles = halvesToTiles(halves);
  
  // Filter visible
  const margin = 30;
  return tiles.filter(t =>
    t.center.x > -margin && t.center.x < width + margin &&
    t.center.y > -margin && t.center.y < height + margin
  );
}

function lerp(p1: Point, p2: Point, t: number): Point {
  return { x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t };
}

function dist(p1: Point, p2: Point): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

export function getTileCenter(tile: Tile): Point {
  return tile.center;
}

export function tileToPath(tile: Tile): string {
  const [first, ...rest] = tile.vertices;
  return `M ${first.x} ${first.y} ${rest.map(p => `L ${p.x} ${p.y}`).join(' ')} Z`;
}
