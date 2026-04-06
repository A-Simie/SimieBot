import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  ArrowRight,
  MessageSquare,
  History as HistoryIcon,
  Github,
  Mail,
  Calendar,
  Globe,
  Settings,
  Youtube,
  Slack,
  Database,
  Video
} from 'lucide-react';
import { getChatThreads } from '@/lib/supabase';
import { cn } from '@/utils/cn';

export default async function DashboardPage() {
  const session = await auth0.getSession();
  if (!session) redirect('/auth/login');

  const user = session.user;
  const firstName = user.name?.split(' ')[0] || 'Operator';
  const isGoogleActive = user.sub?.startsWith('google-oauth2|');
  const isGithubActive = user.sub?.startsWith('github|');

  // Fetch real data from Supabase
  const recentThreads = await getChatThreads(user.sub);
  const displayThreads = recentThreads.slice(0, 6);

  return (
    <div className="relative min-h-screen bg-[#0a0e14] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10 p-6 lg:p-10 flex flex-col gap-12 max-w-[1400px] mx-auto animate-in fade-in duration-700">
        {/* Simplified Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Systems Online</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black font-headline tracking-tighter text-white">
              Hi, <span className="text-primary">{firstName}</span>.
            </h1>
            <p className="text-on-surface-variant text-base">
              Everything is ready.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/hub"
              className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all flex items-center gap-3 active:scale-95"
            >
              <MessageSquare className="w-5 h-5 text-primary" />
              Open Workspace
            </Link>
          </div>
        </header>


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 transition-all duration-500">
          {/* 1. Capabilities Hero Card (Order 1) */}
          <div className="lg:col-span-8 order-1">
            <div className="relative group bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10 text-center flex flex-col items-center gap-6 shadow-2xl transition-all hover:bg-white/[0.05] overflow-hidden min-h-[300px] justify-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/10 blur-[100px] opacity-20" />
              
              <div className="relative flex flex-col items-center gap-5">
                <div className="rounded-full border border-secondary/30 bg-secondary/10 px-5 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-secondary shadow-[0_0_15px_rgba(0,227,253,0.15)]">
                  Secure actions across connected accounts
                </div>
                <h2 className="text-2xl lg:text-3xl font-black font-headline tracking-tighter text-white leading-tight max-w-2xl">
                  One chat to work across Gmail, Calendar, Drive, and YouTube creator workflows.
                </h2>
                <p className="text-on-surface-variant text-xs md:text-sm max-w-xl leading-relaxed">
                  Ask SimieBot to read email, check your schedule, or plan a creator workflow. Sensitive actions stay behind Auth0 authorization so the assistant acts on your behalf without becoming reckless.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Connected Accounts (Order 2 - Sidebar on Desktop) */}
          <div className="lg:col-span-4 lg:row-span-2 order-2">
            <h2 className="text-lg font-black uppercase tracking-widest text-white mb-6">Connected Accounts</h2>
            <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 space-y-3">
              {[
                { name: 'Gmail', icon: Mail, color: 'text-red-400', active: isGoogleActive },
                { name: 'Calendar', icon: Calendar, color: 'text-blue-400', active: isGoogleActive },
                { name: 'Drive', icon: Database, color: 'text-primary', active: isGoogleActive },
                { name: 'YouTube', icon: Youtube, color: 'text-red-500', active: isGoogleActive },
                { name: 'GitHub', icon: Github, color: 'text-white', active: isGithubActive },
                { name: 'Slack', icon: Slack, color: 'text-purple-400', active: false },
                { name: 'Media Editing', icon: Video, color: 'text-orange-400', active: true },
                { name: 'Web Search', icon: Globe, color: 'text-secondary', active: true },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 transition-all hover:bg-white/[0.04]">
                  <div className="flex items-center gap-4">
                    <service.icon className={cn("w-5 h-5", service.color)} />
                    <span className="text-sm font-bold text-on-surface">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      service.active ? "text-green-500" : "text-red-500"
                    )}>
                      {service.active ? 'Active' : 'Not Active'}
                    </span>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]",
                      service.active ? "bg-green-500" : "bg-red-500"
                    )} />
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">System Status</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Your assistant is synchronized with all connected services. Real-time orchestration is active.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Recent Conversations (Order 3) */}
          <div className="lg:col-span-8 order-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-widest text-white flex items-center gap-3">
                <HistoryIcon className="w-5 h-5 text-primary" />
                Recent Conversations
              </h2>
              <Link href="/hub" className="text-xs font-bold text-primary hover:underline">View All</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayThreads.length > 0 ? (
                displayThreads.map((thread) => (
                  <Link
                    key={thread.id}
                    href={`/hub?threadId=${thread.id}`}
                    className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-[2rem] p-6 transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <MessageSquare className="w-5 h-5 text-on-surface-variant group-hover:text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate leading-tight">{thread.title}</p>
                        <p className="text-[10px] text-on-surface-variant font-medium mt-1 uppercase tracking-widest">
                          {new Date(thread.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-on-surface-variant/40 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full p-20 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center bg-white/[0.01]">
                  <MessageSquare className="w-12 h-12 text-on-surface-variant/20 mb-4" />
                  <p className="text-sm font-bold text-on-surface-variant mb-6">No conversations yet.</p>
                  <Link href="/hub" className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Open Workspace</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
