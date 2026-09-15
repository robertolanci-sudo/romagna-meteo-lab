import { useEffect, useState } from 'react';
import { BrandMark, PinIcon, RefreshIcon } from '../icons/UiIcons';
import { LOCATIONS } from '../lib/api';
import type { LocationSlug, Unit } from '../types';

const LINKS = [
  { id: 'adesso', label: 'Adesso' },
  { id: 'ore', label: 'Prossime ore' },
  { id: 'settimana', label: 'Settimana' },
  { id: 'mare', label: 'Mare' },
  { id: 'mappa', label: 'Mappa' },
  { id: 'modelli', label: 'Modelli' },
  { id: 'clima', label: 'Clima' },
  { id: 'widget', label: 'Widget' },
];

export function TopNav({
  slug,
  onSlug,
  unit,
  onUnit,
  onRefresh,
}: {
  slug: LocationSlug;
  onSlug: (slug: LocationSlug) => void;
  unit: Unit;
  onUnit: (unit: Unit) => void;
  onRefresh: () => void;
}) {
  const [active, setActive] = useState('adesso');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sections = LINKS.map((link) => document.getElementById(link.id)).filter(
      (node): node is HTMLElement => Boolean(node),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 md:pt-6">
      <div className="pointer-events-auto flex w-full max-w-[1400px] flex-col gap-3">
        <div className="flex items-center gap-3 rounded-full border border-line/80 bg-abyss/70 p-2 pl-4 shadow-[0_24px_60px_-30px_rgba(0,0,0,.95)] backdrop-blur-xl">
          <a href="#adesso" className="flex shrink-0 items-center gap-2.5">
            <BrandMark size={30} />
            <span className="hidden text-sm font-semibold tracking-[-0.01em] sm:block">
              Romagna Meteo Lab
            </span>
          </a>

          <nav aria-label="Sezioni" className="rail mx-1 hidden flex-1 overflow-x-auto lg:block">
            <ul className="flex items-center gap-1">
              {LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    aria-current={active === link.id ? 'true' : undefined}
                    className={`block whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] transition-colors duration-300 ${
                      active === link.id
                        ? 'bg-ink text-abyss font-medium'
                        : 'text-muted hover:bg-panel-2 hover:text-ink'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <label className="hidden items-center gap-2 rounded-full border border-line/70 bg-panel/70 px-3 py-1.5 sm:flex">
              <PinIcon size={16} className="text-cyan" />
              <span className="sr-only">Località</span>
              <select
                value={slug}
                onChange={(event) => onSlug(event.target.value as LocationSlug)}
                className="bg-transparent text-[13px] text-ink outline-none"
              >
                {LOCATIONS.map((location) => (
                  <option key={location.slug} value={location.slug} className="bg-panel">
                    {location.label}
                  </option>
                ))}
              </select>
            </label>

            <div
              role="group"
              aria-label="Unità temperatura"
              className="flex rounded-full border border-line/70 bg-panel/70 p-0.5"
            >
              {(['c', 'f'] as Unit[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onUnit(option)}
                  aria-pressed={unit === option}
                  className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors duration-300 ${
                    unit === option ? 'bg-ink text-abyss' : 'text-muted hover:text-ink'
                  }`}
                >
                  °{option.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onRefresh}
              aria-label="Aggiorna tutti i dati"
              className="grid h-9 w-9 place-items-center rounded-full border border-line/70 bg-panel/70 text-muted transition-colors duration-300 hover:border-cyan/60 hover:text-cyan"
            >
              <RefreshIcon size={17} />
            </button>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-label="Apri le sezioni"
              className="grid h-9 w-9 place-items-center rounded-full border border-line/70 bg-panel/70 text-muted lg:hidden"
            >
              <span className="flex flex-col gap-[3px]">
                <span className="block h-[1.5px] w-4 bg-current" />
                <span className="block h-[1.5px] w-4 bg-current" />
                <span className="block h-[1.5px] w-4 bg-current" />
              </span>
            </button>
          </div>
        </div>

        {open ? (
          <nav
            aria-label="Sezioni"
            className="rounded-3xl border border-line/80 bg-abyss/90 p-2 backdrop-blur-xl lg:hidden"
          >
            <ul className="grid grid-cols-2 gap-1">
              {LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-sm text-muted transition-colors hover:bg-panel-2 hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
