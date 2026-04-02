import React from 'react';

export interface CryptoRiskGaugeProps {
  asset: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  threats?: string[];
}

export function CryptoRiskGauge({ asset, riskScore, riskLevel, threats }: CryptoRiskGaugeProps) {
  const isHigh = riskLevel === 'high';
  const colorClass = isHigh ? 'text-error shadow-glow-red' : 'text-secondary shadow-glow-cyan';
  const circleColor = isHigh ? 'var(--error)' : 'var(--secondary)';
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - riskScore / 100);

  return (
    <div className="bg-surface-container-low neo-intrusion rounded-[1rem] p-5 border border-white/5 my-2 animate-fade-in-up flex items-center gap-6 shadow-glow-cyan/5 transition-all">
      <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90">
          <circle cx="48" cy="48" r={radius} fill="transparent" stroke="var(--surface-container-highest)" strokeWidth="6" />
          <circle 
            cx="48" 
            cy="48" 
            r={radius} 
            fill="transparent" 
            stroke={circleColor} 
            strokeWidth="6" 
            strokeLinecap="round"
            strokeDasharray={circumference} 
            strokeDashoffset={offset} 
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-black ${colorClass}`}>{riskScore}%</span>
          <span className="text-[7px] font-bold text-on-surface-variant uppercase tracking-widest leading-none">Security</span>
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary text-sm">security_update_good</span>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Asset Matrix: {asset}</h4>
        </div>
        
        <p className={`text-sm font-black mb-1 ${colorClass}`}>
          {riskLevel.toUpperCase()} RISK LEVEL
        </p>
        
        {threats && threats.length > 0 ? (
          <ul className="space-y-1">
            {threats.map((t, i) => (
              <li key={i} className="flex items-center gap-1.5 text-[10px] text-on-surface/70">
                <span className="w-1 h-1 rounded-full bg-error animate-pulse" />
                {t}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[10px] italic text-on-surface-variant/70">
            No active threat signatures detected in current approvals.
          </p>
        )}
        
        <div className="mt-4 flex gap-2">
          <button className="px-3 py-1 bg-surface-container-high neo-extrusion rounded-full text-[9px] font-bold text-primary border border-white/5 hover:scale-105 transition-transform">
            SCANNED
          </button>
          <button className="px-3 py-1 bg-surface-container-high neo-extrusion rounded-full text-[9px] font-bold text-on-surface-variant/40 border border-white/5 cursor-not-allowed">
            LOCK ASSET
          </button>
        </div>
      </div>
    </div>
  );
}
