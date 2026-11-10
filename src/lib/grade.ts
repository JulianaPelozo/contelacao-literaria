import { obraPorId } from '../data/obras';
import type { Ciclo, Grupo, Leitura } from '../data/tipos';

export const normalizarUsuario = (u?: string | null) => (u ?? '').trim().replace(/^@+/, '').toLowerCase();

/** @ da autora de uma leitura (gravado na grade; se faltar, vem da vitrine). */
export const autorDaLeitura = (l: Leitura) => normalizarUsuario(l.usuario || obraPorId(l.obra)?.usuario);

export interface Alvo {
  grupo: Grupo;
  leitura: Leitura;
}

/**
 * Situação de uma pessoa na grade (mesma regra do banco, em minhas_metas):
 * participa se alguma obra da grade é dela; a meta são as demais obras dos grupos dela.
 */
export function situacaoNaGrade(ciclo: Ciclo, usuario?: string | null) {
  const eu = normalizarUsuario(usuario);
  const minhas = new Set<string>();
  const alvos: Alvo[] = [];
  if (eu) {
    for (const g of ciclo.grupos) {
      const meuGrupo = g.leituras.some((l) => autorDaLeitura(l) === eu);
      for (const l of g.leituras) {
        if (autorDaLeitura(l) === eu) minhas.add(l.obra);
        else if (meuGrupo && !alvos.some((a) => a.leitura.obra === l.obra)) alvos.push({ grupo: g, leitura: l });
      }
    }
  }
  return { participa: minhas.size > 0, minhas, alvos };
}

/** Onde a obra está na grade do ciclo (ou undefined). */
export function leituraNaGrade(ciclo: Ciclo, obra: string): Alvo | undefined {
  for (const g of ciclo.grupos) {
    const l = g.leituras.find((x) => x.obra === obra);
    if (l) return { grupo: g, leitura: l };
  }
  return undefined;
}
