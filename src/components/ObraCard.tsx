import { Link } from 'react-router-dom';
import type { Obra } from '../data/tipos';
import { Capa } from './Capa';
import { Icone } from './Icone';
import { LinkWattpad, SeloWattpad } from './LinkWattpad';
import { Tags } from './Tags';

interface Props {
  obra: Obra;
  /** Texto do selo inferior da capa, ex.: "Cap. 1 a 5" */
  meta?: string;
  className?: string;
}

/** Card vertical (carrossel no mobile, grade no desktop). A capa leva direto ao Wattpad. */
export function ObraCard({ obra, meta, className = '' }: Props) {
  return (
    <article
      className={`group card relative overflow-hidden p-space-md flex flex-col hover:bg-surface-container transition-colors ${className}`}
    >
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-primary/10 rounded-full blur-xl pointer-events-none" />
      <LinkWattpad
        obra={obra}
        className="relative block w-full aspect-[3/4] rounded-xl overflow-hidden mb-space-sm bg-surface-container-highest"
      >
        <Capa obra={obra} />
        <SeloWattpad className="absolute top-2.5 right-2.5" />
        {meta && (
          <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-surface-container-lowest/85 backdrop-blur-md text-label-sm text-primary">
            {meta}
          </span>
        )}
      </LinkWattpad>

      <Tags obra={obra} />
      <h3 className="font-display text-headline-sm text-on-surface leading-tight mt-2 line-clamp-1">
        <Link to={`/obra/${obra.id}`} className="hover:text-primary transition-colors">
          {obra.titulo}
        </Link>
      </h3>
      <p className="text-label-sm text-tertiary-fixed-dim mt-0.5 mb-2">
        por {obra.autora} <span className="text-outline font-medium">@{obra.usuario}</span>
      </p>
      <p className="text-body-sm text-on-surface-variant line-clamp-2">{obra.sinopse}</p>

      <div className="mt-auto pt-4 flex items-center gap-2">
        <LinkWattpad obra={obra} className="btn-primary flex-1 py-2">
          <Icone nome="menu_book" className="text-[16px]" />
          Ler no Wattpad
        </LinkWattpad>
        <Link
          to={`/obra/${obra.id}`}
          className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-primary flex items-center justify-center flex-shrink-0 transition-colors active:scale-95"
          aria-label={`Detalhes de ${obra.titulo}`}
          title="Detalhes da obra"
        >
          <Icone nome="info" className="text-[19px]" />
        </Link>
      </div>
    </article>
  );
}

/** Item horizontal de lista (Recém-chegadas). */
export function ObraLinha({ obra }: { obra: Obra }) {
  return (
    <article className="group p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-start gap-3 shadow-md">
      <LinkWattpad
        obra={obra}
        className="w-20 h-28 rounded-lg overflow-hidden bg-surface-container-highest flex-shrink-0 relative"
      >
        <Capa obra={obra} />
        {obra.nova && (
          <span className="absolute bottom-1 right-1 px-1 rounded bg-surface-container-lowest/85 text-[10px] text-primary font-bold">
            NOVA
          </span>
        )}
      </LinkWattpad>
      <div className="flex flex-col justify-between flex-1 min-w-0 min-h-28 py-0.5">
        <div>
          <span className="text-label-sm text-secondary-fixed-dim truncate block">
            {obra.generos[0]} • @{obra.usuario}
          </span>
          <h4 className="font-display text-[17px] leading-snug text-on-surface truncate mt-0.5">
            <Link to={`/obra/${obra.id}`} className="hover:text-primary transition-colors">
              {obra.titulo}
            </Link>
          </h4>
          <p className="text-body-sm text-on-surface-variant line-clamp-2 mt-0.5">{obra.sinopse}</p>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1.5">
          <span className="text-label-sm text-on-surface-variant flex items-center gap-1">
            {obra.capitulos ? (
              <>
                <Icone nome="auto_stories" className="text-[14px]" /> {obra.capitulos} cap.
              </>
            ) : null}
          </span>
          <LinkWattpad
            obra={obra}
            className="px-3 py-1 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-primary text-label-sm transition-all flex items-center gap-1 active:scale-95"
          >
            Ler no Wattpad
            <Icone nome="open_in_new" className="text-[13px]" />
          </LinkWattpad>
        </div>
      </div>
    </article>
  );
}
