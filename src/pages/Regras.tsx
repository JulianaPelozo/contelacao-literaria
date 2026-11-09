import { Link } from 'react-router-dom';
import { Icone } from '../components/Icone';
import { cicloAtual } from '../data/ciclo';
import { comoComprovar, regrasCiclo, regrasHonra, ritmos } from '../data/site';

const PASSOS = [
  { icone: 'how_to_reg', titulo: 'Inscrição', texto: 'Sua obra do Wattpad entra no projeto e é validada pelas ADMs.' },
  { icone: 'groups', titulo: 'Grupo', texto: 'A cada ciclo, você é alocada(o) em um grupo de autores com gêneros afins.' },
  { icone: 'menu_book', titulo: 'Leitura', texto: 'Leia os capítulos da grade e comente direto nos parágrafos do Wattpad.' },
  { icone: 'verified', titulo: 'Comprovação', texto: comoComprovar },
];

export function Regras() {
  return (
    <div className="max-w-5xl mx-auto px-gutter-mobile lg:px-margin pt-space-md lg:pt-space-lg flex flex-col gap-space-xl">
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-lowest p-space-md sm:p-space-lg shadow-xl">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-secondary-container/30 rounded-full blur-3xl pointer-events-none" />
        <span className="relative inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-highest/80 text-secondary text-label-sm">
          <Icone nome="gavel" className="text-[14px] text-primary" /> Comunidade & Regras
        </span>
        <h1 className="relative font-display text-headline-lg-mobile sm:text-headline-lg text-on-surface mt-space-sm">
          Como funciona a Constelação
        </h1>
        <p className="relative text-body-md text-on-surface-variant max-w-2xl mt-1">
          Ciclos colaborativos de leitura crítica recíproca. Nosso coletivo vive da sinceridade técnica e do compromisso
          mútuo.
        </p>
      </header>

      <section className="flex flex-col gap-space-md">
        <h2 className="font-display text-headline-sm lg:text-headline-md text-on-surface">O ciclo em 4 passos</h2>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {PASSOS.map((p, i) => (
            <li key={p.titulo} className="card p-space-md flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-full bg-primary-container/20 text-primary flex items-center justify-center">
                  <Icone nome={p.icone} className="text-[20px]" />
                </span>
                <span className="font-display text-headline-md text-primary/30">{i + 1}</span>
              </div>
              <h3 className="text-label-md text-on-surface uppercase tracking-wider">{p.titulo}</h3>
              <p className="text-body-sm text-on-surface-variant">{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-space-md">
        <div className="flex items-center gap-2">
          <Icone nome="verified_user" preenchido className="text-primary text-[22px]" />
          <h2 className="font-display text-headline-sm lg:text-headline-md text-on-surface">Protocolo de Honra</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-space-md">
          {regrasHonra.map((r, i) => (
            <article key={r.titulo} className="relative overflow-hidden card p-space-md flex gap-3">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary-container" />
              <span className="w-8 h-8 rounded-full bg-surface-container-highest text-primary text-label-md flex items-center justify-center flex-shrink-0 ml-1">
                {i + 1}
              </span>
              <div>
                <h3 className="text-body-md text-on-surface font-semibold">{r.titulo}</h3>
                <p className="text-body-sm text-on-surface-variant mt-0.5">{r.texto}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-space-lg">
        <section className="card p-space-md sm:p-space-lg flex flex-col gap-space-md">
          <h2 className="font-display text-headline-sm text-on-surface">Regulamento do ciclo</h2>
          <ul className="flex flex-col gap-space-md">
            {regrasCiclo.map((r) => (
              <li key={r.titulo} className="flex gap-3">
                <Icone nome={r.icone} className="text-primary text-[20px] mt-0.5" />
                <p className="text-body-sm text-on-surface-variant">
                  <strong className="text-on-surface font-semibold">{r.titulo}:</strong> {r.texto}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-space-md sm:p-space-lg flex flex-col gap-space-md">
          <h2 className="font-display text-headline-sm text-on-surface">Ritmos de órbita</h2>
          <ul className="flex flex-col gap-space-sm">
            {ritmos.map((r) => (
              <li key={r.nome} className="p-space-sm rounded-xl bg-surface-container">
                <p className="text-body-md text-on-surface font-semibold">{r.nome}</p>
                <p className="text-body-sm text-on-surface-variant">{r.detalhe}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="flex flex-col gap-space-md">
        <h2 className="font-display text-headline-sm lg:text-headline-md text-on-surface">Grupos do ciclo {cicloAtual.numero}</h2>
        {cicloAtual.grupos.length === 0 && (
          <p className="text-body-sm text-on-surface-variant">Os grupos deste ciclo ainda estão sendo definidos pelas ADMs.</p>
        )}
        <div className="grid sm:grid-cols-3 gap-space-md">
          {cicloAtual.grupos.map((g) => (
            <div key={g.nome} className="card p-space-md">
              <Icone nome="flare" className="text-primary text-[22px]" />
              <h3 className="font-display text-headline-sm text-on-surface mt-1">{g.nome}</h3>
              {g.descricao && <p className="text-body-sm text-on-surface-variant">{g.descricao}</p>}
              <p className="text-label-sm text-secondary-fixed-dim mt-2">{g.leituras.length} obras nesta semana</p>
            </div>
          ))}
        </div>
        <Link to="/grade" className="btn-primary w-fit">
          <Icone nome="view_timeline" className="text-[18px]" /> Ver grade da semana
        </Link>
      </section>
    </div>
  );
}
