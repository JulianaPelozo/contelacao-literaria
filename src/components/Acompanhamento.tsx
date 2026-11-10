import { useEffect, useState } from 'react';
import { useCiclo } from '../lib/ciclo';
import { supabase, traduzirErro } from '../lib/supabase';
import { Alerta } from './Formulario';
import { Icone } from './Icone';

interface Linha {
  usuario: string;
  nome: string;
  tem_conta: boolean;
  meta: number;
  feitos: number;
}

/** Painel ADM: quem já cumpriu a meta do ciclo vigente. */
export function Acompanhamento() {
  const { ciclo } = useCiclo();
  const [linhas, setLinhas] = useState<Linha[] | null>(null);
  const [erro, setErro] = useState('');
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    if (!supabase || ciclo.grupos.length === 0) return;
    let vivo = true;
    supabase.rpc('relatorio_ciclo', { n: ciclo.numero }).then(({ data, error }) => {
      if (!vivo) return;
      if (error) setErro(traduzirErro(error));
      else {
        setErro('');
        setLinhas(data as Linha[]);
      }
    });
    return () => {
      vivo = false;
    };
  }, [ciclo.numero, ciclo.grupos.length, versao]);

  const cumpriram = (linhas ?? []).filter((l) => l.meta > 0 && l.feitos >= l.meta).length;

  return (
    <section className="flex flex-col gap-space-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icone nome="monitoring" className="text-primary text-[22px]" />
          <h2 className="font-display text-headline-sm lg:text-headline-md text-on-surface">Acompanhamento • Ciclo {ciclo.numero}</h2>
        </div>
        <button
          type="button"
          onClick={() => setVersao((v) => v + 1)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
          aria-label="Atualizar acompanhamento"
        >
          <Icone nome="refresh" className="text-[20px]" />
        </button>
      </div>
      <Alerta tipo="erro">{erro}</Alerta>
      {ciclo.grupos.length === 0 ? (
        <p className="card p-space-md text-body-sm text-on-surface-variant">Nenhuma grade publicada no momento.</p>
      ) : !linhas ? (
        <p className="card p-space-md text-body-sm text-on-surface-variant">Carregando…</p>
      ) : (
        <div className="card overflow-hidden">
          <p className="px-space-md pt-space-md text-body-sm text-on-surface-variant">
            <strong className="text-on-surface">{cumpriram}</strong> de {linhas.length} participantes já cumpriram a meta.
          </p>
          <ul className="divide-y divide-outline-variant/30 mt-space-sm">
            {linhas.map((l) => {
              const ok = l.meta > 0 && l.feitos >= l.meta;
              const pct = l.meta ? Math.round((l.feitos / l.meta) * 100) : 0;
              return (
                <li key={l.usuario} className="flex items-center gap-space-md px-space-md py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-body-md text-on-surface font-semibold truncate">{l.nome || `@${l.usuario}`}</p>
                    <p className="text-label-sm font-medium text-on-surface-variant truncate">
                      @{l.usuario}
                      {!l.tem_conta && <span className="text-error"> • sem conta no site</span>}
                    </p>
                  </div>
                  <div className="w-24 sm:w-40 h-1.5 rounded-full bg-surface-container-highest overflow-hidden" aria-hidden="true">
                    <div className={`h-full rounded-full ${ok ? 'bg-primary' : 'bg-primary/50'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`w-14 text-right text-label-md ${ok ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {ok ? <Icone nome="check_circle" preenchido className="text-[18px] align-middle" /> : `${l.feitos}/${l.meta}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
