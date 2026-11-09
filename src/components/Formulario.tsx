import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icone } from './Icone';

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  rotulo: string;
  icone?: string;
  prefixo?: string;
  dica?: ReactNode;
  acaoRotulo?: ReactNode;
  /** Conteúdo à direita, dentro do campo (ex.: botão de mostrar senha) */
  sufixo?: ReactNode;
}

export function Campo({ rotulo, icone, prefixo, dica, acaoRotulo, sufixo, className = '', ...props }: CampoProps) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-label-md text-on-surface-variant">
          {rotulo}
          {props.required && <span className="text-primary"> *</span>}
        </label>
        {acaoRotulo}
      </div>
      <div className="relative flex items-center">
        {icone && <Icone nome={icone} className="absolute left-3.5 text-outline text-[19px] pointer-events-none" />}
        {prefixo && (
          <span className="absolute left-3.5 text-primary text-body-md font-semibold pointer-events-none">{prefixo}</span>
        )}
        <input
          id={id}
          className={`w-full h-12 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-outline/70 text-body-md
            ring-1 ring-outline-variant/60 focus:ring-2 focus:ring-primary-container focus:outline-none transition-shadow
            ${icone || prefixo ? 'pl-10' : 'pl-4'} ${sufixo ? 'pr-12' : 'pr-4'}`}
          {...props}
        />
        {sufixo && <div className="absolute right-1.5">{sufixo}</div>}
      </div>
      {dica && <p className="text-label-sm font-medium text-on-surface-variant/80">{dica}</p>}
    </div>
  );
}

export function CampoSenha(props: Omit<CampoProps, 'type' | 'icone' | 'sufixo'>) {
  const [visivel, setVisivel] = useState(false);
  return (
    <Campo
      {...props}
      type={visivel ? 'text' : 'password'}
      icone="key"
      sufixo={
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-outline hover:text-primary"
          aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
        >
          <Icone nome={visivel ? 'visibility_off' : 'visibility'} className="text-[19px]" />
        </button>
      }
    />
  );
}

type TipoAlerta = 'erro' | 'sucesso' | 'info';
const ESTILO: Record<TipoAlerta, { cls: string; icone: string }> = {
  erro: { cls: 'bg-error/10 text-error ring-error/30', icone: 'error' },
  sucesso: { cls: 'bg-primary-container/15 text-primary ring-primary-container/40', icone: 'check_circle' },
  info: { cls: 'bg-surface-container-high text-on-surface-variant ring-outline-variant/50', icone: 'info' },
};

export function Alerta({ tipo = 'info', children }: { tipo?: TipoAlerta; children: ReactNode }) {
  if (!children) return null;
  const e = ESTILO[tipo];
  return (
    <div role={tipo === 'erro' ? 'alert' : 'status'} className={`flex items-start gap-2 p-3 rounded-xl ring-1 text-body-sm ${e.cls}`}>
      <Icone nome={e.icone} preenchido className="text-[18px] mt-px" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function BotaoEnviar({ carregando, children, className = '' }: { carregando?: boolean; children: ReactNode; className?: string }) {
  return (
    <button type="submit" disabled={carregando} className={`btn-primary w-full py-3 text-body-md disabled:opacity-60 disabled:cursor-wait ${className}`}>
      {carregando ? <Icone nome="progress_activity" className="text-[20px] animate-spin" /> : children}
    </button>
  );
}
