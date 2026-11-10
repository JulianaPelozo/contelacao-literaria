import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { cicloAtual as cicloReserva } from '../data/ciclo';
import type { Ciclo, Grupo } from '../data/tipos';
import { supabase } from './supabase';

/** Linha da tabela `ciclos` no Supabase (ver supabase/schema.sql). */
export interface LinhaCiclo {
  numero: number;
  inicio: string;
  prazo: string;
  grupos: Grupo[];
  publicado: boolean;
  atualizado_em?: string;
}

const CHAVE_CACHE = 'ciclo-atual';

function lerCache(): Ciclo | null {
  try {
    const v = localStorage.getItem(CHAVE_CACHE);
    return v ? (JSON.parse(v) as Ciclo) : null;
  } catch {
    return null;
  }
}

function salvarCache(c: Ciclo) {
  try {
    localStorage.setItem(CHAVE_CACHE, JSON.stringify(c));
  } catch {
    /* sem armazenamento: só não fica em cache */
  }
}

/**
 * Entre os ciclos publicados, o vigente é o de maior número que já começou.
 * Se nenhum começou ainda, mostra o próximo a começar.
 */
export function escolherVigente(publicados: LinhaCiclo[], agora = Date.now()): LinhaCiclo | null {
  const ordem = [...publicados].sort((a, b) => b.numero - a.numero);
  return (
    ordem.find((c) => new Date(c.inicio).getTime() <= agora) ??
    ordem.sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())[0] ??
    null
  );
}

const paraCiclo = (l: LinhaCiclo): Ciclo => ({
  numero: l.numero,
  inicio: l.inicio,
  prazo: l.prazo,
  grupos: Array.isArray(l.grupos) ? l.grupos : [],
});

interface ContextoCiclo {
  ciclo: Ciclo;
  recarregar: () => Promise<void>;
}

const Contexto = createContext<ContextoCiclo>({ ciclo: cicloReserva, recarregar: async () => {} });

/**
 * Carrega a grade publicada no Supabase. Enquanto carrega (ou sem internet),
 * usa a última grade vista neste aparelho; sem nada disso, usa src/data/ciclo.ts.
 */
export function CicloProvider({ children }: { children: ReactNode }) {
  const [ciclo, setCiclo] = useState<Ciclo>(() => lerCache() ?? cicloReserva);

  const recarregar = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('ciclos')
      .select('numero, inicio, prazo, grupos, publicado')
      .eq('publicado', true)
      .order('numero', { ascending: false })
      .limit(10);
    if (error || !data) return;
    const vigente = escolherVigente(data as LinhaCiclo[]);
    const novo = vigente ? paraCiclo(vigente) : cicloReserva;
    setCiclo(novo);
    salvarCache(novo);
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return <Contexto.Provider value={{ ciclo, recarregar }}>{children}</Contexto.Provider>;
}

export const useCiclo = () => useContext(Contexto);
