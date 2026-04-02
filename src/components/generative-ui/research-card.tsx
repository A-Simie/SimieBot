import React from 'react';

export interface ResearchCardProps {
  title: string;
  authors?: string[];
  abstract: string;
  relevance: number;
  url?: string;
}

export function ResearchCard({ title, authors, abstract, relevance, url }: ResearchCardProps) {
  return (
    <div className="bg-surface-container-high neo-extrusion rounded-[1rem] p-5 border border-white/5 my-2 animate-fade-in-up shadow-glow-blue/5 transition-all hover:scale-[1.01]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-sm">library_books</span>
          </div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Synthesis Node</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold text-secondary">{relevance}% MATCH</span>
          <div className="w-12 h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-secondary shadow-glow-cyan" style={{ width: `${relevance}%` }} />
          </div>
        </div>
      </div>
      
      <h4 className="font-headline font-extrabold text-sm text-on-surface mb-1 leading-tight">{title}</h4>
      {authors && authors.length > 0 && (
        <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-tighter mb-2 italic">
          {authors.join(', ')}
        </p>
      )}
      
      <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3 mb-4 opacity-80">
        {abstract}
      </p>
      
      <div className="flex items-center justify-between border-t border-white/5 pt-4">
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-surface-container/50 border border-white/10 rounded-full text-[9px] font-bold text-on-surface-variant hover:text-primary transition-colors">
            CITATIONS
          </button>
          <button className="px-3 py-1 bg-surface-container/50 border border-white/10 rounded-full text-[9px] font-bold text-on-surface-variant hover:text-primary transition-colors">
            SIMILAR
          </button>
        </div>
        <button className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:glow-blue transition-all">
          ADD TO LIBRARY <span className="material-symbols-outlined text-xs">add_circle</span>
        </button>
      </div>
    </div>
  );
}
