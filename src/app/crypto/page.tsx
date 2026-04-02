import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';

export default async function CryptoPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  return (
    <div className="p-8 animate-fade-in-up">
    <div className="p-4 md:p-8 animate-fade-in-up flex flex-col gap-6">
      <div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Asset Vaults</h1>
        <p className="text-on-surface-variant text-sm mt-1">V3.1 Secure OS • Neural Encryption Active</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-surface-container-low rounded-[1rem] p-6 md:p-8 neo-extrusion border border-white/5">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
                  <circle className="text-surface-container-highest" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="10" />
                  <circle className="text-secondary drop-shadow-[0_0_8px_rgba(0,227,253,0.6)]" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeDasharray="503" strokeDashoffset="100" strokeWidth="10" />
                  <circle className="text-primary" cx="96" cy="96" fill="transparent" r="65" stroke="currentColor" strokeDasharray="408" strokeDashoffset="150" strokeWidth="6" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center scale-90 md:scale-100">
                  <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Total Value</p>
                  <p className="text-2xl md:text-3xl font-black text-on-surface">$842,910.45</p>
                  <p className="text-xs font-bold text-secondary">+4.2% (24h)</p>
                </div>
              </div>
              <div className="flex-1 space-y-4 pt-0 md:pt-4 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-surface-container-high p-4 rounded-[0.75rem] neo-extrusion border border-white/5">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase">Allocated Capital</p>
                    <p className="text-xl font-black text-on-surface">$620K</p>
                  </div>
                  <div className="bg-surface-container-high p-4 rounded-[0.75rem] neo-extrusion border border-white/5">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase">Vault Yield</p>
                    <p className="text-xl font-black text-secondary">12.4%</p>
                    <p className="text-[9px] text-on-surface-variant">APY</p>
                  </div>
                </div>
                <div className="bg-surface-container p-3 rounded-[0.75rem] neo-intrusion border border-white/5 flex items-center gap-3">
                  <span className="text-[10px] md:text-xs text-on-surface-variant">AI Risk Assessment</span>
                  <span className="px-2 py-0.5 bg-secondary/20 text-secondary text-[10px] font-bold rounded">STABLE</span>
                  <div className="flex-1 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[70%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Asset Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Bitcoin', symbol: '₿', price: '$64,120.40', change: '+1.8%', color: 'text-orange-400', bg: 'bg-orange-400/20', positive: true },
              { name: 'Ethereum', symbol: 'Ξ', price: '$3,421.15', change: '+5.2%', color: 'text-purple-400', bg: 'bg-purple-400/20', positive: true },
              { name: 'Solana', symbol: '◎', price: '$145.82', change: '-0.4%', color: 'text-green-400', bg: 'bg-green-400/20', positive: false },
            ].map((asset) => (
              <div key={asset.name} className="bg-surface-container-high rounded-[1rem] p-5 neo-extrusion border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-full ${asset.bg} flex items-center justify-center text-lg font-bold ${asset.color}`}>
                    {asset.symbol}
                  </div>
                  <span className={`text-xs font-bold ${asset.positive ? 'text-secondary' : 'text-error'}`}>{asset.change}</span>
                </div>
                <p className="text-sm font-bold text-on-surface">{asset.name}</p>
                <p className="text-lg font-black text-on-surface">{asset.price}</p>
                {/* Mini sparkline */}
                <svg className="w-full h-8 mt-2" viewBox="0 0 100 30">
                  <path
                    d={asset.positive ? 'M0,25 Q25,20 40,15 T70,10 T100,5' : 'M0,10 Q25,15 50,20 T100,25'}
                    fill="none"
                    stroke={asset.positive ? '#00e3fd' : '#ff716c'}
                    strokeWidth="2"
                    opacity="0.6"
                  />
                </svg>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-surface-container-low rounded-[1rem] p-6 neo-extrusion border border-white/5">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { icon: 'north_east', label: 'Withdraw to Cold Wallet', time: '12:45 PM', id: '#XF902', amount: '-0.042 BTC', status: 'CONFIRMED', statusColor: 'text-secondary bg-secondary/10' },
                { icon: 'south_west', label: 'Deposit from Exchange', time: '10:12 AM', id: '#A8221', amount: '+2.4 ETH', status: 'CONFIRMED', statusColor: 'text-secondary bg-secondary/10' },
                { icon: 'sync_alt', label: 'Internal Swap SOL/ETH', time: '08:02 AM', id: '#H1120', amount: '~ SOL', status: 'PENDING', statusColor: 'text-yellow-400 bg-yellow-400/10' },
              ].map((tx) => (
                <div key={tx.id} className="p-4 bg-surface-container rounded-[0.75rem] neo-intrusion border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-on-surface-variant text-sm">{tx.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{tx.label}</p>
                      <p className="text-[10px] text-on-surface-variant">{tx.time} • ID: {tx.id}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between">
                    <p className="text-sm font-bold">{tx.amount}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${tx.statusColor}`}>{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Panel */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          {/* Vault Integrity */}
          <div className="bg-surface-container-low rounded-[1rem] p-6 neo-extrusion border border-white/5 flex flex-col items-center">
            <h3 className="font-headline font-bold text-xs tracking-widest uppercase text-on-surface-variant self-start mb-4">Vault Integrity</h3>
            <div className="relative w-32 h-32 my-4">
              <svg className="w-full h-full">
                <circle cx="64" cy="64" r="50" fill="none" stroke="#20262f" strokeWidth="6" strokeDasharray="4 4" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-surface-container-high neo-extrusion flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">lock</span>
                </div>
              </div>
            </div>
            <h4 className="font-headline font-bold text-sm text-on-surface mt-2">CORE SECURE</h4>
            <p className="text-[10px] text-on-surface-variant text-center mt-2 leading-relaxed">
              Neural encryption active. All hardware modules synchronized with V3.1 protocol.
            </p>
          </div>

          {/* Network Health */}
          <div className="bg-surface-container-low rounded-[1rem] p-6 neo-extrusion border border-white/5">
            <h3 className="font-headline font-bold text-xs tracking-widest uppercase text-on-surface-variant mb-6">Network Health</h3>
            <div className="space-y-5">
              {[
                { label: 'Global Latency', value: '12ms', pct: 90, color: 'bg-secondary' },
                { label: 'Throughput', value: '1.2GB/s', pct: 65, color: 'bg-primary' },
                { label: 'Neural Encryption', value: '100%', pct: 100, color: 'bg-secondary' },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span className="text-on-surface-variant uppercase tracking-widest">{m.label}</span>
                    <span className="text-secondary">{m.value}</span>
                  </div>
                  <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className={`h-full ${m.color}`} style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auth Logs */}
          <div className="bg-surface-container-low rounded-[1rem] p-6 neo-extrusion border border-white/5 flex-1">
            <h3 className="font-headline font-bold text-xs tracking-widest uppercase text-on-surface-variant mb-4">Auth Logs</h3>
            <div className="space-y-3">
              {[
                { type: 'SEC_EVENT', label: 'Biometric handshake success', time: 'Today, 12:45:01' },
                { type: 'SEC_EVENT', label: 'Ledger Nano X connected', time: 'Today, 11:20:44' },
                { type: 'SYS_NOTICE', label: 'Node relay updated', time: 'Today, 09:12:00' },
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                    log.type === 'SEC_EVENT' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                  }`}>
                    {log.type}
                  </span>
                  <div>
                    <p className="text-xs font-semibold">{log.label}</p>
                    <p className="text-[9px] text-on-surface-variant">{log.time}</p>
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
