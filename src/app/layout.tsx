import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Home, Trophy, Tv, Users, BarChart3, ArrowLeftRight, Brain, MessageCircle, Globe, Clapperboard, Repeat } from "lucide-react";
import { ThemeProvider, ThemeToggle } from './theme-provider';
import { LayoutAnimations } from './layout-animations';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PitchIQ — Live Football Intelligence",
  description: "Real-time scores, standings, top scorers & analytics across Europe's top 5 leagues.",
};

const navLinks = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/leagues/premier-league', label: 'Leagues', icon: Trophy },
  { href: '/matches', label: 'Matches', icon: Tv },
  { href: '/scorers', label: 'Scorers', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/h2h', label: 'H2H', icon: ArrowLeftRight },
  { href: '/trivia', label: 'Trivia', icon: Brain },
  { href: '/community', label: 'Community', icon: MessageCircle },
  { href: '/tournaments', label: 'Tournaments', icon: Globe },
  { href: '/studio', label: 'Studio', icon: Clapperboard },
  { href: '/transfers', label: 'Transfers', icon: Repeat },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col noise-bg" suppressHydrationWarning>
        <ThemeProvider>
        <LayoutAnimations />

        {/* === HEADER === */}
        <header className="sticky top-0 z-50 glass-strong border-b border-white/[0.06]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
                  <span className="text-white font-black text-sm">PIQ</span>
                </div>
                <span className="text-lg font-black tracking-tight text-white">Pitch<span className="text-orange-400">IQ</span></span>
                <span className="hidden sm:inline text-[10px] ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase border border-emerald-500/30">Live</span>
              </Link>

              <nav className="hidden lg:flex items-center gap-0.5">
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href}
                    className="nav-link flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-orange-400 transition-colors">
                    <link.icon size={14} /><span>{link.label}</span>
                  </Link>
                ))}
              </nav>

              <ThemeToggle />

              <div className="lg:hidden flex items-center gap-2">
                <Link href="/analytics" className="p-2 rounded-xl text-slate-400 hover:text-orange-400 hover:bg-white/5 transition-all"><BarChart3 size={18} /></Link>
                <Link href="/matches" className="p-2 rounded-xl text-slate-400 hover:text-orange-400 hover:bg-white/5 transition-all"><Tv size={18} /></Link>
              </div>
            </div>
          </div>
          <div className="divider-glow" />
        </header>

        {/* === MAIN === */}
        <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-6">{children}</main>

        {/* === FOOTER === */}
        <footer className="glass-strong border-t border-white/[0.06] py-8 mt-8">
          <div className="divider-glow mb-8" />
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <span className="text-white font-black text-[10px]">PIQ</span>
                </div>
                <span className="font-bold text-slate-300">PitchIQ</span>
              </div>
              <p className="text-xs text-slate-500">&copy; 2026 PitchIQ. Data from football-data.org</p>
            </div>
          </div>
        </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
