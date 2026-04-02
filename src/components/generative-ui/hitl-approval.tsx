import React from 'react';

export interface HITLApprovalProps {
  type: 'transaction' | 'form' | 'access';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  onApprove?: () => void;
  onReject?: () => void;
}

export function HITLApproval({ type, title, description, severity, onApprove, onReject }: HITLApprovalProps) {
  const isHigh = severity === 'high';
  const color = isHigh ? 'var(--error)' : severity === 'medium' ? 'var(--primary)' : 'var(--secondary)';
  const glow = isHigh ? 'shadow-glow-red' : severity === 'medium' ? 'shadow-glow-blue' : 'shadow-glow-cyan';

  return (
    <div className={`bg-surface-container-low neo-extrusion rounded-[1.5rem] p-6 border-t-4 my-4 animate-fade-in-up border border-white/5 transition-all`} style={{ borderTopColor: color }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center`} style={{ backgroundColor: `${color}20`, color }}>
            <span className="material-symbols-outlined">{type === 'transaction' ? 'account_balance_wallet' : type === 'form' ? 'edit_document' : 'key'}</span>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-on-surface leading-tight">{title}</h4>
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color }}>{severity.toUpperCase()} PRIORITY CHECKPOINT</span>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full animate-pulse-glow ${glow}`} style={{ backgroundColor: color }} />
      </div>
      
      <p className="text-xs text-on-surface-variant leading-relaxed mb-6 opacity-80">
        {description}
      </p>
      
      <div className="flex gap-4">
        <button 
          onClick={onApprove}
          className={`flex-1 px-5 py-2.5 rounded-full text-[11px] font-black tracking-widest uppercase transition-all active:scale-95 text-on-primary ${glow}`}
          style={{ backgroundColor: color }}
        >
          SIMIE_OS: CONFIRM
        </button>
        <button 
          onClick={onReject}
          className="flex-1 px-5 py-2.5 bg-surface-container-high neo-extrusion rounded-full text-[11px] font-black tracking-widest uppercase text-on-surface-variant/60 border border-white/5 hover:text-error transition-colors active:scale-95"
        >
          HALT_AUTH
        </button>
      </div>
      
      <p className="text-[8px] text-center text-on-surface-variant/30 mt-4 uppercase tracking-[0.2em] font-bold">
        Secure Human-In-The-Loop Protocol v4.2
      </p>
    </div>
  );
}
