'use client';
import { useEffect } from 'react';
import { useThemeStore, type ThemeMode } from '@/lib/theme-store';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const resolve = useThemeStore(s => s.resolve);

  useEffect(() => {
    resolve();
    // Re-check auto theme every minute
    const interval = setInterval(resolve, 60_000);
    return () => clearInterval(interval);
  }, [resolve]);

  return <>{children}</>;
}

export function ThemeToggle() {
  const { mode, setMode } = useThemeStore();

  const modes: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'auto', icon: Monitor, label: 'Auto' },
  ];

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-xl bg-white/5 border border-white/[0.08] dark:bg-white/5 dark:border-white/[0.08]">
      {modes.map(m => {
        const Icon = m.icon;
        const active = mode === m.value;
        return (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
              active
                ? 'bg-gradient-to-r from-orange-500/20 to-emerald-500/20 text-orange-400 shadow-sm border border-orange-500/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title={m.label}
          >
            <Icon size={13} />
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
