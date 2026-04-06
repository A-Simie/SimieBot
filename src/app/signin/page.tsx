import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth0 } from '@/lib/auth0';

const signInOptions = [
  {
    label: 'Continue with Google',
    icon: 'account_circle',
    href: '/auth/login?connection=google-oauth2',
  },
  {
    label: 'Continue with GitHub',
    icon: 'terminal',
    href: '/auth/login?connection=github',
  },
  {
    label: 'Continue with Slack',
    icon: 'forum',
    href: '/auth/login?connection=sign-in-with-slack',
  },
];

export default async function SignInPage() {
  const session = await auth0.getSession();

  if (session) {
    redirect('/comm');
  }

  return (
    <main className="relative flex min-h-[calc(100dvh-3.5rem)] items-center justify-center overflow-hidden bg-[#f9f9f9] px-6 py-12 text-[#1a1c1c]">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-[#0058bc]/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-[#0070eb]/5 blur-[120px]" />
      </div>

      <div className="flex w-full max-w-md flex-col items-center space-y-12">
        <header className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#0058bc] to-[#0070eb] shadow-[0_18px_40px_rgba(0,88,188,0.14)]">
            <span className="material-symbols-outlined text-3xl text-white">smart_toy</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#1a1c1c]">SimieBot</h1>
          <p className="font-medium tracking-tight text-[#414755]">Secure connected-account workspace</p>
        </header>

        <section className="w-full space-y-8">
          <div className="space-y-6 rounded-[1rem] border border-[#c1c6d7]/20 bg-white p-8 shadow-[0_20px_40px_rgba(0,88,188,0.04)]">
            <div className="space-y-3">
              {signInOptions.map((option) => (
                <Link
                  key={option.label}
                  href={option.href}
                  className="flex w-full items-center justify-center space-x-3 rounded-xl bg-[#f3f3f3] px-6 py-3.5 font-medium tracking-tight text-[#414755] transition-all hover:bg-[#e8e8e8] active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-xl">{option.icon}</span>
                  <span>{option.label}</span>
                </Link>
              ))}
            </div>

            <div className="pt-4">
              <p className="text-center text-sm font-medium leading-relaxed text-[#414755]">
                Your first sign-in creates your account. You can connect additional accounts later inside the app.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-2 rounded-lg bg-[#667685]/10 px-4 py-2">
              <span className="material-symbols-outlined text-lg text-[#4e5e6c]">verified_user</span>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#4e5e6c]">High trust verified</span>
            </div>
            <p className="text-center text-sm font-medium tracking-tight text-[#717786]">
              Secure, encrypted connection to your approved services through Auth0.
            </p>
          </div>
        </section>

        <footer className="flex w-full max-w-xs items-center justify-between pt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#717786]">
          <Link className="transition-colors hover:text-[#0058bc]" href="/">
            Home
          </Link>
          <span className="h-1 w-1 rounded-full bg-[#c1c6d7]" />
          <Link className="transition-colors hover:text-[#0058bc]" href="/#approval-model">
            Security
          </Link>
          <span className="h-1 w-1 rounded-full bg-[#c1c6d7]" />
          <Link className="transition-colors hover:text-[#0058bc]" href="/#how-it-works">
            How it works
          </Link>
        </footer>
      </div>
    </main>
  );
}
