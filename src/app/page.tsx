import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  const userName = session.user?.name || 'Operator';

  return (
    <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in-up">
      {/* Center Workspace */}
      <section className="col-span-8 flex flex-col gap-6">
        {/* Hero Welcome Card */}
        <div className="relative overflow-hidden p-6 md:p-8 rounded-[1rem] bg-surface-container-low neo-extrusion border border-white/5 flex flex-col justify-center min-h-[280px]">
          <div className="absolute -right-10 -top-10 w-48 md:w-64 h-48 md:h-64 bg-primary/10 rounded-full blur-[60px] md:blur-[80px]" />
          <div className="z-10 pr-24 md:pr-48">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2 truncate">
              Welcome back, {userName}
            </h1>
            <p className="font-body text-on-surface-variant text-lg">
              System state: Nominal. Connected-account workflows ready for Gmail, Calendar, and creator automation.
            </p>
          </div>
          <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 scale-75 md:scale-100">
            <div className="w-24 md:w-32 h-24 md:h-32 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse opacity-50 shadow-glow-blue" />
              <span className="material-symbols-outlined text-4xl md:text-5xl text-primary drop-shadow-[0_0_8px_rgba(74,140,255,0.6)]">smart_toy</span>
            </div>
          </div>
        </div>

        {/* Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* System Health */}
          <div className="bg-surface-container-high rounded-[1rem] p-6 neo-extrusion border border-white/5 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-headline font-bold text-sm tracking-widest uppercase text-on-surface-variant">System Health</h3>
                <p className="text-2xl font-black text-secondary">98.4%</p>
              </div>
              <span className="material-symbols-outlined text-secondary text-3xl">analytics</span>
            </div>
            <div className="mt-auto space-y-4">
              <div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden neo-intrusion">
                <div className="h-full bg-gradient-to-r from-primary to-secondary w-[98%] shadow-[0_0_8px_rgba(0,227,253,0.5)]" />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-on-surface-variant tracking-tighter">
                <span>NEURAL LOAD</span>
                <span>THERMAL: 32°C</span>
              </div>
            </div>
          </div>

          {/* Workflow Snippets */}
          <div className="bg-surface-container-high rounded-[1rem] p-6 neo-extrusion border border-white/5">
            <h3 className="font-headline font-bold text-sm tracking-widest uppercase text-on-surface-variant mb-4">Workflow Snippets</h3>
            <div className="space-y-3">
              <div className="p-3 bg-surface-container rounded-md neo-intrusion flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-sm mt-1">description</span>
                <div>
                  <p className="text-xs font-semibold">YouTube launch clip from Drive</p>
                  <p className="text-[10px] text-on-surface-variant opacity-60">Ready for render planning</p>
                </div>
              </div>
              <div className="p-3 bg-surface-container rounded-md neo-intrusion flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-sm mt-1">description</span>
                <div>
                  <p className="text-xs font-semibold">Unread inbox follow-ups</p>
                  <p className="text-[10px] text-on-surface-variant opacity-60">Needs approval-aware action</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Media */}
          <div className="col-span-2 bg-surface-container-high rounded-[1rem] p-6 neo-extrusion border border-white/5 flex items-center gap-6">
            <div className="w-16 h-16 rounded-xl overflow-hidden neo-extrusion shrink-0 bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">album</span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Now Streaming</p>
              <h4 className="font-headline font-bold text-lg leading-tight">Digital Horizon Synthetics</h4>
              <p className="text-xs text-on-surface-variant">SimieBot Ambient Engine</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full neo-extrusion flex items-center justify-center text-on-surface hover:text-primary active:scale-95 transition-all">
                <span className="material-symbols-outlined">skip_previous</span>
              </button>
              <button className="w-12 h-12 rounded-full bg-primary text-on-primary shadow-glow-blue flex items-center justify-center active:scale-95 transition-all">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>pause</span>
              </button>
              <button className="w-10 h-10 rounded-full neo-extrusion flex items-center justify-center text-on-surface hover:text-primary active:scale-95 transition-all">
                <span className="material-symbols-outlined">skip_next</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Right Panel — System Intelligence Layer */}
      <aside className="col-span-1 md:col-span-4 flex flex-col gap-6">
        {/* AI Processing Gauge */}
        <div className="bg-surface-container-low rounded-[1rem] p-6 neo-extrusion border border-white/5 flex flex-col items-center">
          <h3 className="font-headline font-bold text-xs tracking-widest uppercase text-on-surface-variant self-start mb-6">AI Core Intel</h3>
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle className="text-surface-container-highest" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="8" />
              <circle className="text-secondary drop-shadow-[0_0_8px_rgba(0,227,253,0.6)]" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset="110" strokeWidth="8" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-on-surface">75%</span>
              <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">Inference</span>
            </div>
          </div>
          <div className="mt-6 w-full flex justify-between gap-2">
            <div className="flex-1 bg-surface-container-highest p-2 rounded neo-intrusion text-center">
              <p className="text-[8px] text-on-surface-variant font-bold">TOKENS/S</p>
              <p className="text-xs font-black text-primary">128.4</p>
            </div>
            <div className="flex-1 bg-surface-container-highest p-2 rounded neo-intrusion text-center">
              <p className="text-[8px] text-on-surface-variant font-bold">LATENCY</p>
              <p className="text-xs font-black text-secondary">12ms</p>
            </div>
          </div>
        </div>

        {/* Asset Matrix */}
        <div className="bg-surface-container-low rounded-[1rem] p-6 neo-extrusion border border-white/5 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline font-bold text-xs tracking-widest uppercase text-on-surface-variant">Asset Matrix</h3>
            <span className="material-symbols-outlined text-secondary text-sm">bolt</span>
          </div>
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant">Creator Pipeline</p>
                  <h4 className="text-xl font-black text-on-surface">Drive to Shotstack to YouTube</h4>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-secondary">AUTH0</p>
                  <div className="flex items-end gap-[2px] h-6">
                    <div className="w-[3px] bg-secondary/30 h-2" />
                    <div className="w-[3px] bg-secondary/50 h-3" />
                  <div className="w-[3px] bg-secondary/70 h-5" />
                  <div className="w-[3px] bg-secondary h-4" />
                  <div className="w-[3px] bg-secondary h-6 animate-pulse" />
                  </div>
                </div>
              </div>
            <div className="flex items-end justify-between border-t border-white/5 pt-4">
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant">ETH/USDT</p>
                <h4 className="text-xl font-black text-on-surface">$3,452.12</h4>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-error">-0.8%</p>
                <div className="flex items-end gap-[2px] h-6">
                  <div className="w-[3px] bg-error/70 h-5" />
                  <div className="w-[3px] bg-error/50 h-3" />
                  <div className="w-[3px] bg-error/30 h-4" />
                  <div className="w-[3px] bg-error/20 h-2" />
                  <div className="w-[3px] bg-error h-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Protocol Logs */}
          <div className="bg-slate-950/40 rounded-[1rem] p-4 neo-intrusion border border-white/5 h-48 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(0,227,253,1)]" />
            <h3 className="font-headline font-bold text-[10px] tracking-widest uppercase text-on-surface-variant">Security Protocol Logs</h3>
          </div>
          <div className="font-mono text-[9px] text-secondary/70 space-y-2 overflow-y-auto">
            <p className="flex items-center gap-2">
              <span className="text-on-surface-variant">[14:22:01]</span>
              <span className="bg-secondary/10 px-1 rounded">AUTH</span>
              Validating Google connected-account uplink...
            </p>
            <p className="flex items-center gap-2">
              <span className="text-on-surface-variant">[14:22:05]</span>
              <span className="text-primary">CORE</span>
              Creator orchestration initialized.
            </p>
            <p className="flex items-center gap-2">
              <span className="text-on-surface-variant">[14:22:12]</span>
              <span className="text-error-dim">WARN</span>
              Awaiting YouTube publish authorization.
            </p>
            <p className="flex items-center gap-2 animate-pulse">
              <span className="text-on-surface-variant">[14:22:15]</span>
              <span className="bg-primary/20 px-1 rounded text-primary">LIVE</span>
              Token Vault workflow active...
            </p>
            <p className="flex items-center gap-2 opacity-40">
              <span className="text-on-surface-variant">[14:22:18]</span>
              Awaiting creator asset selection.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
