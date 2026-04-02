import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  return (
    <div className="p-8 animate-fade-in-up">
    <div className="p-4 md:p-8 animate-fade-in-up flex flex-col gap-6">
      <div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">System Preferences</h1>
        <p className="text-on-surface-variant text-sm mt-1">Fine-tune your Luminous Engine environment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          {/* AI Core Tuning */}
          <div className="bg-surface-container-low rounded-[1rem] p-6 md:p-8 neo-extrusion border border-white/5">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-on-surface-variant">smart_toy</span>
                  <h3 className="font-headline text-lg font-bold">AI Core Tuning</h3>
                </div>
                <p className="text-sm text-on-surface-variant mb-6">
                  Adjust the recursive depth of inference cycles for enhanced personality nuance.
                </p>
                <div className="flex items-end gap-3">
                  <div>
                    <p className="text-3xl font-black text-on-surface">84.2%</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Inference Depth</p>
                  </div>
                </div>
              </div>
              <div className="relative w-32 h-32 shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle className="text-surface-container-highest" cx="64" cy="64" fill="transparent" r="54" stroke="currentColor" strokeWidth="6" />
                  <circle className="text-primary drop-shadow-[0_0_8px_rgba(134,173,255,0.4)]" cx="64" cy="64" fill="transparent" r="54" stroke="currentColor" strokeDasharray="339" strokeDashoffset="54" strokeWidth="6" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-primary">smart_toy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interface & Energy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-low rounded-[1rem] p-6 neo-extrusion border border-white/5">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-sm">visibility</span>
                <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Interface</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Luminous Mode', enabled: true },
                  { label: 'Glass Refraction', enabled: false },
                ].map((toggle) => (
                  <div key={toggle.label} className="flex items-center justify-between">
                    <span className="text-sm text-on-surface">{toggle.label}</span>
                    <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${toggle.enabled ? 'bg-primary' : 'bg-surface-container-highest'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-on-surface transition-all ${toggle.enabled ? 'left-5' : 'left-0.5'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-low rounded-[1rem] p-6 neo-extrusion border border-white/5">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-secondary text-sm">bolt</span>
                <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">Energy Profile</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Pulse Frequency</span>
                  <span className="text-xs font-bold text-on-surface">4.2 GHz</span>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden neo-intrusion">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary w-[65%] shadow-glow-cyan" />
                </div>
              </div>
            </div>
          </div>

          {/* Security Protocols */}
          <div className="bg-surface-container-low rounded-[1rem] p-6 neo-extrusion border border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">shield</span>
                <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Security Protocols</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-on-surface-variant uppercase">Biometric Handshake</span>
                <div className="w-10 h-5 rounded-full bg-primary relative cursor-pointer">
                  <div className="absolute top-0.5 left-5 w-4 h-4 rounded-full bg-on-surface" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: 'phone_iphone', name: 'Luminous Node 01', type: 'Authorized Mobile', verified: true },
                { icon: 'computer', name: 'Neural Core Mac', type: 'Desktop Access', verified: false },
              ].map((device) => (
                <div key={device.name} className="p-4 bg-surface-container rounded-[0.75rem] neo-intrusion border border-white/5 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary shrink-0">{device.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{device.name}</p>
                    <p className="text-[9px] text-on-surface-variant uppercase truncate">{device.type}</p>
                  </div>
                  {device.verified && (
                    <span className="material-symbols-outlined text-secondary text-sm ml-auto shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Panel */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-low rounded-[1rem] p-6 neo-extrusion border border-white/5">
            <h3 className="font-headline font-bold text-xs tracking-widest uppercase text-on-surface-variant mb-4">OS Intelligence Layer</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">Neural Load</span>
              <div className="relative w-10 h-10">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="20" cy="20" r="16" fill="transparent" stroke="#20262f" strokeWidth="3" />
                  <circle cx="20" cy="20" r="16" fill="transparent" stroke="#86adff" strokeWidth="3" strokeDasharray="100" strokeDashoffset="28" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold">72%</span>
              </div>
            </div>
            <p className="text-2xl font-black text-on-surface">12.4 <span className="text-sm font-normal text-on-surface-variant">tflops</span></p>
          </div>

          <div className="bg-surface-container-low rounded-[1rem] p-4 neo-extrusion border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">Core Temp</span>
              <span className="text-xs font-bold text-error">42°C</span>
            </div>
            <div className="flex gap-1">
              {[60, 70, 65, 75, 80, 72, 68, 74, 78, 82].map((h, i) => (
                <div key={i} className="flex-1 h-6 bg-surface-container-highest rounded-sm overflow-hidden">
                  <div className="w-full bg-on-surface-variant/30 rounded-sm" style={{ height: `${h}%`, marginTop: `${100 - h}%` }} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-low rounded-[1rem] p-6 neo-extrusion border border-white/5">
            <h3 className="font-headline font-bold text-xs tracking-widest uppercase text-on-surface-variant mb-4">Activity Pulse</h3>
            <div className="h-24 bg-surface-container rounded-[0.75rem] neo-intrusion border border-white/5 relative overflow-hidden flex items-center justify-center">
              <div className="flex items-center gap-6">
                <div className="w-3 h-3 rounded-full bg-secondary animate-pulse-glow" />
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
              </div>
              <span className="absolute text-[8px] text-on-surface-variant/50 uppercase">Syncing Matrix...</span>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-[1rem] p-6 neo-extrusion border border-white/5 flex-1">
            <h3 className="font-headline font-bold text-xs tracking-widest uppercase text-on-surface-variant mb-4">Storage Matrix</h3>
            <div className="space-y-4">
              {[
                { label: 'Encrypted Core', size: '1.2 TB', pct: 60 },
                { label: 'Raw Data Cache', size: '450 GB', pct: 35 },
                { label: 'Legacy Archives', size: '2.1 TB', pct: 80 },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold truncate">{s.label}</span>
                    <span className="text-on-surface-variant shrink-0">{s.size}</span>
                  </div>
                  <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
    </div>
  );
}
