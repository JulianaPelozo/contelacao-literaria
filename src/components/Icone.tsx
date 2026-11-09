interface Props {
  nome: string;
  className?: string;
  preenchido?: boolean;
}

/** Ícone Material Symbols (mesma fonte usada no protótipo). */
export function Icone({ nome, className = '', preenchido }: Props) {
  return (
    <span aria-hidden="true" className={`icon ${preenchido ? 'icon-fill' : ''} ${className}`}>
      {nome}
    </span>
  );
}
