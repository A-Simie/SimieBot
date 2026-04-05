import './globals.css';
import { Manrope, Inter } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { Toaster } from '@/components/ui/sonner';
import { auth0 } from '@/lib/auth0';
import { TopBar } from '@/components/shell/top-bar';
import { SideNav } from '@/components/shell/side-nav';
import { ChatPanel } from '@/components/shell/chat-panel';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const TITLE = 'SimieBot OS — Secure Connected Account Workflows';
const DESCRIPTION = 'Auth0-powered agent orchestration for Gmail, Calendar, creator workflows, and future Coinbase connected-account actions.';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth0.getSession();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <title>{TITLE}</title>
        <link rel="shortcut icon" type="image/png" href="/images/favicon.png" />
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${manrope.variable} ${inter.variable} font-body antialiased bg-background text-on-surface min-h-screen overflow-hidden selection:bg-primary/30`}>
        <NuqsAdapter>
          <TopBar user={session?.user} />
          <SideNav />

          <main className="sm:ml-20 mt-12 h-[calc(100vh-3rem)] overflow-y-auto overflow-x-hidden">
            {children}
          </main>

          {session && (
            <ChatPanel
              endpoint={`${process.env.APP_BASE_URL}/api/chat`}
              userName={session?.user?.name}
            />
          )}

          <Toaster richColors />
        </NuqsAdapter>
      </body>
    </html>
  );
}
