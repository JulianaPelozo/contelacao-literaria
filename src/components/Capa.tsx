import { useState } from 'react';
import { autoria } from '../data/obras';
import type { Obra } from '../data/tipos';

const PALETAS = [
  ['#5d03ca', '#1c192e', '#cebdff'],
  ['#4f319c', '#0e0b20', '#e8ddff'],
  ['#674bb5', '#201d32', '#d3bbff'],
  ['#3c1989', '#141125', '#c7aaff'],
  ['#7a3fa0', '#1b1735', '#ebddff'],
  ['#2f2a6b', '#0e0b20', '#c8c2e9'],
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface Props {
  obra: Obra;
  className?: string;
  /** Aplica um leve zoom quando o card pai (classe `group`) recebe hover */
  zoom?: boolean;
}

/**
 * Capa da obra. Usa `obra.capa` quando existir; senão (ou se a imagem falhar)
 * desenha uma capa ilustrada com o título, nas cores do tema.
 */
export function Capa({ obra, className = '', zoom = true }: Props) {
  const [falhou, setFalhou] = useState(false);
  const zoomCls = zoom ? 'group-hover:scale-105 transition-transform duration-500' : '';

  if (obra.capa && !falhou) {
    return (
      <img
        src={obra.capa}
        alt={`Capa de ${obra.titulo}`}
        loading="lazy"
        onError={() => setFalhou(true)}
        className={`w-full h-full object-cover ${zoomCls} ${className}`}
      />
    );
  }

  const h = hash(obra.id);
  const [a, b, c] = PALETAS[h % PALETAS.length];
  const ang = 120 + (h % 120);
  const estrelas = Array.from({ length: 14 }, (_, i) => {
    const x = (h * (i + 3) * 37) % 100;
    const y = (h * (i + 7) * 53) % 100;
    const r = ((h >> i) % 3) * 0.4 + 0.5;
    return { x, y, r };
  });

  return (
    <div
      role="img"
      aria-label={`Capa de ${obra.titulo}`}
      className={`relative w-full h-full overflow-hidden ${zoomCls} ${className}`}
      style={{
        background: `radial-gradient(circle at ${20 + (h % 60)}% ${15 + (h % 30)}%, ${a}cc 0%, transparent 55%), linear-gradient(${ang}deg, ${b}, ${a} 140%)`,
        containerType: 'inline-size',
      }}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {estrelas.map((e, i) => (
          <circle key={i} cx={e.x} cy={e.y} r={e.r * 0.5} fill={c} opacity={0.35 + (i % 4) * 0.15} />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-[8cqw] gap-[3cqw]">
        <span className="icon icon-fill" style={{ color: c, fontSize: '12cqw', opacity: 0.8 }}>
          auto_awesome
        </span>
        <span className="font-display font-semibold leading-tight" style={{ color: c, fontSize: '11cqw' }}>
          {obra.titulo}
        </span>
        <span className="font-sans uppercase tracking-widest" style={{ color: c, fontSize: '5.5cqw', opacity: 0.75 }}>
          {autoria(obra)}
        </span>
      </div>
    </div>
  );
}
