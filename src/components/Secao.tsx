import type { ReactNode } from 'react';
import { Icone } from './Icone';

interface Props {
  icone: string;
  titulo: string;
  subtitulo?: string;
  acao?: ReactNode;
  children: ReactNode;
  className?: string;
  corIcone?: string;
}

export function Secao({ icone, titulo, subtitulo, acao, children, className = '', corIcone = 'text-primary' }: Props) {
  return (
    <section className={`flex flex-col gap-space-md ${className}`}>
      <div className="flex items-end justify-between gap-space-sm">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icone nome={icone} preenchido className={`${corIcone} text-[22px]`} />
            <h2 className="font-display text-headline-sm lg:text-headline-md text-on-surface">{titulo}</h2>
          </div>
          {subtitulo && <p className="text-body-sm text-on-surface-variant mt-0.5">{subtitulo}</p>}
        </div>
        {acao}
      </div>
      {children}
    </section>
  );
}
