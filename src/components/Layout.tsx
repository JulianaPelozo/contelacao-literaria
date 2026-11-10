import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { frase } from '../data/site';
import { useAuth } from '../lib/auth';
import { iniciais } from '../lib/iniciais';
import { useInstalar } from '../lib/instalar';
import { tempoRestante, useAgora } from '../lib/tempo';
import logo from '../assets/logo.webp';
import { Icone } from './Icone';
import { SeletorTema } from './SeletorTema';
import { useCiclo } from '../lib/ciclo';

interface ItemNav {
  para: string;
  rotulo: string;
  rotuloLongo: string;
  icone: string;
}

const NAV_BASE: ItemNav[] = [
  { para: '/', rotulo: 'Início', rotuloLongo: 'Vitrine de Obras', icone: 'auto_stories' },
  { para: '/grade', rotulo: 'Grade', rotuloLongo: 'Grade de Leitura', icone: 'checklist_rtl' },
  { para: '/regras', rotulo: 'Regras', rotuloLongo: 'Comunidade & Regras', icone: 'gavel' },
];
const NAV_ADM: ItemNav = { para: '/adm', rotulo: 'ADM', rotuloLongo: 'Painel ADM', icone: 'admin_panel_settings' };

/** Item "Início" também fica ativo nas páginas de obra; "Conta" também em entrar/cadastro. */
const ativoExtra = (para: string, pathname: string) =>
  (para === '/' && pathname.startsWith('/obra/')) ||
  (para === '/conta' && ['/entrar', '/cadastro', '/redefinir-senha'].includes(pathname)) ||
  (para === '/adm' && pathname.startsWith('/adm/'));

export function Layout() {
  const { ciclo: cicloAtual } = useCiclo();
  const { pathname } = useLocation();
  const agora = useAgora();
  const restante = tempoRestante(cicloAtual.prazo, agora);
  const { podeInstalar, instalar } = useInstalar();
  const { sessao, perfil, ehAdm } = useAuth();

  const navTopo = ehAdm ? [...NAV_BASE, NAV_ADM] : NAV_BASE;
  const navBaixo: ItemNav[] = [
    ...navTopo,
    sessao
      ? { para: '/conta', rotulo: 'Conta', rotuloLongo: 'Minha conta', icone: 'account_circle' }
      : { para: '/conta', rotulo: 'Entrar', rotuloLongo: 'Entrar', icone: 'login' },
  ];

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

      <header className="fixed top-0 inset-x-0 z-50 pt-safe bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_4px_24px_rgb(var(--c-sombra)/calc(0.45*var(--fx)))]">
        <div className="h-16 lg:h-20 max-w-7xl mx-auto px-gutter-mobile lg:px-margin flex items-center justify-between gap-space-md">
          <Link to="/" className="flex items-center gap-space-sm group min-w-0">
            <img
              src={logo}
              alt=""
              width={48}
              height={48}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex-shrink-0 ring-1 ring-primary/30 shadow-[0_0_14px_rgb(var(--c-primary)/calc(0.3*var(--fx)))] group-hover:scale-105 transition-transform duration-500"
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
            {navTopo.map((n) => {
              const ativo = ativoExtra(n.para, pathname);
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
              );
            })}
          </nav>

          <div className="flex items-center gap-space-xs sm:gap-space-sm flex-shrink-0">
            <Link
              to="/grade"
              className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high/70 text-secondary-fixed-dim hover:text-on-surface transition-colors"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${restante.encerrado ? 'bg-outline' : 'bg-primary-container animate-pulse'}`} />
              <span className="text-label-sm whitespace-nowrap">
                Ciclo {cicloAtual.numero} • {restante.curto.replace('Faltam ', '')}
              </span>
            </Link>
            <SeletorTema />
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
            {sessao ? (
              <Link to="/conta" className="hidden lg:flex items-center gap-space-sm pl-space-xs group" title="Minha conta">
                <span className="flex flex-col text-right max-w-[160px]">
                  <span className="text-label-md text-on-surface group-hover:text-primary transition-colors truncate">
                    {perfil?.nome || 'Minha conta'}
                  </span>
                  <span className="text-label-sm font-medium text-on-surface-variant truncate">
                    {ehAdm ? (perfil?.primordial ? 'ADM Primordial' : 'ADM') : perfil?.usuario ? `@${perfil.usuario}` : ''}
                  </span>
                </span>
                <span className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center text-label-md shadow-[0_0_12px_rgb(var(--c-primary-container)/0.3)]">
                  {iniciais(perfil?.nome || sessao.user.email || '')}
                </span>
              </Link>
            ) : (
              <Link to="/entrar" className="hidden lg:inline-flex btn-primary py-2">
                <Icone nome="login" className="text-[17px]" /> Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      <main id="conteudo" className="flex-1 w-full pt-[calc(4rem+env(safe-area-inset-top,0px))] lg:pt-20 pb-space-md lg:pb-0">
        <Outlet />
      </main>

      <footer className="bg-surface-container-lowest/60 mt-space-xl mb-[calc(72px+env(safe-area-inset-bottom,0px))] lg:mb-0">
        <div className="max-w-7xl mx-auto px-gutter-mobile lg:px-margin py-space-lg flex flex-col lg:flex-row items-center lg:justify-between gap-space-md text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center gap-space-sm text-on-surface-variant">
            <img src={logo} alt="" width={32} height={32} className="w-8 h-8 rounded-full" />
            <span className="font-display text-on-surface">Constelação Literária</span>
            <span className="text-body-sm hidden lg:inline">— {frase.replace(/[“”"]/g, '')}</span>
          </div>
          <nav aria-label="Rodapé" className="flex flex-wrap justify-center items-center gap-x-space-md gap-y-space-xs text-label-md text-on-surface-variant">
            <Link className="hover:text-primary" to="/regras">Código de Conduta</Link>
            <Link className="hover:text-primary" to="/grade">Grade da Semana</Link>
            <a className="hover:text-primary" href="https://www.wattpad.com/" target="_blank" rel="noopener noreferrer">
              Wattpad
            </a>
          </nav>
        </div>
        <div className="max-w-7xl mx-auto px-gutter-mobile lg:px-margin pb-space-lg">
          <p className="pt-space-md border-t border-outline-variant/30 text-center lg:text-left text-body-sm text-on-surface-variant">
            <span className="block sm:inline">© {new Date().getFullYear()} Constelação Literária</span>
            <span className="hidden sm:inline"> · </span>
            <span className="block sm:inline">
              Criado por <span className="text-on-surface font-semibold whitespace-nowrap">Juliana Pelozo Pacheco</span>
            </span>
          </p>
        </div>
      </footer>

      <nav
        aria-label="Principal"
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface-container-lowest/85 backdrop-blur-2xl shadow-[0_-8px_32px_rgb(var(--c-sombra)/calc(0.7*var(--fx)))]"
      >
        <div className="flex justify-around items-center h-[72px] px-space-xs max-w-md mx-auto">
          {navBaixo.map((n) => (
            <NavLink
              key={n.para}
              to={n.para}
              end={n.para === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 min-w-[60px] h-12 transition-all select-none group ${
                  isActive || ativoExtra(n.para, pathname)
                    ? 'text-primary font-bold drop-shadow-[0_0_10px_rgb(var(--c-primary)/calc(0.65*var(--fx)))]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icone nome={n.icone} preenchido={isActive || ativoExtra(n.para, pathname)} className="text-[24px] group-hover:scale-110 transition-transform" />
                  <span className="text-label-sm tracking-wide">{n.rotulo}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
