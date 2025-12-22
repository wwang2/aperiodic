import { Section } from './components/Section';
import { ErasureDemo } from './components/ErasureDemo';

function App() {
  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="pt-16 pb-4">
        <div className="max-w-[900px] mx-auto px-6">
          <h1 className="text-[2.5rem] font-semibold leading-tight mb-3">
            Aperiodic Tilings as Quantum Error Codes
          </h1>
          <p className="text-stone-500">
            An interactive exploration based on{' '}
            <a href="https://arxiv.org/abs/2311.13040" target="_blank" rel="noopener noreferrer">
              Li & Boyle (2023)
            </a>
          </p>
        </div>
      </header>

      {/* Introduction */}
      <Section>
        <p>
          Penrose tilings are patterns that fill the plane without ever repeating. They have a 
          remarkable property called <em>local indistinguishability</em>: any finite region you observe 
          appears infinitely many times throughout the infinite tiling. This means you cannot 
          determine your global position from local information alone.
        </p>
        <p>
          This is exactly the property needed for error correction. When information is encoded 
          in the global structure rather than any local region, erasing a finite area cannot 
          destroy that information—the pattern can always be uniquely reconstructed from its boundary.
        </p>
      </Section>

      {/* The Interactive Demo */}
      <Section title="Erasure and Recovery" fullWidth>
        <div className="max-w-[900px] mx-auto px-6 mb-6">
          <p className="mb-4">
            Try erasing a region of the tiling, then click <strong>Recover</strong> to watch it reconstruct. 
            Toggle between the two modes to see the key difference:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6 text-[0.95rem]">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
              <h3 className="font-semibold text-indigo-900 mb-2">Penrose (Aperiodic)</h3>
              <p className="text-indigo-800">
                The boundary tiles constrain the interior uniquely. There is exactly <em>one</em> valid 
                way to fill the erased region. No information is lost.
              </p>
            </div>
            <div className="bg-stone-100 border border-stone-200 rounded-lg p-4">
              <h3 className="font-semibold text-stone-700 mb-2">Periodic (Grid)</h3>
              <p className="text-stone-600">
                Any translated copy of the pattern fits equally well. The recovered tiles will be 
                shifted—the global "phase" information is lost forever.
              </p>
            </div>
          </div>
        </div>
        
        <ErasureDemo />
      </Section>

      {/* Why it matters */}
      <Section>
        <p>
          This geometric intuition maps directly to quantum error correction. In a quantum code, 
          information is encoded in superpositions of states. Local errors (like erasing a region) 
          can be corrected if the encoding is sufficiently non-local—exactly what aperiodic tilings provide.
        </p>
      </Section>

      {/* Footer */}
      <footer className="py-12 text-center text-stone-400 text-sm">
        <div className="max-w-[900px] mx-auto px-6">
          <a 
            href="https://www.quantamagazine.org/never-repeating-tiles-can-safeguard-quantum-information-20240223/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-stone-500 hover:text-teal-600"
          >
            Further reading →
          </a>
        </div>
      </footer>
    </main>
  );
}

export default App;
