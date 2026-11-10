import type React from 'react';

interface Props {
  nome: string;
  className?: string;
  preenchido?: boolean;
  style?: React.CSSProperties;
}

/** Ícone Material Symbols (mesma fonte usada no protótipo). */
export function Icone({ nome, className = '', preenchido, style }: Props) {
  return (
    <span aria-hidden="true" className={`icon ${preenchido ? 'icon-fill' : ''} ${className}`} style={style}>
      {nome}
    </span>
  );
}
