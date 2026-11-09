import { Link } from 'react-router-dom';
import { regrasHonra } from '../data/site';
import { Icone } from './Icone';

/** Caixa lateral "Protocolo de Honra" (usada na vitrine). */
export function RegrasResumo({ className = '' }: { className?: string }) {
  return (
    <aside className={`card p-space-lg flex flex-col gap-space-md ${className}`}>
      <div>
        <span className="inline-flex items-center gap-1 text-label-sm uppercase tracking-wider text-primary">
          <Icone nome="verified" preenchido className="text-[15px]" /> Protocolo de Honra
        </span>
        <h3 className="font-display text-headline-sm text-on-surface mt-1">Regras das ADMs</h3>
        <p className="text-body-sm text-on-surface-variant mt-1">
          A Constelação é construída sobre trocas genuínas e respeitosas.
        </p>
      </div>
      <ol className="flex flex-col gap-space-md">
        {regrasHonra.slice(0, 3).map((r, i) => (
          <li key={r.titulo} className="flex gap-3">
            <span className="w-7 h-7 rounded-full bg-surface-container-highest text-primary text-label-md flex items-center justify-center flex-shrink-0">
              {i + 1}
            </span>
            <div>
              <p className="text-label-md text-on-surface">{r.titulo}</p>
              <p className="text-body-sm text-on-surface-variant mt-0.5">{r.texto}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link to="/regras" className="btn-ghost w-full">
        Ler todas as regras <Icone nome="arrow_forward" className="text-[16px]" />
      </Link>
    </aside>
  );
}
