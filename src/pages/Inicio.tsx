import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icone } from '../components/Icone';
import { ObraCard, ObraLinha } from '../components/ObraCard';
import { RegrasResumo } from '../components/RegrasResumo';
import { Secao } from '../components/Secao';
import { generos, obras } from '../data/obras';
import { dicaDaSemana, frase } from '../data/site';
import type { Obra } from '../data/tipos';
import { formatarPrazo, progressoCiclo, tempoRestante, useAgora } from '../lib/tempo';
import { useCiclo } from '../lib/ciclo';

const TODOS = 'Todos';

const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function combina(o: Obra, busca: string, genero: string) {
  if (genero !== TODOS && !o.generos.includes(genero)) return false;
  if (!busca) return true;
  const alvo = normalizar([o.titulo, o.autora ?? '', o.usuario, ...o.generos, o.sinopse].join(' '));
  return normalizar(busca)
    .split(/\s+/)
    .every((p) => alvo.includes(p.replace(/^@/, '')));
}

export function Inicio() {
  const [busca, setBusca] = useState('');
  const [genero, setGenero] = useState(TODOS);
  const filtrando = busca.trim() !== '' || genero !== TODOS;

  const resultado = useMemo(() => obras.filter((o) => combina(o, busca.trim(), genero)), [busca, genero]);
  const destaques = obras.filter((o) => o.destaque);
  const novas = obras.filter((o) => o.nova);

  return (
    <div className="max-w-7xl mx-auto px-gutter-mobile lg:px-margin pt-space-md lg:pt-space-lg flex flex-col gap-space-lg lg:gap-space-xl">
      <Hero />

      {/* Busca e filtros */}
      <div className="flex flex-col gap-space-sm lg:flex-row lg:items-center lg:gap-space-md lg:bg-surface-container/60 lg:p-space-sm lg:rounded-xl">
        <label className="relative w-full lg:max-w-md flex items-center">
          <span className="sr-only">Buscar obras</span>
          <Icone nome="search" className="absolute left-3.5 text-primary text-[20px] pointer-events-none" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, autora ou @usuário..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/70 text-body-sm focus:outline-none focus:ring-1 focus:ring-primary-container focus:bg-surface-container shadow-inner"
          />
        </label>
        <div
          role="group"
          aria-label="Filtrar por gênero"
          className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar -mx-gutter-mobile px-gutter-mobile lg:mx-0 lg:px-0 lg:flex-wrap"
        >
          {[TODOS, ...generos].map((g) => (
            <button
              key={g}
              type="button"
              aria-pressed={genero === g}
              onClick={() => setGenero(g)}
              className={`chip ${genero === g ? 'chip-on' : 'chip-off'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {filtrando ? (
        <Secao
          icone="search"
          titulo="Resultados"
          subtitulo={`${resultado.length} ${resultado.length === 1 ? 'obra encontrada' : 'obras encontradas'}`}
          acao={
            <button
              type="button"
              onClick={() => {
                setBusca('');
                setGenero(TODOS);
              }}
              className="text-label-sm text-primary hover:underline"
            >
              Limpar
            </button>
          }
        >
          {resultado.length ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-md">
              {resultado.map((o) => (
                <ObraCard key={o.id} obra={o} />
              ))}
            </div>
          ) : (
            <div className="card p-space-xl text-center text-on-surface-variant">
              <Icone nome="travel_explore" className="text-[40px] text-primary/60" />
              <p className="mt-2">Nenhuma obra encontrada nessa constelação.</p>
            </div>
          )}
        </Secao>
      ) : (
        <>
            {destaques.length > 0 && (
            <Secao
              icone="workspace_premium"
              titulo="Constelações em Destaque"
              subtitulo="Toque na capa para ler direto no Wattpad"
              acao={
                <Link to="/grade" className="text-label-sm text-primary hover:underline whitespace-nowrap">
                  Ver grade
                </Link>
              }
            >
              <div className="flex gap-space-md overflow-x-auto pb-3 pt-1 no-scrollbar -mx-gutter-mobile px-gutter-mobile snap-x snap-mandatory sm:mx-0 sm:px-0 sm:overflow-visible sm:grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {destaques.map((o) => (
                  <ObraCard key={o.id} obra={o} className="snap-start flex-shrink-0 w-72 sm:w-auto" />
                ))}
              </div>
            </Secao>
          )}

        <div className="grid xl:grid-cols-[1fr_320px] gap-space-lg lg:gap-space-xl items-start">
          <div className="flex flex-col gap-space-lg lg:gap-space-xl min-w-0">
            {novas.length > 0 && (
              <Secao icone="new_releases" corIcone="text-secondary-fixed-dim" titulo="Recém-Chegadas ao Projeto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {novas.map((o) => (
                    <ObraLinha key={o.id} obra={o} />
                  ))}
                </div>
              </Secao>
            )}

            <Secao icone="auto_stories" titulo="Todas as Obras" subtitulo={`${obras.length} obras no projeto`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {obras
                  .filter((o) => !o.destaque && !o.nova)
                  .map((o) => (
                    <ObraLinha key={o.id} obra={o} />
                  ))}
              </div>
            </Secao>
          </div>

          <div className="flex flex-col gap-space-lg xl:sticky xl:top-28">
            <RegrasResumo />
          </div>
        </div>
        </>
      )}

      <div className="pt-2 pb-2 lg:pb-0 text-center flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-primary/40">
          <span className="w-8 h-px bg-primary/20" />
          <Icone nome="flare" className="text-[16px]" />
          <span className="w-8 h-px bg-primary/20" />
        </div>
        <p className="font-display italic text-[16px] text-primary/70">{frase}</p>
        <span className="text-label-sm text-on-surface-variant/60">Comunidade Constelação Literária</span>
      </div>
    </div>
  );
}

function Hero() {
  const { ciclo: cicloAtual } = useCiclo();
  const agora = useAgora();
  const restante = tempoRestante(cicloAtual.prazo, agora);
  const progresso = progressoCiclo(cicloAtual.inicio, cicloAtual.prazo, agora);
  const totalLeituras = cicloAtual.grupos.reduce((n, g) => n + g.leituras.length, 0);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-lowest p-space-md sm:p-space-lg shadow-xl">
      <div className="absolute -right-8 -top-8 w-40 h-40 lg:w-96 lg:h-96 bg-primary-container/20 rounded-full blur-2xl lg:blur-[120px] pointer-events-none" />
      <div className="absolute right-12 bottom-2 w-16 h-16 lg:w-64 lg:h-64 bg-secondary-container/30 rounded-full blur-xl lg:blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row gap-space-lg lg:items-stretch">
        <div className="flex-1 flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-highest/80 text-secondary text-label-sm">
              <Icone nome="stars" preenchido className="text-[14px] text-primary" />
              Ciclo {cicloAtual.numero} {restante.encerrado ? 'encerrado' : 'em andamento'}
            </span>
            <Icone nome="flare" className="text-primary/70 text-[20px] animate-pulse lg:hidden" />
          </div>
          <h1 className="font-display text-headline-lg-mobile sm:text-headline-lg lg:text-headline-xl text-on-surface tracking-tight">
            Boas-vindas à Constelação <span className="text-primary italic">✦</span>
          </h1>
          <p className="text-body-sm sm:text-body-md text-on-surface-variant max-w-xl">
            Autoras e autores independentes do Wattpad lendo e comentando as obras uns dos outros, em ciclos semanais de
            leitura recíproca.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <Metrica icone="hourglass_top" rotulo="Prazo do ciclo" valor={restante.curto}>
              <div className="w-full h-1.5 mt-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full"
                  style={{ width: `${Math.round(progresso * 100)}%` }}
                />
              </div>
            </Metrica>
            <Metrica icone="auto_stories" rotulo="Obras no projeto" valor={`${obras.length} obras`} />
            <Metrica
              icone="menu_book"
              rotulo="Grade da semana"
              valor={totalLeituras ? `${totalLeituras} leituras` : 'Em preparação'}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Link to="/grade" className="btn-primary">
              <Icone nome="view_timeline" className="text-[18px]" /> Ver grade da semana
            </Link>
            <Link to="/regras" className="btn-ghost">
              <Icone nome="gavel" className="text-[18px]" /> Como funciona
            </Link>
          </div>
        </div>

        <div className="lg:w-80 lg:self-start flex-shrink-0 relative overflow-hidden rounded-xl bg-surface-container-lowest/70 backdrop-blur-md p-space-md">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary via-tertiary to-primary-container" />
          <div className="flex items-start gap-3 pl-1">
            <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center text-primary flex-shrink-0">
              <Icone nome="tips_and_updates" preenchido className="text-[20px]" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-label-sm uppercase tracking-wider text-primary">{dicaDaSemana.titulo}</span>
              <p className="text-body-sm text-on-surface">{dicaDaSemana.texto}</p>
              <p className="text-label-sm text-on-surface-variant pt-1">Prazo: {formatarPrazo(cicloAtual.prazo)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metrica({
  icone,
  rotulo,
  valor,
  children,
}: {
  icone: string;
  rotulo: string;
  valor: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface-container-lowest/70 backdrop-blur-md min-w-0">
      <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary flex-shrink-0">
        <Icone nome={icone} className="text-[18px]" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-label-sm text-on-surface-variant truncate">{rotulo}</span>
        <span className="text-body-md text-on-surface font-semibold truncate">{valor}</span>
        {children}
      </div>
    </div>
  );
}
