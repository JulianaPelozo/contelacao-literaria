import { Icone } from './Icone';

export function Carregando() {
  return (
    <div className="flex items-center justify-center py-space-xl text-primary" role="status">
      <Icone nome="progress_activity" className="text-[32px] animate-spin" />
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
