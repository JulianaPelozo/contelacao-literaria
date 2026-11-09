import type { Obra } from '../data/tipos';

export function Tags({ obra, extra }: { obra: Obra; extra?: string }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {obra.generos.map((g) => (
        <span key={g} className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary text-label-sm">
          {g}
        </span>
      ))}
      {obra.classificacao && (
        <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-secondary-fixed-dim text-label-sm">
          {obra.classificacao}
        </span>
      )}
      {extra && (
        <span className="px-2 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container text-label-sm">
          {extra}
        </span>
      )}
    </div>
  );
}
