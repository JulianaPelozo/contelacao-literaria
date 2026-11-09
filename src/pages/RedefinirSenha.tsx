import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alerta, BotaoEnviar, CampoSenha } from '../components/Formulario';
import { Icone } from '../components/Icone';
import { MolduraAcesso } from '../components/MolduraAcesso';
import { useAuth } from '../lib/auth';
import { supabase, traduzirErro } from '../lib/supabase';

export function RedefinirSenha() {
  const { sessao, carregando } = useAuth();
  const navegar = useNavigate();
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setErro('');
    if (senha.length < 8) return setErro('A senha precisa ter pelo menos 8 caracteres.');
    if (senha !== confirmar) return setErro('As senhas não coincidem.');
    setEnviando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setEnviando(false);
    if (error) return setErro(traduzirErro(error));
    navegar('/conta', { replace: true, state: { aviso: 'Senha atualizada com sucesso!' } });
  };

  if (!carregando && !sessao) {
    return (
      <MolduraAcesso titulo="Link inválido ou expirado">
        <div className="flex flex-col gap-space-md">
          <Alerta tipo="erro">
            Não foi possível validar o link de recuperação. Peça um novo link e abra-o neste mesmo navegador.
          </Alerta>
          <Link to="/entrar" className="btn-ghost">
            Voltar para o login
          </Link>
        </div>
      </MolduraAcesso>
    );
  }

  return (
    <MolduraAcesso titulo="Nova senha" subtitulo="Escolha uma nova senha para sua conta.">
      <form onSubmit={salvar} className="flex flex-col gap-space-md">
        <CampoSenha rotulo="Nova senha" autoComplete="new-password" required minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} dica="Mínimo de 8 caracteres" />
        <CampoSenha rotulo="Confirmar nova senha" autoComplete="new-password" required value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
        <Alerta tipo="erro">{erro}</Alerta>
        <BotaoEnviar carregando={enviando}>
          <Icone nome="lock_reset" className="text-[20px]" /> Salvar nova senha
        </BotaoEnviar>
      </form>
    </MolduraAcesso>
  );
}
