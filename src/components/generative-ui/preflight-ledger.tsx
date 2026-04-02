import React from 'react';

export interface PreflightLedgerProps {
  action: string;
  metadata: Record<string, string | number>;
}

export function PreflightLedger({ action, metadata }: PreflightLedgerProps) {
  return (
    <div className="bg-surface-container-low neo-intrusion rounded-[1rem] p-5 border border-white/5 my-2 animate-fade-in-up border-l-4 border-l-secondary shadow-glow-cyan/5 transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-secondary">verified_user</span>
        </div>
        <div>
           <h3 className="text-xs font-black uppercase tracking-widest text-on-surface mb-1">Preflight Sync: {action}</h3>
           <p className="text-[10px] font-bold text-secondary uppercase tracking-widest leading-none">Security Kernel Active</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {Object.entries(metadata).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-none last:pb-0">
             <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">{key.replace(/_/g, ' ')}</span>
             <span className="text-xs font-mono text-on-surface text-right truncate max-w-[200px]">{value}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex gap-3">
        <button className="flex-1 px-4 py-2 bg-gradient-to-br from-secondary to-secondary-container rounded-full text-[10px] font-bold text-on-secondary shadow-glow-cyan active:scale-95 transition-all">
           APPROVE & EXECUTE
        </button>
        <button className="flex-1 px-4 py-2 bg-surface-container-high neo-extrusion rounded-full text-[10px] font-bold text-error border border-white/5 hover:scale-105 transition-transform">
           ABORT MISSION
        </button>
      </div>
    </div>
  );
}
