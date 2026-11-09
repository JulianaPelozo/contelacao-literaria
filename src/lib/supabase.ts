import { createClient, type AuthError } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** `null` quando o Supabase ainda não foi configurado (.env.local). O resto do site funciona normalmente. */
export const supabase =
  url && chave
    ? createClient(url, chave, {
        auth: {
          // PKCE devolve o código na query (?code=...), o que não conflita com as rotas em #/
          flowType: 'pkce',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export const supabaseConfigurado = supabase !== null;

/** Endereço base do site (funciona em subpastas, ex.: GitHub Pages). */
export const urlBase = () => window.location.origin + window.location.pathname;

const MENSAGENS: Record<string, string> = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_not_confirmed: 'Confirme seu e-mail antes de entrar. Procure a mensagem na sua caixa de entrada (e no spam).',
  user_already_exists: 'Já existe uma conta com este e-mail.',
  email_exists: 'Já existe uma conta com este e-mail.',
  weak_password: 'Senha muito fraca. Use pelo menos 8 caracteres, misturando letras e números.',
  same_password: 'A nova senha precisa ser diferente da atual.',
  over_email_send_rate_limit: 'Muitos e-mails enviados em pouco tempo. Aguarde alguns minutos e tente de novo.',
  over_request_rate_limit: 'Muitas tentativas. Aguarde um pouco e tente de novo.',
  email_address_invalid: 'Este endereço de e-mail não é válido.',
  signup_disabled: 'Novos cadastros estão desativados no momento.',
};

export function traduzirErro(erro: AuthError | { message: string; code?: string } | null | undefined) {
  if (!erro) return '';
  if (erro.code && MENSAGENS[erro.code]) return MENSAGENS[erro.code];
  const m = erro.message || '';
  if (/invalid login credentials/i.test(m)) return MENSAGENS.invalid_credentials;
  if (/email not confirmed/i.test(m)) return MENSAGENS.email_not_confirmed;
  if (/already registered/i.test(m)) return MENSAGENS.user_already_exists;
  if (/failed to fetch|network/i.test(m)) return 'Sem conexão com o servidor. Verifique sua internet.';
  return m || 'Algo deu errado. Tente novamente.';
}
