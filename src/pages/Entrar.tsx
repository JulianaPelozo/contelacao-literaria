import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alerta, BotaoEnviar, Campo, CampoSenha } from '../components/Formulario';
import { Icone } from '../components/Icone';
import { MolduraAcesso } from '../components/MolduraAcesso';
import { useAuth, type Perfil } from '../lib/auth';
import { supabase, traduzirErro, urlBase } from '../lib/supabase';

type Acesso = 'membro' | 'adm';

export function Entrar() {
  const { sessao, carregando, erroLink } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();
  const voltarPara = (local.state as { de?: string } | null)?.de;

  const [acesso, setAcesso] = useState<Acesso>(voltarPara === '/adm' ? 'adm' : 'membro');
  const [modo, setModo] = useState<'entrar' | 'esqueci'>('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(erroLink ? `O link do e-mail não funcionou: ${erroLink}` : '');
  const [ok, setOk] = useState('');

  if (!carregando && sessao && !enviando) return <Navigate to={voltarPara ?? '/conta'} replace />;

  const entrar = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setErro('');
    setEnviando(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error || !data.user) {
      setErro(traduzirErro(error));
      setEnviando(false);
      return;
    }
    const { data: p } = await supabase.from('perfis').select('tipo,status').eq('id', data.user.id).maybeSingle();
    const perfil = p as Pick<Perfil, 'tipo' | 'status'> | null;
    const ehAdm = perfil?.tipo === 'adm' && perfil.status === 'ativo';

    if (acesso === 'adm' && !ehAdm) {
      const aviso =
        perfil?.status === 'pendente'
          ? 'Sua solicitação de ADM ainda aguarda aprovação. Por enquanto, você entrou como leitora/autora.'
          : 'Esta conta não tem acesso ADM. Você entrou como leitora/autora.';
      navegar('/conta', { replace: true, state: { aviso } });
    } else {
      navegar(voltarPara ?? (acesso === 'adm' ? '/adm' : '/'), { replace: true });
    }
  };

  const recuperar = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setErro('');
    setOk('');
    setEnviando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${urlBase()}?recuperar=1` });
    setEnviando(false);
    if (error) setErro(traduzirErro(error));
    else
      setOk(
        'Se existir uma conta com este e-mail, enviamos um link para criar uma nova senha. Abra o link neste mesmo navegador.',
      );
  };

  if (modo === 'esqueci') {
    return (
      <MolduraAcesso titulo="Recuperar acesso" subtitulo="Enviaremos um link para você criar uma nova senha.">
        <form onSubmit={recuperar} className="flex flex-col gap-space-md">
          <Campo
            rotulo="E-mail da conta"
            icone="alternate_email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
          />
          <Alerta tipo="erro">{erro}</Alerta>
          <Alerta tipo="sucesso">{ok}</Alerta>
          <BotaoEnviar carregando={enviando}>
            <Icone nome="forward_to_inbox" className="text-[20px]" /> Enviar link
          </BotaoEnviar>
          <button
            type="button"
            onClick={() => {
              setModo('entrar');
              setErro('');
              setOk('');
            }}
            className="text-label-md text-primary hover:underline inline-flex items-center justify-center gap-1"
          >
            <Icone nome="arrow_back" className="text-[16px]" /> Voltar para o login
          </button>
        </form>
      </MolduraAcesso>
    );
  }

  return (
    <MolduraAcesso titulo="Acessar Aliança">
      <div role="tablist" aria-label="Tipo de acesso" className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface-container-lowest mb-space-lg">
        {(
          [
            { v: 'membro', r: 'Autor & Leitor', i: 'menu_book' },
            { v: 'adm', r: 'Mesa ADM', i: 'shield_person' },
          ] as const
        ).map((t) => (
          <button
            key={t.v}
            type="button"
            role="tab"
            aria-selected={acesso === t.v}
            onClick={() => setAcesso(t.v)}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-label-md transition-colors ${
              acesso === t.v
                ? 'bg-surface-container-high text-primary shadow-md'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Icone nome={t.i} preenchido={acesso === t.v} className="text-[18px]" />
            {t.r}
          </button>
        ))}
      </div>

      <form onSubmit={entrar} className="flex flex-col gap-space-md">
        {acesso === 'adm' && (
          <Alerta tipo="info">Área de moderação: aprovação de cadastros e auditoria das leituras.</Alerta>
        )}
        <Campo
          rotulo="E-mail"
          icone="alternate_email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
        />
        <CampoSenha
          rotulo="Senha"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="••••••••"
          acaoRotulo={
            <button
              type="button"
              onClick={() => {
                setModo('esqueci');
                setErro('');
              }}
              className="text-label-sm text-primary hover:underline"
            >
              Esqueceu a senha?
            </button>
          }
        />
        <Alerta tipo="erro">{erro}</Alerta>
        <BotaoEnviar carregando={enviando}>
          <Icone nome="explore" className="text-[20px]" />
          {acesso === 'adm' ? 'Entrar na Mesa ADM' : 'Adentrar à Constelação'}
        </BotaoEnviar>
      </form>

      <p className="text-body-sm text-on-surface-variant text-center mt-space-lg">
        Ainda não faz parte da aliança?{' '}
        <Link to="/cadastro" className="text-primary font-semibold hover:underline">
          Criar cadastro
        </Link>
      </p>
    </MolduraAcesso>
  );
}
