import type { ReactNode } from 'react';
import type { Obra } from '../data/tipos';

interface Props {
  obra: Obra;
  children: ReactNode;
  className?: string;
  /** Texto para leitores de tela. Padrão: "Ler <título> no Wattpad" */
  rotulo?: string;
}

/** Link que abre a obra direto no Wattpad, em nova aba. */
export function LinkWattpad({ obra, children, className = '', rotulo }: Props) {
  return (
    <a
      href={obra.wattpad}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={rotulo ?? `Ler ${obra.titulo} no Wattpad (abre em nova aba)`}
      className={className}
    >
      {children}
    </a>
  );
}

export function SeloWattpad({ className = '' }: { className?: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md flex items-center gap-1 shadow-md ${className}`}
    >
      <span className="w-2 h-2 rounded-full bg-wattpad" />
      <span className="text-label-sm text-on-surface tracking-tight">Wattpad</span>
    </span>
  );
}
