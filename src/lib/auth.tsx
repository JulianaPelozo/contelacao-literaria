import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

export interface Perfil {
  id: string;
  nome: string;
  usuario: string;
  email: string;
  tipo: 'membro' | 'adm';
  status: 'ativo' | 'pendente';
  primordial: boolean;
  aprovado_em: string | null;
  criado_em: string;
}

interface Auth {
  carregando: boolean;
  sessao: Session | null;
  perfil: Perfil | null;
  /** ADM aprovada (a checagem real é feita no banco; isto só controla a interface) */
  ehAdm: boolean;
  /** Mensagem vinda de um link de e-mail (ex.: link expirado) */
  erroLink: string;
  recarregarPerfil: () => Promise<void>;
  sair: () => Promise<void>;
}

const Contexto = createContext<Auth | null>(null);

// Lidos uma única vez, antes que o Supabase limpe o ?code= da URL.
const paramsIniciais = new URLSearchParams(window.location.search);
const destinoInicial = paramsIniciais.has('recuperar')
  ? '/redefinir-senha'
  : paramsIniciais.has('confirmado')
    ? '/conta'
    : null;
const erroInicial = paramsIniciais.get('error_description') ?? '';

export function AuthProvider({ children }: { children: ReactNode }) {
  const navegar = useNavigate();
  const [sessao, setSessao] = useState<Session | null>(null);
  const [sessaoPronta, setSessaoPronta] = useState(!supabase);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  /** id da conta cujo perfil já foi buscado (evita um instante com sessão mas sem perfil) */
  const [perfilDe, setPerfilDe] = useState<string | undefined>(undefined);
  const uid = sessao?.user.id;

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setSessaoPronta(true);
    });
    const { data } = supabase.auth.onAuthStateChange((evento, s) => {
      setSessao(s);
      if (evento === 'PASSWORD_RECOVERY') navegar('/redefinir-senha');
    });
    return () => data.subscription.unsubscribe();
  }, [navegar]);

  // Volta de link de e-mail (confirmação / recuperação): limpa a URL e leva à tela certa.
  useEffect(() => {
    if (!sessaoPronta) return;
    if (destinoInicial || erroInicial) {
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
    if (erroInicial) navegar('/entrar');
    else if (destinoInicial && sessao)
      navegar(destinoInicial, {
        state: destinoInicial === '/conta' ? { aviso: 'E-mail confirmado! Boas-vindas à Constelação.' } : undefined,
      });
  }, [sessaoPronta]); // eslint-disable-line react-hooks/exhaustive-deps

  const carregarPerfil = useCallback(async (id: string | undefined) => {
    if (!supabase || !id) {
      setPerfil(null);
      setPerfilDe(undefined);
      return;
    }
    const { data } = await supabase.from('perfis').select('*').eq('id', id).maybeSingle();
    setPerfil((data as Perfil | null) ?? null);
    setPerfilDe(id);
  }, []);

  useEffect(() => {
    carregarPerfil(uid);
  }, [uid, carregarPerfil]);

  const sair = useCallback(async () => {
    await supabase?.auth.signOut();
    setPerfil(null);
    navegar('/');
  }, [navegar]);

  const valor: Auth = {
    carregando: !sessaoPronta || (!!uid && perfilDe !== uid),
    sessao,
    perfil,
    ehAdm: perfil?.tipo === 'adm' && perfil.status === 'ativo',
    erroLink: erroInicial,
    recarregarPerfil: () => carregarPerfil(uid),
    sair,
  };

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth() {
  const c = useContext(Contexto);
  if (!c) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return c;
}
