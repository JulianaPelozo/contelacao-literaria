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

/** Data ('AAAA-MM-DD') e hora ('HH:MM') de um instante, no horário de Brasília. */
export function partesBrasilia(iso: string) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(iso))
      .map((x) => [x.type, x.value]),
  );
  return { data: `${p.year}-${p.month}-${p.day}`, hora: `${p.hour}:${p.minute}` };
}

/** Monta um instante ISO a partir de data e hora de Brasília (sem horário de verão desde 2019). */
export const deBrasilia = (data: string, hora = '00:00') => `${data}T${hora}:00-03:00`;

/** Soma dias a uma data 'AAAA-MM-DD'. */
export function somarDias(data: string, dias: number) {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Segunda-feira da semana atual (Brasília), como 'AAAA-MM-DD'. */
export function segundaDestaSemana(agora = Date.now()) {
  const hoje = partesBrasilia(new Date(agora).toISOString()).data;
  const diaSemana = new Date(`${hoje}T12:00:00Z`).getUTCDay(); // 0 = domingo
  return somarDias(hoje, diaSemana === 0 ? -6 : 1 - diaSemana);
}
