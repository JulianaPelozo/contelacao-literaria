import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Capa } from '../components/Capa';
import { Icone } from '../components/Icone';
import { LinkWattpad, SeloWattpad } from '../components/LinkWattpad';
import { cicloAtual } from '../data/ciclo';
import { obraPorId } from '../data/obras';
import type { Obra } from '../data/tipos';
import { formatarPrazo } from '../lib/tempo';
import { NaoEncontrada } from './NaoEncontrada';

export function ObraDetalhes() {
  const { id = '' } = useParams();
  const obra = obraPorId(id);
  if (!obra) return <NaoEncontrada mensagem="Essa obra não está (ou não está mais) na constelação." />;
  return <Detalhes obra={obra} />;
}

function Detalhes({ obra }: { obra: Obra }) {
  const [sinopseAberta, setSinopseAberta] = useState(false);
  const [aviso, setAviso] = useState('');
  const naGrade = cicloAtual.grupos.flatMap((g) =>
    g.leituras.filter((l) => l.obra === obra.id).map((l) => ({ grupo: g.nome, capitulos: l.capitulos })),
  );
  const paragrafos = obra.sinopse.split(/\n+/);
  const longa = obra.sinopse.length > 320;

  const compartilhar = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: obra.titulo, text: `${obra.titulo}, de ${obra.autora}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setAviso('Link copiado!');
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') setAviso('Não foi possível compartilhar.');
    }
    setTimeout(() => setAviso(''), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-gutter-mobile lg:px-margin pt-space-md lg:pt-space-lg">
      <nav aria-label="Trilha" className="flex items-center gap-1.5 text-label-md text-on-surface-variant mb-space-md">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-primary">
          <Icone nome="arrow_back_ios_new" className="text-[14px] lg:hidden" />
          <span>Vitrine de Obras</span>
        </Link>
        <span className="hidden lg:inline">•</span>
        <span className="hidden lg:inline">{obra.generos[0]}</span>
        <span className="hidden lg:inline">•</span>
        <span className="hidden lg:inline text-on-surface truncate">{obra.titulo}</span>
      </nav>

      <div className="grid lg:grid-cols-[320px_1fr] gap-space-lg lg:gap-space-xl items-start">
        {/* Coluna da capa */}
        <div className="flex flex-col gap-space-md lg:sticky lg:top-28">
          <LinkWattpad
            obra={obra}
            className="group relative block w-full max-w-[280px] lg:max-w-none mx-auto aspect-[3/4] rounded-2xl overflow-hidden bg-surface-container-highest shadow-[0_12px_48px_rgba(93,3,202,0.35)]"
          >
            <Capa obra={obra} />
            <SeloWattpad className="absolute top-3 right-3" />
          </LinkWattpad>
          <LinkWattpad obra={obra} className="btn-primary w-full py-3 text-label-md uppercase tracking-wider">
            Abrir no Wattpad <Icone nome="open_in_new" className="text-[17px]" />
          </LinkWattpad>
          <div className="relative">
            <button type="button" onClick={compartilhar} className="btn-ghost w-full">
              <Icone nome="share" className="text-[17px]" /> Compartilhar obra
            </button>
            <span role="status" aria-live="polite" className="absolute inset-x-0 -bottom-6 text-center text-label-sm text-primary">
              {aviso}
            </span>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex flex-col gap-space-lg min-w-0">
          <header className="flex flex-col gap-space-sm">
            <div className="flex flex-wrap gap-1.5">
              {obra.generos.map((g) => (
                <span key={g} className="px-2.5 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container text-label-sm">
                  {g}
                </span>
              ))}
              {obra.classificacao && (
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary-fixed-dim text-label-sm">
                  {obra.classificacao}
                </span>
              )}
            </div>
            <h1 className="font-display text-headline-xl-mobile lg:text-headline-xl text-on-surface tracking-tight">
              {obra.titulo}
            </h1>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-label-md">
                {iniciais(obra.autora)}
              </div>
              <div>
                <p className="text-body-md text-on-surface font-semibold leading-tight">{obra.autora}</p>
                <p className="text-label-sm font-medium text-on-surface-variant">@{obra.usuario}</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {obra.capitulos != null && <Info icone="format_list_numbered" rotulo="Capítulos" valor={`${obra.capitulos} publicados`} />}
            {obra.status && <Info icone="hourglass_top" rotulo="Status" valor={obra.status} />}
            {obra.classificacao && <Info icone="shield" rotulo="Classificação" valor={obra.classificacao} />}
          </div>

          {obra.avisos && (
            <p className="flex items-start gap-2 text-body-sm text-on-surface-variant p-space-sm rounded-lg bg-surface-container-low">
              <Icone nome="warning" className="text-[18px] text-error/80" />
              <span>
                <strong className="text-on-surface font-semibold">Avisos de conteúdo:</strong> {obra.avisos}
              </span>
            </p>
          )}

          <section className="card p-space-md sm:p-space-lg">
            <div className="flex items-center gap-2 mb-space-sm">
              <Icone nome="auto_awesome" className="text-primary text-[20px]" />
              <h2 className="font-display text-headline-sm text-on-surface">Sinopse</h2>
            </div>
            <div className={`flex flex-col gap-space-sm text-body-md text-on-surface-variant ${longa && !sinopseAberta ? 'line-clamp-5 lg:line-clamp-none' : ''}`}>
              {paragrafos.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {longa && (
              <button
                type="button"
                onClick={() => setSinopseAberta((v) => !v)}
                className="lg:hidden mt-space-sm inline-flex items-center gap-1 text-label-md text-primary"
                aria-expanded={sinopseAberta}
              >
                {sinopseAberta ? 'Mostrar menos' : 'Ler sinopse completa'}
                <Icone nome="expand_more" className={`text-[18px] transition-transform ${sinopseAberta ? 'rotate-180' : ''}`} />
              </button>
            )}
          </section>

          {naGrade.length > 0 && (
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-high to-surface-container-lowest p-space-md sm:p-space-lg">
              <div className="absolute -right-6 -top-6 w-28 h-28 bg-primary-container/20 rounded-full blur-2xl pointer-events-none" />
              <span className="relative inline-flex items-center gap-1 text-label-sm uppercase tracking-wider text-primary">
                <Icone nome="flare" className="text-[15px]" /> Na grade desta semana
              </span>
              {naGrade.map((g) => (
                <p key={g.grupo} className="relative font-display text-headline-sm text-on-surface mt-1">
                  Ciclo {cicloAtual.numero} • {g.grupo}{' '}
                  <span className="font-sans text-body-sm text-on-surface-variant">— capítulos {g.capitulos}</span>
                </p>
              ))}
              <p className="relative text-body-sm text-on-surface-variant mt-1">Prazo: {formatarPrazo(cicloAtual.prazo)}</p>
              <Link to="/grade" className="relative mt-space-sm inline-flex items-center gap-1 text-label-md text-primary hover:underline">
                Ver grade completa <Icone nome="arrow_forward" className="text-[15px]" />
              </Link>
            </section>
          )}

          {obra.feedbacks && obra.feedbacks.length > 0 && (
            <section className="flex flex-col gap-space-md">
              <div>
                <div className="flex items-center gap-2">
                  <Icone nome="forum" className="text-primary text-[22px]" />
                  <h2 className="font-display text-headline-sm lg:text-headline-md text-on-surface">Feedbacks do Coletivo</h2>
                </div>
                <p className="text-body-sm text-on-surface-variant mt-0.5">Pareceres de leitura verificados pelas ADMs.</p>
              </div>
              {obra.feedbacks.map((f, i) => (
                <article key={i} className="card p-space-md sm:p-space-lg flex flex-col gap-space-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest text-primary flex items-center justify-center text-label-md">
                      {iniciais(f.nome)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-body-md text-on-surface font-semibold leading-tight flex items-center gap-1.5">
                        {f.nome}
                        {f.papel && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-secondary-container/50 text-secondary-fixed-dim text-[10px] font-bold uppercase tracking-wide">
                            <Icone nome="verified" preenchido className="text-[11px]" /> {f.papel}
                          </span>
                        )}
                      </p>
                      <p className="text-label-sm font-medium text-on-surface-variant">
                        @{f.usuario}
                        {f.capitulos && ` • ${f.capitulos}`}
                        {f.ciclo && ` • Ciclo ${f.ciclo}`}
                      </p>
                    </div>
                  </div>
                  {f.titulo && <h3 className="font-display text-[18px] leading-snug text-on-surface">“{f.titulo}”</h3>}
                  <p className="text-body-sm sm:text-body-md text-on-surface-variant">{f.texto}</p>
                </article>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ icone, rotulo, valor }: { icone: string; rotulo: string; valor: string }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low min-w-0">
      <Icone nome={icone} className="text-primary text-[18px]" />
      <div className="min-w-0">
        <p className="text-label-sm text-on-surface-variant">{rotulo}</p>
        <p className="text-body-sm text-on-surface font-semibold truncate">{valor}</p>
      </div>
    </div>
  );
}

const iniciais = (nome: string) =>
  nome
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
