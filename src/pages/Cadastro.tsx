import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Alerta, BotaoEnviar, Campo, CampoSenha } from '../components/Formulario';
import { Icone } from '../components/Icone';
import { MolduraAcesso } from '../components/MolduraAcesso';
import { useAuth } from '../lib/auth';
import { supabase, traduzirErro, urlBase } from '../lib/supabase';

type Tipo = 'membro' | 'adm';

const TIPOS = [
  {
    v: 'membro' as Tipo,
    titulo: 'Autora/Autor & Leitora/Leitor',
    texto: 'Participa dos ciclos de leitura e inscreve suas obras. Acesso liberado na hora.',
    icone: 'menu_book',
  },
  {
    v: 'adm' as Tipo,
    titulo: 'ADM (moderação)',
    texto: 'Audita leituras e organiza a grade. Precisa ser aprovada por uma ADM antes de ter acesso.',
    icone: 'shield_person',
  },
];

export function Cadastro() {
  const { sessao, carregando } = useAuth();
  const navegar = useNavigate();
  const [tipo, setTipo] = useState<Tipo>('membro');
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [aceito, setAceito] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [enviadoPara, setEnviadoPara] = useState('');

  if (!carregando && sessao && !enviando) return <Navigate to="/conta" replace />;

  const cadastrar = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setErro('');
    if (senha.length < 8) return setErro('A senha precisa ter pelo menos 8 caracteres.');
    if (senha !== confirmar) return setErro('As senhas não coincidem.');
    if (!aceito) return setErro('Para participar, é preciso aceitar o Protocolo de Honra.');

    setEnviando(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        data: { nome: nome.trim(), usuario: usuario.trim().replace(/^@+/, ''), tipo },
        emailRedirectTo: `${urlBase()}?confirmado=1`,
      },
    });
    setEnviando(false);
    if (error) return setErro(traduzirErro(error));
    // O Supabase não revela se o e-mail já existe; nesse caso devolve um usuário sem identidades.
    if (data.user && data.user.identities?.length === 0) return setErro(traduzirErro({ message: '', code: 'user_already_exists' }));
    if (data.session) navegar('/conta', { replace: true });
    else setEnviadoPara(email.trim());
  };

  if (enviadoPara) {
    return (
      <MolduraAcesso titulo="Confira seu e-mail">
        <div className="flex flex-col items-center text-center gap-space-md">
          <div className="w-16 h-16 rounded-full bg-primary-container/20 text-primary flex items-center justify-center">
            <Icone nome="mark_email_unread" className="text-[32px]" />
          </div>
          <p className="text-body-md text-on-surface">
            Enviamos um link de confirmação para <strong className="text-primary">{enviadoPara}</strong>.
          </p>
          <p className="text-body-sm text-on-surface-variant">
            Clique no link para ativar sua conta. Se não encontrar, procure na pasta de spam.
          </p>
          {tipo === 'adm' && (
            <Alerta tipo="info">
              Depois de confirmar o e-mail, sua solicitação de ADM vai para a fila de aprovação. Enquanto isso, você já
              pode usar o site como leitora/autora.
            </Alerta>
          )}
          <Link to="/entrar" className="btn-ghost w-full">
            Ir para o login
          </Link>
        </div>
      </MolduraAcesso>
    );
  }

  return (
    <MolduraAcesso titulo="Criar cadastro" subtitulo="Junte-se à constelação de autores independentes do Wattpad.">
      <form onSubmit={cadastrar} className="flex flex-col gap-space-md">
        <fieldset className="flex flex-col gap-2">
          <legend className="text-label-md text-on-surface-variant mb-1.5">Como você vai participar?</legend>
          {TIPOS.map((t) => (
            <label
              key={t.v}
              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer ring-1 transition-colors ${
                tipo === t.v
                  ? 'bg-surface-container-high ring-primary-container'
                  : 'bg-surface-container-lowest ring-outline-variant/50 hover:ring-outline'
              }`}
            >
              <input
                type="radio"
                name="tipo"
                value={t.v}
                checked={tipo === t.v}
                onChange={() => setTipo(t.v)}
                className="sr-only"
              />
              <Icone nome={t.icone} preenchido={tipo === t.v} className={`text-[22px] mt-0.5 ${tipo === t.v ? 'text-primary' : 'text-outline'}`} />
              <span className="flex-1">
                <span className="block text-body-md text-on-surface font-semibold">{t.titulo}</span>
                <span className="block text-body-sm text-on-surface-variant">{t.texto}</span>
              </span>
              <Icone
                nome={tipo === t.v ? 'radio_button_checked' : 'radio_button_unchecked'}
                className={`text-[20px] ${tipo === t.v ? 'text-primary' : 'text-outline'}`}
              />
            </label>
          ))}
        </fieldset>

        <Campo rotulo="Nome" icone="person" autoComplete="name" required maxLength={80} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como quer ser chamada(o)" />
        <Campo
          rotulo="Usuário no Wattpad"
          prefixo="@"
          required
          maxLength={40}
          value={usuario}
          onChange={(e) => setUsuario(e.target.value.replace(/^@+/, ''))}
          placeholder="seu_usuario"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <Campo rotulo="E-mail" icone="alternate_email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
        <div className="grid sm:grid-cols-2 gap-space-md">
          <CampoSenha rotulo="Senha" autoComplete="new-password" required minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} dica="Mínimo de 8 caracteres" />
          <CampoSenha rotulo="Confirmar senha" autoComplete="new-password" required value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
        </div>

        <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-lowest cursor-pointer">
          <input type="checkbox" checked={aceito} onChange={(e) => setAceito(e.target.checked)} className="mt-1 w-4 h-4 accent-primary-container" />
          <span className="text-body-sm text-on-surface-variant">
            Li e aceito o{' '}
            <Link to="/regras" target="_blank" className="text-primary hover:underline">
              Protocolo de Honra
            </Link>{' '}
            da Constelação: feedbacks 2+1, mínimo de 150 palavras, comprovação no Wattpad e política de strikes.
          </span>
        </label>

        <Alerta tipo="erro">{erro}</Alerta>
        <BotaoEnviar carregando={enviando}>
          <Icone nome="rocket_launch" className="text-[20px]" />
          {tipo === 'adm' ? 'Enviar solicitação de ADM' : 'Criar minha conta'}
        </BotaoEnviar>
      </form>
      <p className="text-body-sm text-on-surface-variant text-center mt-space-lg">
        Já tem conta?{' '}
        <Link to="/entrar" className="text-primary font-semibold hover:underline">
          Entrar
        </Link>
      </p>
    </MolduraAcesso>
  );
}
