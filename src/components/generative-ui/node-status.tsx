'use client';

import { 
  Search, 
  Globe, 
  Binary, 
  Cpu, 
  Layers, 
  Loader2
} from 'lucide-react';

export function ThesisLoading() {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl max-w-sm animate-in fade-in zoom-in duration-500">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Globe className="w-6 h-6 text-primary animate-spin-slow" />
          <Search className="absolute -top-1 -right-1 w-3 h-3 text-secondary animate-bounce" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Deep Neural Search</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-xs text-on-surface/70">
          <Loader2 className="w-3 h-3 animate-spin text-primary" />
          <span>Surfing global data clusters...</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-on-surface/40">
          <Binary className="w-3 h-3" />
          <span>Synthesizing monocrystalline insights...</span>
        </div>
      </div>
      
      {/* Animated Progress Bar */}
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent animate-progress-slide"
        />
      </div>
    </div>
  );
}

export function CreatorLoading() {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <Layers className="w-6 h-6 text-secondary animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Media Pipeline Active</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-bold uppercase animate-pulse">Trimming</div>
          <div className="px-2 py-0.5 rounded bg-white/5 text-on-surface-variant text-[8px] font-bold uppercase opacity-30">FX</div>
          <div className="px-2 py-0.5 rounded bg-white/5 text-on-surface-variant text-[8px] font-bold uppercase opacity-30">Render</div>
        </div>
        <p className="text-xs text-on-surface/70 flex items-center gap-2">
          <Cpu className="w-3 h-3 text-secondary" />
          Orchestrating FFmpeg & Nova...
        </p>
      </div>
      
      <div className="flex gap-1.5 h-10 items-end">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={`flex-1 bg-secondary/40 rounded-t-sm animate-bounce-custom delay-${i * 100}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
}
