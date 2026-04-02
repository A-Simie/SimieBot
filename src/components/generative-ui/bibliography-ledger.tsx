import React from 'react';

export interface BibliographyLedgerProps {
  citations: Array<{ key: string; title: string; author: string; year: number }>;
}

export function BibliographyLedger({ citations }: BibliographyLedgerProps) {
  return (
    <div className="bg-surface-container-low neo-intrusion rounded-[1.5rem] p-6 border border-white/5 my-4 animate-fade-in-up transition-all shadow-glow-blue/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">menu_book</span>
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-on-surface mb-1 leading-tight">Bibliography Matrix</h4>
          <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Zotero Node v3.1</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded leading-none">
            {citations.length} ENTRIES
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        {citations.map((cite, i) => (
          <div key={cite.key} className="flex gap-4 p-3 bg-surface-container-high/50 neo-extrusion rounded-[1rem] border border-white/5 transition-all hover:scale-[1.02]">
            <div className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-surface-container-highest text-[9px] font-black text-on-surface-variant shrink-0">
               {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-[11px] font-black text-on-surface uppercase tracking-tight truncate leading-tight">{cite.title}</h5>
              <p className="text-[10px] text-on-surface-variant mt-1 italic font-bold">
                {cite.author} ({cite.year})
              </p>
              <p className="text-[8px] font-mono text-primary/60 mt-0.5 lowercase tracking-widest">
                CID: {cite.key}
              </p>
            </div>
            <button className="text-on-surface-variant/40 hover:text-primary transition-colors self-center">
               <span className="material-symbols-outlined text-sm">open_in_new</span>
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex gap-3">
        <button className="flex-1 py-3 bg-gradient-to-br from-primary to-primary-container rounded-full text-[10px] font-black tracking-widest uppercase text-on-primary shadow-glow-blue active:scale-95 transition-all flex items-center justify-center gap-2">
          DOWNLOAD BIBTEX <span className="material-symbols-outlined text-sm">download</span>
        </button>
        <button className="px-5 py-3 bg-surface-container-high neo-extrusion rounded-full text-[10px] font-black tracking-widest text-on-surface-variant/70 border border-white/5 hover:text-primary transition-all">
          SYNC
        </button>
      </div>
    </div>
  );
}
