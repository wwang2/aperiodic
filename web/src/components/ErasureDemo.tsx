import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { generatePenroseTiling, tileToPath } from '../engine/penrose';
import { generatePeriodicTiling } from '../engine/periodic';
import { recoverTiles, getRecoveryOrder } from '../engine/recovery';
import type { Tile } from '../engine/penrose';

type Mode = 'penrose' | 'periodic';
type DemoState = 'idle' | 'erasing' | 'erased' | 'recovering';

// Color palettes
const COLORS = {
  penrose: {
    thick: '#6366f1',      // Indigo
    thickStroke: '#4338ca',
    thin: '#f472b6',       // Pink
    thinStroke: '#db2777',
    erased: '#18181b',
  },
  periodic: {
    thick: '#94a3b8',      // Slate gray - uniform color
    thickStroke: '#64748b',
    thin: '#94a3b8',       // Same color to show uniformity
    thinStroke: '#64748b',
    erased: '#18181b',
  },
  background: '#fafaf9',
};

export function ErasureDemo() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mode, setMode] = useState<Mode>('penrose');
  const [state, setState] = useState<DemoState>('idle');
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [erasedTiles, setErasedTiles] = useState<Set<number>>(new Set());
  const [eraseCenter, setEraseCenter] = useState<{ x: number; y: number } | null>(null);
  const [caption, setCaption] = useState('Click and drag to erase a region of the tiling.');

  const width = 1100;
  const height = 500;
  const eraseRadius = 50;

  // Generate tiles on mount and mode change
  useEffect(() => {
    const newTiles = mode === 'penrose'
      ? generatePenroseTiling(width, height, 8)  // More iterations = smaller, denser tiles
      : generatePeriodicTiling(width, height, 25);
    setTiles(newTiles);
    setErasedTiles(new Set());
    setEraseCenter(null);
    setState('idle');
    setCaption('Click and drag to erase a region.');
  }, [mode]);

  // Render with D3
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node()) return;

    const colors = mode === 'penrose' ? COLORS.penrose : COLORS.periodic;

    // Clear previous content
    svg.selectAll('*').remove();

    // Add gradient background
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'bg-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#fafaf9');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#f5f5f4');

    // Background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#bg-gradient)');

    // Tile group
    const tilesGroup = svg.append('g').attr('class', 'tiles');

    // Draw tiles
    tilesGroup.selectAll('path')
      .data(tiles)
      .join('path')
      .attr('d', d => tileToPath(d))
      .attr('fill', (d, i) => {
        if (erasedTiles.has(i)) return colors.erased;
        return d.type === 'thick' ? colors.thick : colors.thin;
      })
      .attr('stroke', (d, i) => {
        if (erasedTiles.has(i)) return colors.erased;
        return d.type === 'thick' ? colors.thickStroke : colors.thinStroke;
      })
      .attr('stroke-width', 0.5)
      .attr('stroke-linejoin', 'round');

    // Erase preview circle
    if (eraseCenter && state === 'erasing') {
      svg.append('circle')
        .attr('cx', eraseCenter.x)
        .attr('cy', eraseCenter.y)
        .attr('r', eraseRadius)
        .attr('fill', 'none')
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '8,4')
        .attr('opacity', 0.8);
    }
  }, [tiles, erasedTiles, eraseCenter, state, mode]);

  const getMousePosition = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;

    const rect = svg.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (state !== 'idle' && state !== 'erasing') return;
    const pos = getMousePosition(e);
    if (!pos) return;

    setEraseCenter(pos);
    setState('erasing');
    setCaption('Release to erase this region.');
  }, [state, getMousePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (state !== 'erasing') return;
    const pos = getMousePosition(e);
    if (!pos) return;

    setEraseCenter(pos);
  }, [state, getMousePosition]);

  const handleMouseUp = useCallback(() => {
    if (state !== 'erasing' || !eraseCenter) return;

    // Find tiles within erase radius
    const erased = new Set<number>();
    tiles.forEach((tile, index) => {
      const dist = Math.sqrt(
        (tile.center.x - eraseCenter.x) ** 2 +
        (tile.center.y - eraseCenter.y) ** 2
      );
      if (dist < eraseRadius) {
        erased.add(index);
      }
    });

    setErasedTiles(erased);
    setState('erased');
    setCaption(`Erased ${erased.size} tiles. Click "Recover" to reconstruct the pattern.`);
  }, [state, eraseCenter, tiles]);

  const handleRecover = useCallback(async () => {
    if (state !== 'erased' || !eraseCenter) return;
    setState('recovering');

    const erasedIndices = Array.from(erasedTiles);

    if (mode === 'penrose') {
      setCaption('Recovering — the matching rules force a unique solution...');

      // Order recovery from outside-in
      const orderedIndices = getRecoveryOrder(tiles, erasedIndices, eraseCenter);
      const recovered = new Set(erasedTiles);

      for (let i = 0; i < orderedIndices.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 25));
        recovered.delete(orderedIndices[i]);
        setErasedTiles(new Set(recovered));
      }

      setCaption('Done. The pattern is uniquely determined by its boundary.');
    } else {
      setCaption('In a periodic tiling, any translated copy fits...');

      const recoveredTiles = recoverTiles(tiles, erasedIndices, mode);
      setTiles(recoveredTiles);

      const orderedIndices = getRecoveryOrder(tiles, erasedIndices, eraseCenter);
      const recovered = new Set(erasedTiles);

      for (let i = 0; i < orderedIndices.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 25));
        recovered.delete(orderedIndices[i]);
        setErasedTiles(new Set(recovered));
      }

      setCaption('The recovered tiles are shifted — global phase information was lost.');
    }

    setState('idle');
  }, [state, erasedTiles, tiles, mode, eraseCenter]);

  const handleReset = useCallback(() => {
    const newTiles = mode === 'penrose'
      ? generatePenroseTiling(width, height, 7)
      : generatePeriodicTiling(width, height, 25);
    setTiles(newTiles);
    setErasedTiles(new Set());
    setEraseCenter(null);
    setState('idle');
    setCaption('Click and drag to erase a region of the tiling.');
  }, [mode]);

  return (
    <div className="w-full">
      {/* SVG Canvas */}
      <div className="flex justify-center px-4">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="border border-stone-200 rounded-lg cursor-crosshair max-w-full shadow-sm"
          style={{ aspectRatio: `${width}/${height}` }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Caption */}
      <div className="max-w-[900px] mx-auto px-6 mt-4">
        <p className="text-center text-stone-600 italic min-h-[2.5rem]">{caption}</p>
      </div>

      {/* Controls */}
      <div className="max-w-[900px] mx-auto px-6 mt-2 flex flex-wrap justify-center gap-3">
        <button
          onClick={handleRecover}
          disabled={state !== 'erased'}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Recover
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors font-medium"
        >
          Reset
        </button>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-stone-500 text-sm">Mode:</span>
          <button
            onClick={() => setMode('penrose')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'penrose'
                ? 'bg-indigo-600 text-white'
                : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
            }`}
          >
            Penrose
          </button>
          <button
            onClick={() => setMode('periodic')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === 'periodic'
                ? 'bg-teal-600 text-white'
                : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
            }`}
          >
            Periodic
          </button>
        </div>
      </div>
    </div>
  );
}
