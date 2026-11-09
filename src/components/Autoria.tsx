import type { Obra } from '../data/tipos';

/** "por Nome @usuario" — ou só "por @usuario" quando não há nome de autoria. */
export function Autoria({ obra, className = '' }: { obra: Obra; className?: string }) {
  return (
    <p className={`text-label-sm text-tertiary-fixed-dim ${className}`}>
      por{' '}
      {obra.autora ? (
        <>
          {obra.autora} <span className="text-outline font-medium">@{obra.usuario}</span>
        </>
      ) : (
        <>@{obra.usuario}</>
      )}
    </p>
  );
}
