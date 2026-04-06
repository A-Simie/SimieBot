import './globals.css';
import { Manrope, Inter } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { Toaster } from '@/components/ui/sonner';
import { auth0 } from '@/lib/auth0';
import { TopBar } from '@/components/shell/top-bar';
import { SideNav } from '@/components/shell/side-nav';

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

const TITLE = 'SimieBot — Secure Connected Account Workflows';
const DESCRIPTION = 'Auth0-powered agent orchestration for Gmail, Calendar, and creator workflows.';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth0.getSession();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <title>{TITLE}</title>
        <link rel="shortcut icon" type="image/png" href="/images/favicon.png" />
        <meta name="description" content={DESCRIPTION} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
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
      <body className={`${manrope.variable} ${inter.variable} font-body antialiased bg-[#0a0e14] text-on-surface min-h-screen overflow-x-hidden selection:bg-primary/30`}>
        <NuqsAdapter>
          <div className="flex flex-col min-h-screen">
            <TopBar user={session?.user} />
            <main className="flex-1 pt-14 overflow-hidden relative">
              {children}
            </main>
          </div>
          <Toaster richColors />
        </NuqsAdapter>
      </body>
    </html>
  );
}
