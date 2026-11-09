import type { ReactNode } from 'react';
import { cicloAtual } from '../data/ciclo';
import { obras } from '../data/obras';
import { frase } from '../data/site';
import { supabaseConfigurado } from '../lib/supabase';
import { Alerta } from './Formulario';
import { Icone } from './Icone';

/** Layout das telas de login/cadastro: apresentação à esquerda (desktop) e cartão do formulário. */
export function MolduraAcesso({ children, titulo, subtitulo }: { children: ReactNode; titulo: string; subtitulo?: string }) {
  const leituras = cicloAtual.grupos.reduce((n, g) => n + g.leituras.length, 0);
  return (
    <div className="relative max-w-7xl mx-auto px-gutter-mobile lg:px-margin pt-space-md lg:pt-space-xl">
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-secondary-container/25 blur-[100px] pointer-events-none" />
      <div className="relative grid lg:grid-cols-[1fr_480px] gap-space-xl items-center">
        <section className="hidden lg:flex flex-col gap-space-lg">
          <span className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high/70 text-secondary text-label-sm">
            <Icone nome="stars" preenchido className="text-[15px] text-primary" /> Portal da Aliança Wattpad
          </span>
          <h1 className="font-display text-headline-xl text-on-surface max-w-xl">
            Escrever é acender faróis no <span className="italic text-primary">infinito.</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-lg">
            Conecte sua narrativa a uma constelação de autores independentes: ciclos colaborativos, leitura crítica
            recíproca e visibilidade autêntica no Wattpad.
          </p>
          <div className="grid grid-cols-3 gap-space-sm max-w-lg">
            {[
              { n: obras.length, r: 'Obras no projeto', i: 'auto_stories' },
              { n: cicloAtual.numero, r: 'Ciclo atual', i: 'flare' },
              { n: leituras, r: 'Leituras na grade', i: 'menu_book' },
            ].map((m) => (
              <div key={m.r} className="p-space-md rounded-xl bg-surface-container/70 backdrop-blur-md">
                <Icone nome={m.i} className="text-primary text-[20px]" />
                <p className="font-display text-headline-md text-on-surface mt-1">{m.n}</p>
                <p className="text-label-sm text-on-surface-variant">{m.r}</p>
              </div>
            ))}
          </div>
          <p className="font-display italic text-primary/60">{frase}</p>
        </section>

        <section className="card p-space-md sm:p-space-lg lg:p-space-xl w-full max-w-lg mx-auto lg:max-w-none bg-surface-container-low/90 backdrop-blur-xl">
          <div className="mb-space-lg">
            <span className="text-label-sm uppercase tracking-widest text-primary/80">Identificação Cósmica</span>
            <h2 className="font-display text-headline-lg-mobile sm:text-headline-lg text-on-surface mt-1">{titulo}</h2>
            {subtitulo && <p className="text-body-sm text-on-surface-variant mt-1">{subtitulo}</p>}
          </div>
          {!supabaseConfigurado && (
            <div className="mb-space-md">
              <Alerta tipo="erro">
                O login ainda não está configurado neste site. Preencha <code>VITE_SUPABASE_URL</code> e{' '}
                <code>VITE_SUPABASE_ANON_KEY</code> (veja o README).
              </Alerta>
            </div>
          )}
          {children}
        </section>
      </div>
    </div>
  );
}
