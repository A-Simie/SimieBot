import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';

export default async function ThesisPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  return (
    <div className="p-4 md:p-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">
          Thesis / Research Mode
        </h1>
        <p className="text-on-surface-variant text-xs md:text-sm mt-1">
          SimieBot Analysis Core v4.2 // Active Session: Neural Network Ethics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          {/* Synthesis Results */}
          <div className="bg-surface-container-low rounded-[1rem] p-6 md:p-8 neo-extrusion border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high neo-extrusion flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">psychology</span>
                </div>
                <div>
                  <h2 className="font-headline text-lg md:text-xl font-bold text-on-surface">Synthesis Results</h2>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Confidence: 98.4%</p>
                </div>
              </div>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">open_in_full</span>
              </button>
            </div>

            <div className="space-y-6 text-on-surface/90 leading-relaxed text-sm md:text-base">
              <p>
                The ethical implications of{' '}
                <span className="text-secondary font-semibold">decentralized neural architectures</span>{' '}
                suggest a paradigm shift in data sovereignty. By distributing weights across autonomous nodes,
                we mitigate centralized bias but introduce systemic latency risks.
              </p>

              {/* Key Hypothesis & Primary Variable */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-surface-container rounded-[0.75rem] neo-intrusion border border-white/5">
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Key Hypothesis</p>
                  <p className="text-sm italic text-on-surface-variant">
                    &quot;Privacy scales inverse to connectivity in non-zero-knowledge environments.&quot;
                  </p>
                </div>
                <div className="p-4 bg-surface-container rounded-[0.75rem] neo-intrusion border border-white/5">
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Primary Variable</p>
                  <p className="text-sm font-mono text-primary">node_density: 4.2e9</p>
                </div>
              </div>

              <p>
                Citations indicate a 40% increase in research volume regarding{' '}
                <span className="text-primary underline cursor-pointer">Recursive Self-Improvement</span>{' '}
                (RSI) protocols since 2024. Our current thesis aligns with the &quot;Safety First&quot; consensus
                while proposing a faster execution path.
              </p>

              {/* Citation References */}
              <div className="space-y-3 mt-6">
                <div className="p-3 bg-surface-container rounded-md neo-intrusion flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="material-symbols-outlined text-primary text-sm shrink-0">menu_book</span>
                    <span className="text-xs md:text-sm truncate">Vaswani et al. (2023) – Attention is All You Need: Reimagined</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-sm cursor-pointer hover:text-primary transition-colors shrink-0">open_in_new</span>
                </div>
                <div className="p-3 bg-surface-container rounded-md neo-intrusion flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="material-symbols-outlined text-primary text-sm shrink-0">menu_book</span>
                    <span className="text-xs md:text-sm truncate">Bostrom, N. – Strategic Decoupling in ASI Nodes</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-sm cursor-pointer hover:text-primary transition-colors shrink-0">open_in_new</span>
                </div>
              </div>
            </div>
          </div>

          {/* Input Bar */}
          <div className="flex items-center gap-3 bg-surface-container-low neo-intrusion rounded-2xl md:rounded-full p-2 md:p-3 md:pr-4 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-sm">edit_note</span>
            </div>
            <input
              className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm text-on-surface placeholder:text-on-surface-variant/50"
              placeholder="Synthesize additional sources..."
              readOnly
            />
            <button className="px-3 md:px-4 py-2 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary text-[10px] md:text-xs font-bold shadow-glow-blue active:scale-95 transition-all flex items-center gap-1">
              EVOLVE
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
            </button>
          </div>
        </section>

        {/* Right Panel */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          {/* Source Integrity */}
          <div className="bg-surface-container-low rounded-[1rem] p-6 neo-extrusion border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(0,227,253,1)]" />
              <h3 className="font-headline font-bold text-xs tracking-widest uppercase text-on-surface-variant">Source Integrity</h3>
            </div>
            <div className="flex items-center justify-center my-4 text-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90">
                  <circle className="text-surface-container-highest" cx="64" cy="64" fill="transparent" r="54" stroke="currentColor" strokeWidth="8" />
                  <circle className="text-secondary drop-shadow-[0_0_8px_rgba(0,227,253,0.6)]" cx="64" cy="64" fill="transparent" r="54" stroke="currentColor" strokeDasharray="339" strokeDashoffset="34" strokeWidth="8" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-on-surface">90%</span>
                  <span className="text-[7px] font-bold text-on-surface-variant uppercase tracking-widest">Academic</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center gap-2">
                <span className="text-[9px] md:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Peer Review Score</span>
                <span className="text-xs font-black text-secondary">4.9/5</span>
              </div>
              <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[98%]" />
              </div>
            </div>
          </div>

          {/* Semantic Web */}
          <div className="bg-surface-container-low rounded-[1rem] p-6 neo-extrusion border border-white/5 flex-1 min-h-[300px]">
            <h3 className="font-headline font-bold text-xs tracking-widest uppercase text-on-surface-variant mb-4">Semantic Web</h3>
            <div className="relative h-64 flex items-center justify-center">
              {/* Simplified semantic web visualization */}
              <div className="relative w-full h-full">
                <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[8px] font-bold text-on-surface-variant uppercase">RSI Limits</div>
                <div className="absolute top-1/3 right-4 text-[8px] font-bold text-secondary uppercase">Ethics</div>
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
                  <div className="w-24 h-24 rounded-full border border-on-surface-variant/20 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-on-surface-variant uppercase text-center leading-tight">Decentralized<br />Core</span>
                  </div>
                </div>
                {/* Connection lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full opacity-20">
                  <line x1="50%" y1="25%" x2="50%" y2="55%" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="80%" y1="35%" x2="55%" y2="65%" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="50%" cy="40%" r="4" fill="currentColor" className="text-on-surface-variant" />
                  <circle cx="70%" cy="50%" r="3" fill="currentColor" className="text-on-surface-variant" />
                </svg>
              </div>
            </div>
            <p className="text-[9px] text-on-surface-variant italic mt-2">
              Related concepts based on current synthesis nodes. Click to expand graph.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
