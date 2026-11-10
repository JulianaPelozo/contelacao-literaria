import type { TipoSelo } from '../lib/selos';
import { Icone } from './Icone';

const TAMANHOS = { sm: ['w-9 h-9', 'text-[18px]'], md: ['w-14 h-14', 'text-[26px]'], lg: ['w-24 h-24', 'text-[44px]'] } as const;

/** Medalha redonda de um selo. `apagado` = ainda não conquistado. */
export function Selo({ selo, tamanho = 'md', apagado }: { selo: TipoSelo; tamanho?: keyof typeof TAMANHOS; apagado?: boolean }) {
  const [caixa, icone] = TAMANHOS[tamanho];
  return (
    <span
      role="img"
      aria-label={selo.nome}
      title={selo.nome}
      className={`relative inline-flex items-center justify-center rounded-full flex-shrink-0 ${caixa} ${
        apagado ? 'opacity-30 grayscale' : 'shadow-[0_0_18px_rgb(var(--c-primary)/calc(0.35*var(--fx)))]'
      }`}
      style={{ background: `radial-gradient(circle at 30% 25%, ${selo.cores[0]}, ${selo.cores[1]} 75%)` }}
    >
      <span className="absolute inset-[3px] rounded-full ring-1 ring-white/40" />
      <Icone nome={selo.icone} preenchido className={`${icone} text-white drop-shadow`} />
    </span>
  );
}

/** Totem: conquistado a cada 4 semanas seguidas com a meta cumprida. */
export function Totem({ tamanho = 64, apagado }: { tamanho?: number; apagado?: boolean }) {
  return (
    <svg
      width={tamanho}
      height={tamanho * 1.4}
      viewBox="0 0 50 70"
      role="img"
      aria-label="Totem da Constelação"
      className={apagado ? 'opacity-25 grayscale' : 'drop-shadow-[0_0_12px_rgba(243,207,134,0.45)]'}
    >
      <defs>
        <linearGradient id="totem-ouro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe7a8" />
          <stop offset="1" stopColor="#b5832a" />
        </linearGradient>
        <linearGradient id="totem-violeta" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#cebdff" />
          <stop offset="1" stopColor="#5d03ca" />
        </linearGradient>
      </defs>
      {/* estrela do topo */}
      <path d="M25 1 L28.5 9 L37 10 L30.5 15.5 L32.5 24 L25 19.5 L17.5 24 L19.5 15.5 L13 10 L21.5 9 Z" fill="url(#totem-ouro)" />
      {/* três blocos esculpidos */}
      <rect x="13" y="25" width="24" height="13" rx="3" fill="url(#totem-violeta)" />
      <circle cx="20" cy="31.5" r="2" fill="#ffe7a8" />
      <circle cx="30" cy="31.5" r="2" fill="#ffe7a8" />
      <rect x="10" y="39" width="30" height="7" rx="3.5" fill="url(#totem-ouro)" />
      <rect x="13" y="47" width="24" height="13" rx="3" fill="url(#totem-violeta)" />
      <path d="M19 53.5 h12" stroke="#ffe7a8" strokeWidth="2" strokeLinecap="round" />
      <rect x="9" y="61" width="32" height="7" rx="2" fill="url(#totem-ouro)" />
    </svg>
  );
}
