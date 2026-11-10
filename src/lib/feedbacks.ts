import { useCallback, useEffect, useState } from 'react';
import { SEMANAS_PARA_TOTEM } from '../data/regrasFeedback';
import { useAuth } from './auth';
import { supabase, traduzirErro } from './supabase';

/** Linha da tabela `feedbacks` (ver supabase/schema.sql). */
export interface FeedbackLinha {
  id: string;
  leitor: string;
  ciclo: number;
  obra: string;
  forte_1: string;
  forte_2: string;
  sugestao: string;
  obra_titulo: string;
  autor_usuario: string;
  leitor_nome: string;
  leitor_usuario: string;
  criado_em: string;
  atualizado_em: string;
}

export interface MetaCiclo {
  ciclo: number;
  inicio: string;
  prazo: string;
  meta: number;
  feitos: number;
}

function useConsulta<T>(buscar: (() => PromiseLike<{ data: T | null; error: { message: string; code?: string } | null }>) | null) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(!!buscar);

  const recarregar = useCallback(async () => {
    if (!buscar) return;
    setCarregando(true);
    const { data, error } = await buscar();
    setCarregando(false);
    if (error) setErro(traduzirErro(error));
    else {
      setErro('');
      setDados(data);
    }
  }, [buscar]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { dados, erro, carregando, recarregar };
}

/** Todos os feedbacks escritos pela pessoa logada (mais recentes primeiro). */
export function useMeusFeedbacks() {
  const { sessao } = useAuth();
  const uid = sessao?.user.id;
  const buscar = useCallback(
    () =>
      supabase!
        .from('feedbacks')
        .select('*')
        .eq('leitor', uid!)
        .order('criado_em', { ascending: false })
        .returns<FeedbackLinha[]>(),
    [uid],
  );
  return useConsulta<FeedbackLinha[]>(supabase && uid ? buscar : null);
}

/** Feedbacks recebidos por uma obra, ou por todas as obras de um @. */
export function useFeedbacksRecebidos(filtro: { obra?: string; autor?: string }) {
  const { obra, autor } = filtro;
  const buscar = useCallback(() => {
    let q = supabase!.from('feedbacks').select('*');
    if (obra) q = q.eq('obra', obra);
    if (autor) q = q.eq('autor_usuario', autor);
    return q.order('criado_em', { ascending: false }).limit(100).returns<FeedbackLinha[]>();
  }, [obra, autor]);
  return useConsulta<FeedbackLinha[]>(supabase && (obra || autor) ? buscar : null);
}

/** Metas da pessoa logada em cada ciclo já iniciado. */
export function useMetas() {
  const { sessao } = useAuth();
  const uid = sessao?.user.id;
  const buscar = useCallback(
    async () => {
      const { data, error } = await supabase!.rpc('minhas_metas');
      return { data: data as MetaCiclo[] | null, error };
    },
    [uid], // eslint-disable-line react-hooks/exhaustive-deps -- refaz a consulta ao trocar de conta
  );
  return useConsulta<MetaCiclo[]>(supabase && uid ? buscar : null);
}

/**
 * Totens: a cada SEMANAS_PARA_TOTEM ciclos seguidos com a meta cumprida, um totem.
 * Um ciclo encerrado sem a meta (ou sem a pessoa na grade) zera a sequência;
 * o ciclo em andamento só conta quando a meta é batida.
 */
export function calcularConquistas(metas: MetaCiclo[], agora = Date.now()) {
  let sequencia = 0;
  let totens = 0;
  let cumpridos = 0;
  for (const m of [...metas].sort((a, b) => a.ciclo - b.ciclo)) {
    const cumprida = m.meta > 0 && m.feitos >= m.meta;
    if (cumprida) {
      cumpridos++;
      sequencia++;
      if (sequencia % SEMANAS_PARA_TOTEM === 0) totens++;
    } else if (new Date(m.prazo).getTime() < agora) {
      sequencia = 0;
    }
  }
  return { totens, sequencia, rumoAoTotem: sequencia % SEMANAS_PARA_TOTEM, cumpridos };
}
