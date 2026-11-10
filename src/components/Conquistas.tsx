import { Link } from 'react-router-dom';
import { SEMANAS_PARA_TOTEM } from '../data/regrasFeedback';
import { useCiclo } from '../lib/ciclo';
import { calcularConquistas, useFeedbacksRecebidos, useMetas, useMeusFeedbacks, type FeedbackLinha } from '../lib/feedbacks';
import { normalizarUsuario } from '../lib/grade';
import { TODOS_OS_SELOS, seloDaObra } from '../lib/selos';
import { Alerta } from './Formulario';
import { Icone } from './Icone';
import { Selo, Totem } from './Medalhas';

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

/** Selos, totens, sequência e histórico de feedbacks da pessoa logada (página Minha conta). */
export function Conquistas({ usuario }: { usuario: string }) {
  const { ciclo } = useCiclo();
  const meus = useMeusFeedbacks();
  const metas = useMetas();
  const recebidos = useFeedbacksRecebidos({ autor: normalizarUsuario(usuario) || undefined });

  const feedbacks = meus.dados ?? [];
  const { totens, sequencia, rumoAoTotem, cumpridos } = calcularConquistas(metas.dados ?? []);
  const porSelo = new Map<string, number>();
  for (const f of feedbacks) {
    const id = seloDaObra(f.obra).id;
    porSelo.set(id, (porSelo.get(id) ?? 0) + 1);
  }
  const porCiclo = new Map<number, FeedbackLinha[]>();
  for (const f of feedbacks) porCiclo.set(f.ciclo, [...(porCiclo.get(f.ciclo) ?? []), f]);

  return (
    <>
      <section className="relative overflow-hidden card p-space-md sm:p-space-lg flex flex-col gap-space-md">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-primary-container/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-2">
          <Icone nome="military_tech" preenchido className="text-primary text-[24px]" />
          <h2 className="font-display text-headline-sm text-on-surface">Minhas conquistas</h2>
        </div>
        <Alerta tipo="erro">{meus.erro || metas.erro}</Alerta>

        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
          <div className="p-space-md rounded-xl bg-surface-container-lowest/70 flex items-center gap-space-md">
            <Totem tamanho={34} apagado={totens === 0} />
            <div>
              <p className="font-display text-headline-md text-on-surface leading-none">{totens}</p>
              <p className="text-label-sm text-on-surface-variant mt-1">{totens === 1 ? 'Totem' : 'Totens'}</p>
            </div>
          </div>
          <div className="p-space-md rounded-xl bg-surface-container-lowest/70">
            <p className="text-label-sm text-on-surface-variant">Rumo ao próximo totem</p>
            <div className="flex gap-1.5 mt-2" aria-label={`${rumoAoTotem} de ${SEMANAS_PARA_TOTEM} semanas`}>
              {Array.from({ length: SEMANAS_PARA_TOTEM }, (_, i) => (
                <Icone
                  key={i}
                  nome="star"
                  preenchido={i < rumoAoTotem}
                  className={`text-[24px] ${i < rumoAoTotem ? 'text-primary' : 'text-outline-variant'}`}
                />
              ))}
            </div>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {sequencia === 0
                ? `Cumpra a meta ${SEMANAS_PARA_TOTEM} semanas seguidas`
                : `${sequencia} ${sequencia === 1 ? 'semana seguida' : 'semanas seguidas'}`}
            </p>
          </div>
          <div className="p-space-md rounded-xl bg-surface-container-lowest/70 flex items-center gap-space-md">
            <Icone nome="workspace_premium" preenchido className="text-[36px] text-primary" />
            <div>
              <p className="font-display text-headline-md text-on-surface leading-none">{feedbacks.length}</p>
              <p className="text-label-sm text-on-surface-variant mt-1">
                {feedbacks.length === 1 ? 'Selo' : 'Selos'} • {cumpridos} {cumpridos === 1 ? 'meta cumprida' : 'metas cumpridas'}
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <p className="text-label-md text-on-surface-variant mb-space-sm">Coleção de selos</p>
          <ul className="grid grid-cols-4 sm:grid-cols-8 gap-space-sm">
            {TODOS_OS_SELOS.map((s) => {
              const n = porSelo.get(s.id) ?? 0;
              return (
                <li key={s.id} className="flex flex-col items-center gap-1 text-center" title={`${s.nome}: ${s.lema}`}>
                  <span className="relative">
                    <Selo selo={s} apagado={n === 0} />
                    {n > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-primary text-on-primary text-[11px] font-bold flex items-center justify-center">
                        {n}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] leading-tight font-semibold text-on-surface-variant">{s.nome.replace('Selo ', '')}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="card p-space-md sm:p-space-lg flex flex-col gap-space-md">
        <div className="flex items-center gap-2">
          <Icone nome="history_edu" className="text-primary text-[22px]" />
          <h2 className="font-display text-headline-sm text-on-surface">Meus feedbacks</h2>
        </div>
        {meus.carregando && !meus.dados && <p className="text-body-sm text-on-surface-variant">Carregando…</p>}
        {meus.dados?.length === 0 && (
          <p className="text-body-sm text-on-surface-variant">
            Nenhum feedback ainda. Vá até a{' '}
            <Link to="/grade" className="text-primary hover:underline">
              grade da semana
            </Link>{' '}
            e comece sua coleção de selos!
          </p>
        )}
        {[...porCiclo.entries()].map(([n, lista]) => (
          <div key={n} className="flex flex-col gap-2">
            <p className="text-label-sm uppercase tracking-widest text-on-surface-variant">Ciclo {n}</p>
            {lista.map((f) => (
              <ItemFeedback key={f.id} f={f} titulo={f.obra_titulo} subtitulo={`para @${f.autor_usuario} • ${data(f.criado_em)}`}
                editar={n === ciclo.numero} />
            ))}
          </div>
        ))}
      </section>

      {usuario && (
        <section className="card p-space-md sm:p-space-lg flex flex-col gap-space-md">
          <div className="flex items-center gap-2">
            <Icone nome="forum" className="text-primary text-[22px]" />
            <h2 className="font-display text-headline-sm text-on-surface">Feedbacks recebidos</h2>
            {recebidos.dados && recebidos.dados.length > 0 && (
              <span className="ml-auto text-label-md text-primary">{recebidos.dados.length}</span>
            )}
          </div>
          {recebidos.dados?.length === 0 && (
            <p className="text-body-sm text-on-surface-variant">Quando alguém comentar suas obras pela grade, os feedbacks aparecem aqui.</p>
          )}
          {recebidos.dados?.map((f) => (
            <ItemFeedback
              key={f.id}
              f={f}
              titulo={f.leitor_nome || `@${f.leitor_usuario}`}
              subtitulo={`${f.obra_titulo} • Ciclo ${f.ciclo} • ${data(f.criado_em)}`}
            />
          ))}
        </section>
      )}
    </>
  );
}

function ItemFeedback({ f, titulo, subtitulo, editar }: { f: FeedbackLinha; titulo: string; subtitulo: string; editar?: boolean }) {
  return (
    <details className="group/fb rounded-xl bg-surface-container-lowest/60 overflow-hidden">
      <summary className="flex items-center gap-space-sm p-2.5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <Selo selo={seloDaObra(f.obra)} tamanho="sm" />
        <span className="flex-1 min-w-0">
          <span className="block text-body-md text-on-surface font-semibold truncate">{titulo}</span>
          <span className="block text-label-sm font-medium text-on-surface-variant truncate">{subtitulo}</span>
        </span>
        <Icone nome="expand_more" className="text-on-surface-variant group-open/fb:rotate-180 transition-transform" />
      </summary>
      <div className="px-space-md pb-space-md flex flex-col gap-space-sm text-body-sm text-on-surface-variant">
        <TextoFeedback f={f} />
        {editar && (
          <Link to={`/feedback/${f.obra}`} className="btn-ghost w-fit py-1.5">
            <Icone nome="edit" className="text-[16px]" /> Editar
          </Link>
        )}
      </div>
    </details>
  );
}

/** As três partes da Fórmula 2+1. */
export function TextoFeedback({ f }: { f: Pick<FeedbackLinha, 'forte_1' | 'forte_2' | 'sugestao'> }) {
  return (
    <>
      {[
        ['star', 'Ponto forte', f.forte_1],
        ['star', 'Ponto forte', f.forte_2],
        ['lightbulb', 'Sugestão', f.sugestao],
      ].map(([icone, rotulo, texto], i) => (
        <div key={i}>
          <p className="flex items-center gap-1 text-label-sm uppercase tracking-wide text-primary">
            <Icone nome={icone} preenchido className="text-[14px]" /> {rotulo}
          </p>
          <p className="whitespace-pre-line mt-0.5 text-on-surface-variant">{texto}</p>
        </div>
      ))}
    </>
  );
}
