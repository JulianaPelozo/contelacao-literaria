/**
 * Regras do feedback usadas no formulário.
 * O banco confere as mesmas regras (supabase/schema.sql → palavras_minimas, feedbacks_validar);
 * se mudar aqui, mude lá também.
 */
export const PALAVRAS_MINIMAS = 150;

/** Feedbacks seguidos para ganhar um totem (uma semana = um ciclo). */
export const SEMANAS_PARA_TOTEM = 4;

export const contarPalavras = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
