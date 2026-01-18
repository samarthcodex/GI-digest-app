import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GI Daily',
  description: 'Daily gastroenterology literature digest'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">GI Daily</p>
                <h1 className="text-2xl font-semibold text-slate-900">GI Daily Digest</h1>
              </div>
              <nav className="flex items-center gap-3 text-sm text-slate-600">
                <a href="/" className="hover:text-slate-900">Today&apos;s Papers</a>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
