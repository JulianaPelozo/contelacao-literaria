import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Carregando } from '../components/Carregando';
import { Alerta } from '../components/Formulario';
import { Icone } from '../components/Icone';
import { useAuth, type Perfil } from '../lib/auth';
import { iniciais } from '../lib/iniciais';
import { supabase, traduzirErro } from '../lib/supabase';

const dataCurta = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

export function PainelAdm() {
  const { sessao, ehAdm, carregando } = useAuth();
  const [perfis, setPerfis] = useState<Perfil[] | null>(null);
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [busca, setBusca] = useState('');

  const carregar = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('perfis').select('*').order('criado_em', { ascending: false });
    if (error) setErro(traduzirErro(error));
    else setPerfis(data as Perfil[]);
  }, []);

  useEffect(() => {
    if (ehAdm) carregar();
  }, [ehAdm, carregar]);

  const pendentes = useMemo(() => (perfis ?? []).filter((p) => p.status === 'pendente'), [perfis]);
  const membros = useMemo(() => {
    const q = busca.trim().toLowerCase().replace(/^@/, '');
    return (perfis ?? [])
      .filter((p) => p.status !== 'pendente')
      .filter((p) => !q || [p.nome, p.usuario, p.email].some((c) => c.toLowerCase().includes(q)));
  }, [perfis, busca]);

  if (carregando) return <Carregando />;
  if (!sessao) return <Navigate to="/entrar" replace state={{ de: '/adm' }} />;
  if (!ehAdm) {
    return (
      <div className="max-w-xl mx-auto px-gutter-mobile py-space-xl text-center flex flex-col items-center gap-space-md">
        <Icone nome="lock" className="text-[48px] text-primary/70" />
        <h1 className="font-display text-headline-lg-mobile text-on-surface">Acesso restrito</h1>
        <p className="text-on-surface-variant">O Painel ADM é exclusivo para ADMs aprovadas.</p>
        <Link to="/conta" className="btn-ghost">
          Ver minha conta
        </Link>
      </div>
    );
  }

  const analisar = async (p: Perfil, acao: 'aprovar' | 'recusar') => {
    if (!supabase) return;
    if (acao === 'recusar' && !window.confirm(`Recusar o acesso ADM de ${p.nome || p.email}? A conta continua existindo como leitora/autora.`)) return;
    setErro('');
    setOk('');
    setOcupado(p.id);
    const { error } = await supabase.rpc(acao === 'aprovar' ? 'aprovar_adm' : 'recusar_adm', { alvo: p.id });
    setOcupado(null);
    if (error) return setErro(traduzirErro(error));
    setOk(acao === 'aprovar' ? `${p.nome || p.email} agora é ADM.` : `Solicitação de ${p.nome || p.email} recusada.`);
    carregar();
  };

  const total = perfis?.length ?? 0;
  const adms = (perfis ?? []).filter((p) => p.tipo === 'adm' && p.status === 'ativo').length;

  return (
    <div className="max-w-5xl mx-auto px-gutter-mobile lg:px-margin pt-space-md lg:pt-space-lg flex flex-col gap-space-lg">
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-lowest p-space-md sm:p-space-lg shadow-xl">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-secondary-container/30 rounded-full blur-3xl pointer-events-none" />
        <span className="relative inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/50 text-secondary-fixed-dim text-label-sm">
          <Icone nome="shield_person" preenchido className="text-[14px]" /> Modo Administradora
        </span>
        <h1 className="relative font-display text-headline-lg-mobile sm:text-headline-lg text-on-surface mt-space-sm">
          Painel da Moderação
        </h1>
        <p className="relative text-body-sm sm:text-body-md text-on-surface-variant mt-1">
          Aprove novas ADMs e acompanhe quem faz parte da constelação.
        </p>
        <div className="relative grid grid-cols-3 gap-2 mt-space-md">
          {[
            { r: 'Contas', v: total, i: 'group' },
            { r: 'ADMs', v: adms, i: 'verified_user' },
            { r: 'Pendentes', v: pendentes.length, i: 'pending_actions' },
          ].map((m) => (
            <div key={m.r} className="p-2.5 sm:p-space-md rounded-xl bg-surface-container-lowest/70">
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <Icone nome={m.i} className="text-[16px] text-primary" />
                <span className="text-label-sm">{m.r}</span>
              </div>
              <p className="font-display text-headline-md text-on-surface mt-0.5">{perfis ? m.v : '–'}</p>
            </div>
          ))}
        </div>
      </header>

      <Alerta tipo="erro">{erro}</Alerta>
      <Alerta tipo="sucesso">{ok}</Alerta>

      <section className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icone nome="how_to_reg" className="text-primary text-[22px]" />
            <h2 className="font-display text-headline-sm lg:text-headline-md text-on-surface">Solicitações de ADM</h2>
          </div>
          <button type="button" onClick={carregar} className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high" aria-label="Atualizar lista">
            <Icone nome="refresh" className="text-[20px]" />
          </button>
        </div>
        {!perfis ? (
          <Carregando />
        ) : pendentes.length === 0 ? (
          <div className="card p-space-lg text-center text-body-sm text-on-surface-variant">
            <Icone nome="task_alt" className="text-[32px] text-primary/60" />
            <p className="mt-1">Nenhuma solicitação aguardando aprovação.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-space-md">
            {pendentes.map((p) => (
              <article key={p.id} className="card p-space-md flex flex-col gap-space-md">
                <div className="flex items-center gap-3">
                  <Avatar nome={p.nome || p.email} />
                  <div className="min-w-0">
                    <p className="text-body-md text-on-surface font-semibold truncate">{p.nome || '(sem nome)'}</p>
                    <p className="text-body-sm text-on-surface-variant truncate">
                      {p.usuario && <span className="text-primary">@{p.usuario} • </span>}
                      {p.email}
                    </p>
                    <p className="text-label-sm font-medium text-outline mt-0.5">Pediu acesso em {dataCurta(p.criado_em)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" disabled={ocupado === p.id} onClick={() => analisar(p, 'aprovar')} className="btn-primary disabled:opacity-60">
                    <Icone nome="check_circle" className="text-[17px]" /> Aprovar
                  </button>
                  <button type="button" disabled={ocupado === p.id} onClick={() => analisar(p, 'recusar')} className="btn-ghost hover:text-error disabled:opacity-60">
                    <Icone nome="cancel" className="text-[17px]" /> Recusar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div className="flex items-center gap-2">
            <Icone nome="manage_accounts" className="text-primary text-[22px]" />
            <h2 className="font-display text-headline-sm lg:text-headline-md text-on-surface">Membros</h2>
          </div>
          <label className="relative flex items-center sm:w-72">
            <span className="sr-only">Buscar membros</span>
            <Icone nome="search" className="absolute left-3 text-outline text-[18px] pointer-events-none" />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Nome, @usuário ou e-mail"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-low text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container"
            />
          </label>
        </div>
        {perfis && (
          <ul className="card divide-y divide-outline-variant/30 overflow-hidden">
            {membros.length === 0 && <li className="p-space-md text-body-sm text-on-surface-variant text-center">Ninguém encontrado.</li>}
            {membros.map((p) => (
              <li key={p.id} className="flex items-center gap-3 p-space-sm sm:p-space-md">
                <Avatar nome={p.nome || p.email} pequeno />
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm text-on-surface font-semibold truncate">{p.nome || '(sem nome)'}</p>
                  <p className="text-label-sm font-medium text-on-surface-variant truncate">
                    {p.usuario ? `@${p.usuario} • ` : ''}
                    {p.email}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${
                    p.tipo === 'adm' ? 'bg-secondary-container/50 text-secondary-fixed-dim' : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {p.primordial ? 'ADM Primordial' : p.tipo === 'adm' ? 'ADM' : 'Membro'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Avatar({ nome, pequeno }: { nome: string; pequeno?: boolean }) {
  return (
    <div
      className={`${pequeno ? 'w-9 h-9 text-label-md' : 'w-11 h-11 text-body-md'} rounded-full bg-surface-container-highest text-primary flex items-center justify-center font-semibold flex-shrink-0`}
    >
      {iniciais(nome)}
    </div>
  );
}
