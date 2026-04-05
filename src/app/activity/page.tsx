import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';

export default async function ActivityPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  const mockLogs = [
    { timestamp: '2026-04-02 14:22:01', node: 'Router', tool: 'intent_classifier', input: 'Publish my latest Drive video to YouTube', status: 'success', risk: 'low' },
    { timestamp: '2026-04-02 14:22:03', node: 'Creator', tool: 'list_drive_assets', input: 'recent video files', status: 'pending_approval', risk: 'medium' },
    { timestamp: '2026-04-02 14:20:15', node: 'Creator', tool: 'create_shotstack_render', input: 'youtube-ready mp4', status: 'success', risk: 'low' },
    { timestamp: '2026-04-02 14:18:42', node: 'General', tool: 'search_gmail', input: 'recent invoices', status: 'success', risk: 'low' },
    { timestamp: '2026-04-02 14:15:00', node: 'General', tool: 'get_calendar_events', input: 'today', status: 'success', risk: 'low' },
    { timestamp: '2026-04-02 13:58:30', node: 'Creator', tool: 'publish_youtube_video', input: 'Launch clip draft', status: 'pending_approval', risk: 'high' },
    { timestamp: '2026-04-02 13:45:12', node: 'Finance', tool: 'get_coinbase_account_summary', input: 'Portfolio overview', status: 'skipped', risk: 'medium' },
    { timestamp: '2026-04-02 13:30:00', node: 'General', tool: 'get_user_info', input: 'Who am I?', status: 'success', risk: 'low' },
  ];

  const riskColors: Record<string, string> = {
    low: 'text-secondary bg-secondary/10',
    medium: 'text-yellow-400 bg-yellow-400/10',
    high: 'text-error bg-error/10',
  };

  const statusColors: Record<string, string> = {
    success: 'text-secondary',
    skipped: 'text-on-surface-variant',
    pending_approval: 'text-yellow-400',
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">Activity Ledger</h1>
          <p className="text-on-surface-variant text-xs md:text-sm mt-1">Immutable audit log of all SimieBot operations</p>
        </div>
        <button className="w-fit px-4 py-2 rounded-full bg-surface-container-high neo-extrusion text-xs font-bold text-primary border border-white/5 hover:scale-105 transition-transform flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">download</span>
          Export JSON
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
        {['All', 'Router', 'General', 'Creator', 'Finance'].map((filter) => (
          <button
            key={filter}
            className={`px-3 py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider transition-all ${
              filter === 'All'
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-surface-container-high text-on-surface-variant border border-white/5 hover:text-primary'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Log Table Container */}
      <div className="bg-surface-container-low rounded-[1rem] neo-extrusion border border-white/5 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-4 text-left text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Timestamp</th>
              <th className="px-4 py-4 text-left text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Node</th>
              <th className="px-4 py-4 text-left text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Tool</th>
              <th className="px-4 py-4 text-left text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Input</th>
              <th className="px-4 py-4 text-left text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
              <th className="px-4 py-4 text-left text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Risk</th>
            </tr>
          </thead>
          <tbody>
            {mockLogs.map((log, i) => (
              <tr key={i} className="border-b border-white/5 last:border-none hover:bg-surface-container-high/50 transition-colors">
                <td className="px-6 py-3 text-[11px] font-mono text-on-surface-variant whitespace-nowrap">{log.timestamp}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">{log.node}</span>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-on-surface">{log.tool}</td>
                <td className="px-4 py-3 text-xs text-on-surface-variant max-w-[200px] truncate">{log.input}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold ${statusColors[log.status]}`}>
                    {log.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${riskColors[log.risk]}`}>
                    {log.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
