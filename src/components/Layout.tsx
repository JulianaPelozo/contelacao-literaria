import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { cicloAtual } from '../data/ciclo';
import { frase } from '../data/site';
import { useInstalar } from '../lib/instalar';
import { tempoRestante, useAgora } from '../lib/tempo';
import { Icone } from './Icone';

const NAV = [
  { para: '/', rotulo: 'Início', rotuloLongo: 'Vitrine de Obras', icone: 'auto_stories' },
  { para: '/grade', rotulo: 'Grade', rotuloLongo: 'Grade de Leitura', icone: 'checklist_rtl' },
  { para: '/regras', rotulo: 'Regras', rotuloLongo: 'Comunidade & Regras', icone: 'gavel' },
];

export function Layout() {
  const { pathname } = useLocation();
  const agora = useAgora();
  const restante = tempoRestante(cicloAtual.prazo, agora);
  const { podeInstalar, instalar } = useInstalar();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-3 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-on-primary"
      >
        Pular para o conteúdo
      </a>

      <header className="fixed top-0 inset-x-0 z-50 pt-safe bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(10,7,27,0.45)]">
        <div className="h-16 lg:h-20 max-w-7xl mx-auto px-gutter-mobile lg:px-margin flex items-center justify-between gap-space-md">
          <Link to="/" className="flex items-center gap-space-sm group min-w-0">
            <Icone
              nome="auto_awesome"
              preenchido
              className="text-primary text-[26px] lg:text-[28px] group-hover:rotate-45 transition-transform duration-500"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-display text-headline-sm text-on-surface tracking-tight truncate">
                Constelação Literária
              </span>
              <span className="text-label-sm uppercase tracking-widest text-primary/70 hidden sm:block">
                Aliança Wattpad
              </span>
            </div>
          </Link>

          <nav aria-label="Principal" className="hidden lg:flex items-center gap-space-xs p-space-xs rounded-full bg-surface-container-low/60">
            {NAV.map((n) => {
            const ativo = n.para === '/' && pathname.startsWith('/obra/');
            return (
              <NavLink
                key={n.para}
                to={n.para}
                end={n.para === '/'}
                className={({ isActive }) =>
                  `px-space-md py-space-xs rounded-full text-label-md transition-colors ${
                    isActive || ativo
                      ? 'bg-primary-container text-on-primary-container font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`
                }
              >
                {n.rotuloLongo}
              </NavLink>
            ); })}
          </nav>

          <div className="flex items-center gap-space-sm flex-shrink-0">
            <Link
              to="/grade"
              className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high/70 text-secondary-fixed-dim hover:text-on-surface transition-colors"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${restante.encerrado ? 'bg-outline' : 'bg-primary-container animate-pulse'}`} />
              <span className="text-label-sm whitespace-nowrap">
                Ciclo {cicloAtual.numero} • {restante.curto.replace('Faltam ', '')}
              </span>
            </Link>
            {podeInstalar && (
              <button
                type="button"
                onClick={instalar}
                className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high/60 transition-colors"
                aria-label="Instalar aplicativo"
                title="Instalar aplicativo"
              >
                <Icone nome="install_mobile" className="text-[22px]" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main id="conteudo" className="flex-1 w-full pt-[calc(4rem+env(safe-area-inset-top,0px))] lg:pt-20 pb-28 lg:pb-0">
        <Outlet />
      </main>

      <footer className="hidden lg:block bg-surface-container-lowest/60 mt-space-xl">
        <div className="max-w-7xl mx-auto px-margin py-space-lg flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm text-on-surface-variant">
            <Icone nome="hotel_class" className="text-primary text-[20px]" />
            <span className="font-display text-on-surface">Constelação Literária</span>
            <span className="text-body-sm">— {frase.replace(/[“”"]/g, '')}</span>
          </div>
          <nav aria-label="Rodapé" className="flex items-center gap-space-md text-label-md text-on-surface-variant">
            <Link className="hover:text-primary" to="/regras">Código de Conduta</Link>
            <Link className="hover:text-primary" to="/grade">Grade da Semana</Link>
            <a className="hover:text-primary" href="https://www.wattpad.com/" target="_blank" rel="noopener noreferrer">
              Wattpad
            </a>
          </nav>
        </div>
      </footer>

      <nav
        aria-label="Principal"
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface-container-lowest/85 backdrop-blur-2xl shadow-[0_-8px_32px_rgba(14,11,32,0.7)]"
      >
        <div className="flex justify-around items-center h-[72px] px-space-xs max-w-md mx-auto">
          {NAV.map((n) => {
            const ativo = n.para === '/' && pathname.startsWith('/obra/');
            return (
            <NavLink
              key={n.para}
              to={n.para}
              end={n.para === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 min-w-[72px] h-12 transition-all select-none group ${
                  isActive || ativo
                    ? 'text-primary font-bold drop-shadow-[0_0_10px_rgba(206,189,255,0.65)]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icone nome={n.icone} preenchido={isActive || ativo} className="text-[24px] group-hover:scale-110 transition-transform" />
                  <span className="text-label-sm tracking-wide">{n.rotulo}</span>
                </>
              )}
            </NavLink>
          ); })}
        </div>
      </nav>
    </div>
  );
}
