import React from 'react';

export interface VideoTimelineProps {
  markers: Array<{ timestamp: string; title: string; text: string }>;
  duration: string;
}

export function VideoTimeline({ markers, duration }: VideoTimelineProps) {
  return (
    <div className="bg-surface-container-low neo-extrusion rounded-[1rem] p-5 border border-white/5 my-2 animate-fade-in-up shadow-glow-cyan/5 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-sm">movie_filter</span>
          </div>
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest leading-none">Semantic Timeline Analysis</span>
        </div>
        <span className="text-[10px] font-mono text-on-surface-variant/40 uppercase">Total: {duration}</span>
      </div>
      
      <div className="space-y-4">
        {markers.map((marker, i) => (
          <div key={i} className="group relative flex items-start gap-4">
            <div className="flex flex-col items-center shrink-0">
               <div className="w-2.5 h-2.5 rounded-full bg-secondary shadow-glow-cyan group-hover:scale-125 transition-transform" />
               {i < markers.length - 1 && (
                 <div className="w-0.5 h-16 bg-surface-container-highest/50 my-1" />
               )}
            </div>
            
            <div className="flex-1 -mt-1 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-secondary bg-secondary/10 px-1.5 py-0.5 rounded leading-none">{marker.timestamp}</span>
                <h5 className="text-[11px] font-black text-on-surface uppercase tracking-tight">{marker.title}</h5>
              </div>
              <p className="text-[10px] text-on-surface-variant leading-relaxed line-clamp-2">
                {marker.text}
              </p>
              
              <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-[9px] font-bold text-primary hover:glow-blue transition-all flex items-center gap-1">
                   JUMP <span className="material-symbols-outlined text-[10px]">play_arrow</span>
                </button>
                <button className="text-[9px] font-bold text-on-surface-variant hover:text-on-surface transition-all flex items-center gap-1">
                   TRANSCRIPT <span className="material-symbols-outlined text-[10px]">notes</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-2 flex justify-end">
        <button className="px-4 py-2 bg-gradient-to-br from-primary to-primary-container rounded-full text-[10px] font-bold text-on-primary shadow-glow-blue active:scale-95 transition-all flex items-center gap-2">
           FULL ANALYSIS <span className="material-symbols-outlined text-sm">open_in_new</span>
        </button>
      </div>
    </div>
  );
}
