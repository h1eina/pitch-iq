'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Zap, Trophy, Users, Gamepad2, Tv, MessageCircle, Globe, Star, ArrowLeftRight, Brain, Crosshair } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Zap },
  { href: '/leagues/premier-league', label: 'Leagues', icon: Trophy },
  { href: '/players', label: 'Players', icon: Users },
  { href: '/fantasy', label: 'Fantasy', icon: Star },
  { href: '/simulator', label: 'Simulator', icon: Crosshair },
  { href: '/predictions', label: 'Predictions', icon: Brain },
  { href: '/transfers', label: 'Transfers', icon: ArrowLeftRight },
  { href: '/tournaments', label: 'Tournaments', icon: Globe },
  { href: '/trivia', label: 'Trivia', icon: Gamepad2 },
  { href: '/community', label: 'Community', icon: MessageCircle },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">⚽</span>
            <span className="text-xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              PitchIQ
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all">
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-red-500/20 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-red-400 font-semibold">LIVE</span>
            </div>
            <button onClick={() => setOpen(!open)} className="md:hidden text-gray-300">
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-700 bg-gray-900/95 backdrop-blur">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white">
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
