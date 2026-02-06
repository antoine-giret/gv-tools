import { useTheme } from 'next-themes';

export function Legend() {
  const { theme } = useTheme();

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <div style={{ width: 'calc((100% - 27 * 4px) / 28)' }}>
          <div
            className="aspect-square rounded-sm"
            style={{
              background:
                theme === 'light'
                  ? 'linear-gradient(to top left, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3) 50%, var(--color-emerald-300) 50%, var(--color-emerald-300) 100%)'
                  : 'linear-gradient(to top left, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7) 50%, var(--color-emerald-300) 50%, var(--color-emerald-300) 100%)',
            }}
          />
        </div>
        <span className="text-sm text-black dark:text-white">Jour avec activité</span>
      </div>
      <div className="flex items-center gap-3">
        <div style={{ width: 'calc((100% - 27 * 4px) / 28)' }}>
          <div className="aspect-square rounded-sm border-1 border-black/30 dark:border-white/70" />
        </div>
        <span className="text-sm text-black dark:text-white">Jour sans activité</span>
      </div>
    </div>
  );
}
