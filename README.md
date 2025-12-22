# Aperiodic Tilings as Quantum Error Codes

An interactive visualization demonstrating how aperiodic tilings (like Penrose patterns) naturally function as quantum error-correcting codes.

## The Key Insight

Aperiodic tilings have a property called **local indistinguishability**: any finite patch appears infinitely many times throughout the infinite tiling. This means local information cannot reveal global position — exactly the property needed for error correction.

When information is encoded in the global structure of a tiling, erasing a local region doesn't destroy that information. The pattern can always be uniquely reconstructed from the surrounding context, because the matching rules force a unique solution.

## Live Demo

Visit the interactive demo at: https://[username].github.io/aperiodic/

## Features

- **Interactive Erasure Demo**: Click and drag to "erase" a region of the tiling, then watch it reconstruct
- **Penrose vs Periodic Comparison**: Toggle between aperiodic (Penrose) and periodic tilings to see why aperiodicity matters
- **Educational Content**: Clear explanations of the connection between geometry and quantum error correction

## Development

```bash
cd web
npm install
npm run dev
```

## References

- [Zhi Li & Latham Boyle, "The Penrose Tiling is a Quantum Error-Correcting Code" (2023)](https://arxiv.org/abs/2311.13040)
- [Quanta Magazine: "Never-Repeating Tiles Can Safeguard Quantum Information"](https://www.quantamagazine.org/never-repeating-tiles-can-safeguard-quantum-information-20240223/)

## Project Structure

```
aperiodic/
├── web/                # Interactive visualization (React + TypeScript)
├── experiments/        # Future: Python experiments, notebooks
└── notes/              # Future: Research notes
```

## License

MIT

