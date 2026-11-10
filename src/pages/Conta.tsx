import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Carregando } from '../components/Carregando';
import { Alerta, BotaoEnviar, Campo } from '../components/Formulario';
import { Conquistas } from '../components/Conquistas';
import { Icone } from '../components/Icone';
import { useAuth } from '../lib/auth';
import { iniciais } from '../lib/iniciais';
import { supabase, traduzirErro } from '../lib/supabase';

export function Conta() {
  const { sessao, perfil, ehAdm, carregando, recarregarPerfil, sair } = useAuth();
  const local = useLocation();
  const aviso = (local.state as { aviso?: string } | null)?.aviso;

  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: 'erro' | 'sucesso'; texto: string } | null>(null);

  useEffect(() => {
    if (perfil) {
      setNome(perfil.nome);
      setUsuario(perfil.usuario);
    }
  }, [perfil]);

  if (carregando) return <Carregando />;
  if (!sessao) return <Navigate to="/entrar" replace state={{ de: '/conta' }} />;

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase || !perfil) return;
    setSalvando(true);
    setMsg(null);
    const { error } = await supabase
      .from('perfis')
      .update({ nome: nome.trim(), usuario: usuario.trim().replace(/^@+/, '') })
      .eq('id', perfil.id);
    setSalvando(false);
    if (error)
      setMsg({ tipo: 'erro', texto: error.code === '23505' ? 'Esse @ já está em uso por outra conta.' : traduzirErro(error) });
    else {
      setMsg({ tipo: 'sucesso', texto: 'Dados atualizados.' });
      recarregarPerfil();
    }
  };

  const papel = ehAdm
    ? perfil?.primordial
      ? 'ADM Primordial'
      : 'ADM'
    : perfil?.status === 'pendente'
      ? 'ADM em análise'
      : 'Autora/Autor & Leitora/Leitor';

  return (
    <div className="max-w-3xl mx-auto px-gutter-mobile lg:px-margin pt-space-md lg:pt-space-lg flex flex-col gap-space-lg">
      {aviso && <Alerta tipo="info">{aviso}</Alerta>}

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-lowest p-space-md sm:p-space-lg shadow-xl">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-container/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-space-md">
          <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center font-display text-headline-md shadow-[0_0_24px_rgb(var(--c-primary-container)/0.35)] flex-shrink-0">
            {iniciais(perfil?.nome || sessao.user.email || '')}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-headline-lg-mobile sm:text-headline-lg text-on-surface truncate">
              {perfil?.nome || 'Minha conta'}
            </h1>
            <p className="text-body-sm text-on-surface-variant truncate">
              {perfil?.usuario && <span className="text-primary">@{perfil.usuario} • </span>}
              {sessao.user.email}
            </p>
            <span
              className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-label-sm ${
                ehAdm ? 'bg-secondary-container/60 text-secondary-fixed-dim' : 'bg-surface-container-highest text-on-surface-variant'
              }`}
            >
              <Icone nome={ehAdm ? 'shield_person' : perfil?.status === 'pendente' ? 'hourglass_top' : 'menu_book'} preenchido className="text-[14px]" />
              {papel}
            </span>
          </div>
        </div>
      </section>

      {perfil?.status === 'pendente' && (
        <Alerta tipo="info">
          <strong className="text-on-surface">Solicitação de ADM em análise.</strong> Uma ADM precisa aprovar seu
          cadastro. Enquanto isso, você usa o site como leitora/autora.
        </Alerta>
      )}
      {!perfil && (
        <Alerta tipo="erro">
          Seu perfil não foi encontrado no banco. Verifique se o arquivo <code>supabase/schema.sql</code> foi executado.
        </Alerta>
      )}

      {ehAdm && (
        <Link to="/adm" className="card p-space-md flex items-center gap-3 hover:bg-surface-container transition-colors">
          <div className="w-10 h-10 rounded-full bg-secondary-container/50 text-secondary-fixed-dim flex items-center justify-center">
            <Icone nome="admin_panel_settings" className="text-[22px]" />
          </div>
          <div className="flex-1">
            <p className="text-body-md text-on-surface font-semibold">Painel ADM</p>
            <p className="text-body-sm text-on-surface-variant">Aprovar cadastros de ADM e ver membros</p>
          </div>
          <Icone nome="chevron_right" className="text-outline" />
        </Link>
      )}

      {perfil && <Conquistas usuario={perfil.usuario} />}

      {perfil && (
        <form onSubmit={salvar} className="card p-space-md sm:p-space-lg flex flex-col gap-space-md">
          <h2 className="font-display text-headline-sm text-on-surface">Meus dados</h2>
          <div className="grid sm:grid-cols-2 gap-space-md">
            <Campo rotulo="Nome" icone="person" required maxLength={80} value={nome} onChange={(e) => setNome(e.target.value)} />
            <Campo
              rotulo="Usuário no Wattpad"
              prefixo="@"
              required
              maxLength={40}
              value={usuario}
              onChange={(e) => setUsuario(e.target.value.replace(/^@+/, ''))}
              autoCapitalize="none"
              spellCheck={false}
              dica="Use exatamente o seu @ do Wattpad: é por ele que o site reconhece suas obras na grade."
            />
          </div>
          {msg && <Alerta tipo={msg.tipo}>{msg.texto}</Alerta>}
          <BotaoEnviar carregando={salvando} className="sm:w-fit sm:px-6">
            <Icone nome="save" className="text-[18px]" /> Salvar
          </BotaoEnviar>
        </form>
      )}

      <button type="button" onClick={sair} className="btn-ghost w-full sm:w-fit text-error hover:text-error">
        <Icone nome="logout" className="text-[18px]" /> Sair da conta
      </button>
    </div>
  );
}
