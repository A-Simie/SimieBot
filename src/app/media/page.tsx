import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';

export default async function MediaPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  return (
    <div className="p-4 md:p-8 animate-fade-in-up grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Main Video Area */}
      <section className="lg:col-span-8 flex flex-col gap-4">
        {/* Video Player */}
        <div className="relative bg-surface-container-lowest rounded-[1rem] neo-extrusion border border-white/5 overflow-hidden flex-1 min-h-[350px] md:min-h-[500px] flex items-center justify-center">
          {/* 4K Badge */}
          <div className="absolute top-4 left-4 z-10 shrink-0">
            <span className="px-3 py-1 bg-primary/20 text-primary text-[9px] md:text-[10px] font-bold rounded-full border border-primary/30">
              4K ULTRA HD / 60FPS
            </span>
          </div>

          {/* Placeholder */}
          <div className="flex flex-col items-center gap-4 text-on-surface-variant p-6 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-surface-container/60 backdrop-blur-xl flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-all">
              <span className="material-symbols-outlined text-3xl md:text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            </div>
            <p className="text-xs md:text-sm max-w-xs">No creator asset loaded. Connect Drive or Slack through chat to prepare a YouTube-ready publish flow.</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-surface-container-high rounded-[1rem] p-4 neo-extrusion border border-white/5">
          <div className="flex justify-between text-[9px] md:text-[10px] font-mono text-on-surface-variant mb-2">
            <span>00:00:00</span>
            <span>00:00:00</span>
          </div>
          <div className="relative h-2 bg-surface-container-highest rounded-full overflow-hidden neo-intrusion">
            <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-secondary w-0 rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-on-surface rounded-full shadow-glow-blue cursor-pointer" />
          </div>
        </div>

        {/* Thumbnail Strip */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-24 h-16 md:w-32 md:h-20 shrink-0 rounded-lg bg-surface-container-high neo-extrusion border border-white/5 flex items-center justify-center cursor-pointer hover:border-primary/30 transition-all"
            >
              <span className="material-symbols-outlined text-on-surface-variant/40">image</span>
            </div>
          ))}
        </div>
      </section>

      {/* Right Panel */}
      <aside className="lg:col-span-4 flex flex-col gap-6">
        {/* Audio Pulse */}
        <div className="bg-surface-container-low rounded-[1rem] p-6 neo-extrusion border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline font-bold text-xs tracking-widest uppercase text-on-surface-variant">Audio Pulse</h3>
            <span className="material-symbols-outlined text-secondary text-sm">equalizer</span>
          </div>
          <div className="flex items-end justify-center gap-1 h-32 md:h-48">
            {[40, 70, 55, 85, 60, 90, 45, 75, 50, 80, 65, 95].map((h, i) => (
              <div
                key={i}
                className="w-2 md:w-3 bg-secondary rounded-t-sm animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${0.8 + Math.random() * 0.4}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Details and Controls */}
        <div className="flex flex-col gap-6 flex-1">
          {/* Throughput & Latency */}
          <div className="bg-surface-container-low rounded-[1rem] p-6 neo-extrusion border border-white/5 space-y-5">
            {[
              { label: 'Throughput', value: '1.2 GB/s', pct: 70, color: 'text-secondary' },
              { label: 'Latency', value: '4ms', pct: 15, color: 'text-on-surface' },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-on-surface-variant uppercase tracking-widest">{m.label}</span>
                  <span className={m.color}>{m.value}</span>
                </div>
                <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Volume */}
          <div className="bg-surface-container-low rounded-[1rem] p-4 neo-extrusion border border-white/5 flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">volume_up</span>
            <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[75%]" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
