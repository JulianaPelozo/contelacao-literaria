import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Autoria } from '../components/Autoria';
import { Capa } from '../components/Capa';
import { Icone } from '../components/Icone';
import { LinkWattpad } from '../components/LinkWattpad';
import { obraPorId } from '../data/obras';
import { comoComprovar, regrasCiclo } from '../data/site';
import type { Leitura, Obra } from '../data/tipos';
import { useMeusFeedbacks } from '../lib/feedbacks';
import { autorDaLeitura, normalizarUsuario, situacaoNaGrade } from '../lib/grade';
import { formatarPrazo, progressoCiclo, tempoRestante, useAgora } from '../lib/tempo';
import { useAuth } from '../lib/auth';
import { useCiclo } from '../lib/ciclo';

const TODOS = 'Todos os grupos';

export function Grade() {
  const { ciclo: cicloAtual } = useCiclo();
  const { ehAdm, sessao, perfil } = useAuth();
  const agora = useAgora();
  const restante = tempoRestante(cicloAtual.prazo, agora);
  const decorrido = progressoCiclo(cicloAtual.inicio, cicloAtual.prazo, agora);
  const meus = useMeusFeedbacks();
  const enviados = new Set((meus.dados ?? []).filter((f) => f.ciclo === cicloAtual.numero).map((f) => f.obra));
  const situacao = situacaoNaGrade(cicloAtual, perfil?.usuario);
  const eu = normalizarUsuario(perfil?.usuario);
  const [grupo, setGrupo] = useState(TODOS);

  const grupos = cicloAtual.grupos.filter((g) => grupo === TODOS || g.nome === grupo);
  const metaTotal = situacao.alvos.length;
  const feitas = situacao.alvos.filter((a) => enviados.has(a.leitura.obra)).length;
  const pct = metaTotal ? Math.round((feitas / metaTotal) * 100) : 0;
  const cumpriu = metaTotal > 0 && feitas >= metaTotal;

  return (
    <div className="max-w-7xl mx-auto px-gutter-mobile lg:px-margin pt-space-md lg:pt-space-lg flex flex-col gap-space-lg">
      {/* Cabeçalho do ciclo */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-lowest p-space-md sm:p-space-lg shadow-xl">
        <div className="absolute -right-10 -top-10 w-40 h-40 lg:w-80 lg:h-80 bg-primary-container/20 rounded-full blur-2xl lg:blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end gap-space-md lg:gap-space-xl">
          <div className="flex-1 flex flex-col gap-space-sm">
            <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-highest/80 text-secondary text-label-sm">
              <Icone nome="stars" preenchido className="text-[14px] text-primary" /> Ciclo vigente
            </span>
            <h1 className="font-display text-headline-lg-mobile sm:text-headline-lg text-on-surface">
              Grade de Leitura • Ciclo {cicloAtual.numero}
            </h1>
            {ehAdm && (
              <Link to="/adm/grade" className="btn-ghost w-fit py-1.5">
                <Icone nome="edit_calendar" className="text-[17px]" /> Editar grade
              </Link>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-on-surface-variant">
              <span className="inline-flex items-center gap-1">
                <Icone nome="schedule" className="text-[16px] text-primary" />
                {restante.longo}
              </span>
              <span className="inline-flex items-center gap-1">
                <Icone nome="event_available" className="text-[16px] text-primary" />
                Encerra {formatarPrazo(cicloAtual.prazo)}
              </span>
            </div>
            <div className="w-full max-w-md h-1.5 rounded-full bg-surface-container-highest overflow-hidden" aria-hidden="true">
              <div className="h-full bg-primary/50 rounded-full" style={{ width: `${Math.round(decorrido * 100)}%` }} />
            </div>
          </div>

          {cicloAtual.grupos.length > 0 && (
            <div className="lg:w-80 flex-shrink-0 p-space-md rounded-xl bg-surface-container-lowest/70 backdrop-blur-md">
              {!sessao ? (
                <>
                  <p className="text-body-md text-on-surface font-semibold">Participa da grade?</p>
                  <p className="text-body-sm text-on-surface-variant mt-1">Entre para enviar seus feedbacks e ganhar selos.</p>
                  <Link to="/entrar" state={{ de: '/grade' }} className="btn-primary mt-space-sm w-full">
                    <Icone nome="login" className="text-[17px]" /> Entrar
                  </Link>
                </>
              ) : situacao.participa ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-label-sm text-on-surface-variant">Sua meta da semana</span>
                    <span className="text-label-md text-primary">{pct}%</span>
                  </div>
                  <p className="text-body-md text-on-surface font-semibold mt-1">
                    {cumpriu ? 'Meta cumprida! ✨' : `${feitas} de ${metaTotal} feedbacks enviados`}
                  </p>
                  <div
                    className="w-full h-2 mt-2 rounded-full bg-surface-container-highest overflow-hidden"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Progresso da meta"
                  >
                    <div className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <Link to="/conta" className="inline-flex items-center gap-1 text-label-sm text-primary hover:underline mt-2">
                    <Icone nome="military_tech" className="text-[15px]" /> Ver selos e totens
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-body-md text-on-surface font-semibold">Você não tem obra nesta grade</p>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    {perfil?.usuario
                      ? 'Mesmo assim, pode enviar feedbacks e colecionar selos.'
                      : 'Cadastre seu @ do Wattpad em Minha conta para o site reconhecer suas obras.'}
                  </p>
                  {!perfil?.usuario && (
                    <Link to="/conta" className="btn-ghost mt-space-sm w-full">Minha conta</Link>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {cicloAtual.grupos.length === 0 && (
        <div className="card p-space-xl text-center flex flex-col items-center gap-space-sm">
          <Icone nome="hourglass_empty" className="text-[44px] text-primary/60" />
          <h2 className="font-display text-headline-sm text-on-surface">Grade em preparação</h2>
          <p className="text-body-sm text-on-surface-variant max-w-md">
            As ADMs ainda estão montando os grupos deste ciclo. Enquanto isso, conheça as obras na vitrine.
          </p>
          <Link to="/" className="btn-ghost mt-1">
            <Icone nome="auto_stories" className="text-[18px]" /> Ver vitrine
          </Link>
        </div>
      )}

      {cicloAtual.grupos.length > 1 && (
        <div
          role="group"
          aria-label="Filtrar por grupo"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-gutter-mobile px-gutter-mobile lg:mx-0 lg:px-0"
        >
          {[TODOS, ...cicloAtual.grupos.map((g) => g.nome)].map((g) => (
            <button
              key={g}
              type="button"
              aria-pressed={grupo === g}
              onClick={() => setGrupo(g)}
              className={`chip ${grupo === g ? 'chip-on' : 'chip-off'}`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_340px] gap-space-lg lg:gap-space-xl items-start">
        <div className="flex flex-col gap-space-xl min-w-0">
          {grupos.map((g) => (
            <section key={g.nome} className="flex flex-col gap-space-md">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Icone nome="flare" className="text-primary text-[22px]" />
                    <h2 className="font-display text-headline-sm lg:text-headline-md text-on-surface">{g.nome}</h2>
                  </div>
                  {g.descricao && <p className="text-body-sm text-on-surface-variant mt-0.5">{g.descricao}</p>}
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-label-sm text-secondary-fixed-dim whitespace-nowrap">
                  {g.leituras.length} obras
                </span>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-md">
                {g.leituras.map((l) => {
                  const obra = obraPorId(l.obra);
                  if (!obra) return <ObraAusente key={l.obra} id={l.obra} />;
                  const estado: EstadoLeitura = !sessao
                    ? 'visitante'
                    : eu && autorDaLeitura(l) === eu
                      ? 'propria'
                      : enviados.has(l.obra)
                        ? 'enviado'
                        : 'pendente';
                  return (
                    <CardLeitura
                      key={l.obra}
                      obra={obra}
                      leitura={l}
                      estado={estado}
                      naMeta={situacao.alvos.some((a) => a.leitura.obra === l.obra)}
                      encerrado={restante.encerrado}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <aside className="flex flex-col gap-space-md lg:sticky lg:top-28">
          <div className="card p-space-md flex gap-3">
            <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center text-primary flex-shrink-0">
              <Icone nome="rate_review" preenchido className="text-[19px]" />
            </div>
            <div>
              <h3 className="text-label-md text-on-surface">Feedback & comprovação</h3>
              <p className="text-body-sm text-on-surface-variant mt-1">{comoComprovar}</p>
            </div>
          </div>

          <details className="card overflow-hidden group/acc" open>
            <summary className="flex items-center justify-between gap-2 p-space-md cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2 text-label-md text-on-surface">
                <Icone nome="gavel" className="text-primary text-[20px]" />
                Regulamento & prazos
              </span>
              <Icone nome="expand_more" className="text-on-surface-variant group-open/acc:rotate-180 transition-transform" />
            </summary>
            <ul className="px-space-md pb-space-md flex flex-col gap-space-md">
              {regrasCiclo.map((r) => (
                <li key={r.titulo} className="flex gap-3">
                  <Icone nome={r.icone} className="text-primary text-[18px] mt-0.5" />
                  <p className="text-body-sm text-on-surface-variant">
                    <strong className="text-on-surface font-semibold">{r.titulo}:</strong> {r.texto}
                  </p>
                </li>
              ))}
            </ul>
          </details>
          <Link to="/regras" className="btn-ghost">
            Ver todas as regras <Icone nome="arrow_forward" className="text-[16px]" />
          </Link>
        </aside>
      </div>
    </div>
  );
}

type EstadoLeitura = 'visitante' | 'propria' | 'enviado' | 'pendente';

const ETIQUETA: Record<EstadoLeitura, { texto: string; icone: string; cls: string }> = {
  visitante: { texto: 'Na grade', icone: 'flare', cls: 'bg-surface-container-high text-on-surface-variant' },
  propria: { texto: 'Sua obra', icone: 'edit_note', cls: 'bg-secondary-container/50 text-secondary-fixed-dim' },
  enviado: { texto: 'Feedback enviado', icone: 'check_circle', cls: 'bg-primary-container/20 text-primary' },
  pendente: { texto: 'Pendente', icone: 'radio_button_unchecked', cls: 'bg-surface-container-high text-on-surface-variant' },
};

function CardLeitura({
  obra,
  leitura,
  estado,
  naMeta,
  encerrado,
}: {
  obra: Obra;
  leitura: Leitura;
  estado: EstadoLeitura;
  naMeta: boolean;
  encerrado: boolean;
}) {
  const e = ETIQUETA[estado];
  const feito = estado === 'enviado';
  return (
    <article
      className={`group card p-space-sm sm:p-space-md flex gap-space-md transition-colors ${
        feito ? 'bg-surface-container-low/60' : 'hover:bg-surface-container'
      }`}
    >
      <LinkWattpad
        obra={obra}
        className="relative w-24 sm:w-28 aspect-[3/4] self-start rounded-lg overflow-hidden bg-surface-container-highest flex-shrink-0"
      >
        <Capa obra={obra} />
        <span className="absolute bottom-1.5 left-1.5 w-5 h-5 rounded-full bg-surface-container-lowest/90 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-wattpad" />
        </span>
      </LinkWattpad>

      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <span className="flex flex-wrap items-center gap-1">
          <span className={`inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full text-label-sm ${e.cls}`}>
            <Icone nome={e.icone} preenchido={feito} className="text-[13px]" />
            {estado === 'pendente' && !naMeta ? 'Extra' : e.texto}
          </span>
        </span>
        <h3 className="font-display text-[18px] leading-snug text-on-surface line-clamp-2">
          <Link to={`/obra/${obra.id}`} className="hover:text-primary transition-colors">
            {obra.titulo}
          </Link>
        </h3>
        <Autoria obra={obra} />
        <p className="text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
          <Icone nome="menu_book" className="text-[15px] text-primary" />
          Capítulos {leitura.capitulos}
        </p>

        <div className="mt-auto pt-2 flex flex-wrap gap-2">
          <LinkWattpad obra={obra} className={`${estado === 'pendente' ? 'btn-ghost' : 'btn-primary'} py-2 px-3`}>
            <Icone nome="open_in_new" className="text-[15px]" /> Ler no Wattpad
          </LinkWattpad>
          {estado === 'pendente' && !encerrado && (
            <Link to={`/feedback/${obra.id}`} className="btn-primary py-2 px-3">
              <Icone nome="rate_review" className="text-[15px]" /> Dar feedback
            </Link>
          )}
          {estado === 'enviado' && (
            <Link to={`/feedback/${obra.id}`} className="btn-ghost py-2 px-3 text-primary">
              <Icone nome={encerrado ? 'visibility' : 'edit'} className="text-[15px]" /> {encerrado ? 'Ver feedback' : 'Editar feedback'}
            </Link>
          )}
          {estado === 'visitante' && !encerrado && (
            <Link to="/entrar" state={{ de: `/feedback/${obra.id}` }} className="btn-ghost py-2 px-3">
              <Icone nome="login" className="text-[15px]" /> Entrar para dar feedback
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function ObraAusente({ id }: { id: string }) {
  return (
    <div className="card p-space-md text-body-sm text-error">
      Obra “{id}” não encontrada em <code>src/data/obras.ts</code>.
    </div>
  );
}
