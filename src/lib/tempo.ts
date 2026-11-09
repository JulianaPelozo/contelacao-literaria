import { useEffect, useState } from 'react';

/** Re-renderiza a cada minuto, para a contagem regressiva ficar atualizada. */
export function useAgora(intervaloMs = 60_000) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), intervaloMs);
    return () => clearInterval(t);
  }, [intervaloMs]);
  return agora;
}

export function tempoRestante(prazoISO: string, agora: number) {
  const ms = new Date(prazoISO).getTime() - agora;
  if (ms <= 0) return { encerrado: true, curto: 'Ciclo encerrado', longo: 'Ciclo encerrado' };
  const min = Math.floor(ms / 60_000);
  const dias = Math.floor(min / 1440);
  const horas = Math.floor((min % 1440) / 60);
  const minutos = min % 60;
  const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;
  const curto =
    dias > 0 ? `Faltam ${plural(dias, 'dia', 'dias')}` : horas > 0 ? `Faltam ${horas}h` : `Faltam ${minutos} min`;
  const longo =
    dias > 0
      ? `Faltam ${plural(dias, 'dia', 'dias')}, ${horas}h e ${minutos}min`
      : `Faltam ${horas}h e ${minutos}min`;
  return { encerrado: false, curto, longo };
}

/** Fração do ciclo já decorrida (0 a 1). */
export function progressoCiclo(inicioISO: string, prazoISO: string, agora: number) {
  const ini = new Date(inicioISO).getTime();
  const fim = new Date(prazoISO).getTime();
  return Math.min(1, Math.max(0, (agora - ini) / (fim - ini)));
}

export function formatarPrazo(prazoISO: string) {
  const d = new Date(prazoISO);
  const dia = d.toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'America/Sao_Paulo' });
  const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)}, ${data} às ${hora}`;
}
