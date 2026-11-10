import { useEffect, useRef, useState } from 'react';
import { TEMAS, useTema } from '../lib/tema';
import { Icone } from './Icone';

/** Botão de paleta no cabeçalho que abre a lista de temas. */
export function SeletorTema() {
  const { tema, setTema } = useTema();
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false);
    document.addEventListener('pointerdown', fora);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', fora);
      document.removeEventListener('keydown', esc);
    };
  }, [aberto]);

  return (
    <div ref={raiz} className="relative">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-haspopup="true"
        aria-expanded={aberto}
        aria-label="Escolher tema"
        title="Tema"
        className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high/60 transition-colors"
      >
        <Icone nome="palette" className="text-[22px]" />
      </button>

      {aberto && (
        <div
          role="menu"
          aria-label="Temas"
          className="absolute right-0 top-12 w-72 max-w-[calc(100vw-2rem)] p-space-sm rounded-2xl bg-surface-container-low ring-1 ring-outline-variant/40 shadow-2xl z-50"
        >
          <p className="px-space-sm pt-space-xs pb-space-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
            Tema
          </p>
          {TEMAS.map((t) => {
            const ativo = t.id === tema;
            return (
              <button
                key={t.id}
                type="button"
                role="menuitemradio"
                aria-checked={ativo}
                onClick={() => {
                  setTema(t.id);
                  setAberto(false);
                }}
                className={`w-full flex items-center gap-space-sm p-space-sm rounded-xl text-left transition-colors ${
                  ativo ? 'bg-primary-container/20' : 'hover:bg-surface-container-high'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="w-9 h-9 rounded-full flex-shrink-0 ring-1 ring-outline-variant/60 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${t.cores[0]} 50%, ${t.cores[2]} 50%)` }}
                >
                  <Icone nome={t.icone} preenchido className="text-[16px]" style={{ color: t.cores[1] }} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className={`block text-label-md ${ativo ? 'text-primary' : 'text-on-surface'}`}>{t.nome}</span>
                  <span className="block text-body-sm text-on-surface-variant truncate">{t.descricao}</span>
                </span>
                {ativo && <Icone nome="check" className="text-primary text-[20px]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
