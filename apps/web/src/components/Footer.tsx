import { BrandMark } from '../icons/UiIcons';
import { useWordScrub } from '../hooks/useReveal';

const CLOSING =
  'Ogni numero di questa console arriva da un provider dichiarato, con la sua ora di aggiornamento. Niente stime mascherate da certezze.';

export function Footer() {
  const scope = useWordScrub<HTMLElement>();

  return (
    <footer ref={scope} className="relative mt-16 border-t border-line/60">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <p className="max-w-4xl text-balance text-[clamp(1.5rem,3vw,2.5rem)] font-medium leading-[1.25] tracking-[-0.025em]">
          {CLOSING.split(' ').map((word, index) => (
            <span data-word key={`${word}-${index}`} className="inline-block">
              {word}&nbsp;
            </span>
          ))}
        </p>

        <div className="mt-16 flex flex-col gap-10 border-t border-line/50 pt-10 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-3">
            <BrandMark size={34} />
            <div>
              <p className="text-sm font-semibold">Romagna Meteo Lab</p>
              <p className="text-[12px] text-faint">Console live della costa romagnola</p>
            </div>
          </div>

          <div className="grid gap-8 text-[13px] sm:grid-cols-3">
            <div>
              <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-faint">Dati</p>
              <ul className="flex flex-col gap-2 text-muted">
                <li>ECMWF IFS</li>
                <li>DWD ICON</li>
                <li>Météo-France</li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-faint">Fonti</p>
              <ul className="flex flex-col gap-2 text-muted">
                <li>Open-Meteo</li>
                <li>Open-Meteo Marine</li>
                <li>Copernicus C3S</li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-faint">Vai a</p>
              <ul className="flex flex-col gap-2 text-muted">
                <li>
                  <a href="#widget" className="transition-colors hover:text-cyan">
                    Widget per il tuo sito
                  </a>
                </li>
                <li>
                  <a href="#mappa" className="transition-colors hover:text-cyan">
                    Mappa animata
                  </a>
                </li>
                <li>
                  <a
                    href="http://www.hotelnizza.eu"
                    className="transition-colors hover:text-cyan"
                    rel="noreferrer noopener"
                  >
                    N! Creative Hotel
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-12 text-[11px] uppercase tracking-[0.16em] text-faint">
          Dati serviti dal layer API · provenance visibile nei payload
        </p>
      </div>
    </footer>
  );
}
