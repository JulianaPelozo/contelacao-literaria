import { useEffect, useId, useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Autoria } from '../components/Autoria';
import { Capa } from '../components/Capa';
import { Carregando } from '../components/Carregando';
import { Alerta, BotaoEnviar } from '../components/Formulario';
import { Icone } from '../components/Icone';
import { LinkWattpad } from '../components/LinkWattpad';
import { Selo } from '../components/Medalhas';
import { obraPorId } from '../data/obras';
import { PALAVRAS_MINIMAS, contarPalavras } from '../data/regrasFeedback';
import { useAuth } from '../lib/auth';
import { useCiclo } from '../lib/ciclo';
import { useMeusFeedbacks } from '../lib/feedbacks';
import { autorDaLeitura, leituraNaGrade, normalizarUsuario, situacaoNaGrade } from '../lib/grade';
import { seloDaObra } from '../lib/selos';
import { supabase, traduzirErro } from '../lib/supabase';
import { formatarPrazo, tempoRestante, useAgora } from '../lib/tempo';

export function Feedback() {
  const { obraId = '' } = useParams();
  const { sessao, perfil, carregando } = useAuth();
  const { ciclo } = useCiclo();
  const agora = useAgora();
  const meus = useMeusFeedbacks();

  const obra = obraPorId(obraId);
  const naGrade = leituraNaGrade(ciclo, obraId);
  const existente = meus.dados?.find((f) => f.ciclo === ciclo.numero && f.obra === obraId);
  const restante = tempoRestante(ciclo.prazo, agora);
  const naoComecou = new Date(ciclo.inicio).getTime() > agora;
  const aberto = !restante.encerrado && !naoComecou;

  const [forte1, setForte1] = useState('');
  const [forte2, setForte2] = useState('');
  const [sugestao, setSugestao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [conquista, setConquista] = useState<'novo' | 'editado' | null>(null);

  useEffect(() => {
    if (existente) {
      setForte1(existente.forte_1);
      setForte2(existente.forte_2);
      setSugestao(existente.sugestao);
    }
  }, [existente]);

  const palavras = useMemo(() => contarPalavras(`${forte1} ${forte2} ${sugestao}`), [forte1, forte2, sugestao]);
  const situacao = situacaoNaGrade(ciclo, perfil?.usuario);
  const proxima = situacao.alvos.find(
    (a) => a.leitura.obra !== obraId && !meus.dados?.some((f) => f.ciclo === ciclo.numero && f.obra === a.leitura.obra),
  );

  if (carregando || (sessao && meus.carregando && !meus.dados)) return <Carregando />;
  if (!sessao) return <Navigate to="/entrar" replace state={{ de: `/feedback/${obraId}` }} />;
  if (!obra) return <Navigate to="/grade" replace />;

  const selo = seloDaObra(obra.id);
  const propria = !!naGrade && autorDaLeitura(naGrade.leitura) === normalizarUsuario(perfil?.usuario) && !!perfil?.usuario;

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase || !naGrade) return;
    setErro('');
    if (!forte1.trim() || !forte2.trim() || !sugestao.trim()) return setErro('Preencha os 2 pontos fortes e a sugestão (Fórmula 2+1).');
    if (palavras < PALAVRAS_MINIMAS) return setErro(`Faltam ${PALAVRAS_MINIMAS - palavras} palavras para o mínimo de ${PALAVRAS_MINIMAS}.`);
    setEnviando(true);
    const campos = { forte_1: forte1, forte_2: forte2, sugestao };
    const { error } = existente
      ? await supabase.from('feedbacks').update(campos).eq('id', existente.id)
      : await supabase.from('feedbacks').insert({ ciclo: ciclo.numero, obra: obra.id, ...campos });
    setEnviando(false);
    if (error) return setErro(error.code === '23505' ? 'Você já enviou um feedback para esta obra neste ciclo.' : traduzirErro(error));
    setConquista(existente ? 'editado' : 'novo');
    meus.recarregar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const apagar = async () => {
    if (!supabase || !existente) return;
    if (!window.confirm('Apagar este feedback? O selo dele também some.')) return;
    const { error } = await supabase.from('feedbacks').delete().eq('id', existente.id);
    if (error) return setErro(traduzirErro(error));
    setForte1('');
    setForte2('');
    setSugestao('');
    setConquista(null);
    meus.recarregar();
  };

  // --- Tela de comemoração -------------------------------------------------
  if (conquista) {
    return (
      <div className="max-w-xl mx-auto px-gutter-mobile pt-space-xl pb-space-lg flex flex-col items-center text-center gap-space-md">
        {conquista === 'novo' ? (
          <>
            <div className="surgir-selo">
              <Selo selo={selo} tamanho="lg" />
            </div>
            <p className="text-label-sm uppercase tracking-widest text-primary">Selo conquistado!</p>
            <h1 className="font-display text-headline-lg-mobile sm:text-headline-lg text-on-surface">{selo.nome}</h1>
            <p className="text-on-surface-variant">
              Seu feedback para <strong className="text-on-surface">{obra.titulo}</strong> foi registrado. {selo.lema.toLowerCase()}.
            </p>
          </>
        ) : (
          <>
            <Icone nome="task_alt" className="text-[56px] text-primary" />
            <h1 className="font-display text-headline-lg-mobile text-on-surface">Feedback atualizado</h1>
          </>
        )}
        {situacao.participa && (
          <p className="text-body-sm text-on-surface-variant">
            Meta da semana:{' '}
            <strong className="text-on-surface">
              {situacao.alvos.filter((a) => meus.dados?.some((f) => f.ciclo === ciclo.numero && f.obra === a.leitura.obra)).length} de{' '}
              {situacao.alvos.length}
            </strong>{' '}
            feedbacks
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-2 mt-space-sm">
          {proxima && (
            <Link to={`/feedback/${proxima.leitura.obra}`} className="btn-primary" onClick={() => setConquista(null)}>
              <Icone nome="arrow_forward" className="text-[18px]" /> Próxima: {obraPorId(proxima.leitura.obra)?.titulo ?? proxima.leitura.titulo}
            </Link>
          )}
          <Link to="/grade" className="btn-ghost">
            <Icone nome="checklist_rtl" className="text-[18px]" /> Voltar à grade
          </Link>
          <Link to="/conta" className="btn-ghost">
            <Icone nome="military_tech" className="text-[18px]" /> Minhas conquistas
          </Link>
        </div>
      </div>
    );
  }

  // --- Bloqueios ------------------------------------------------------------
  const bloqueio = !naGrade
    ? 'Esta obra não está na grade deste ciclo.'
    : propria
      ? 'Esta obra é sua — o feedback é para as obras das outras pessoas do grupo. 😉'
      : naoComecou
        ? `O ciclo ${ciclo.numero} ainda não começou.`
        : restante.encerrado && !existente
          ? 'O prazo deste ciclo já terminou.'
          : '';
  const somenteLeitura = !!existente && !aberto;

  return (
    <div className="max-w-3xl mx-auto px-gutter-mobile lg:px-margin pt-space-md lg:pt-space-lg flex flex-col gap-space-lg">
      <Link to="/grade" className="inline-flex items-center gap-1 text-label-md text-on-surface-variant hover:text-primary w-fit">
        <Icone nome="arrow_back" className="text-[16px]" /> Grade de leitura
      </Link>

      <section className="card p-space-md sm:p-space-lg flex gap-space-md">
        <LinkWattpad obra={obra} className="w-20 sm:w-24 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 self-start bg-surface-container-highest">
          <Capa obra={obra} />
        </LinkWattpad>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-label-sm uppercase tracking-widest text-primary">
            {existente ? 'Seu feedback' : 'Novo feedback'} • Ciclo {ciclo.numero}
          </span>
          <h1 className="font-display text-headline-sm sm:text-headline-md text-on-surface leading-tight">{obra.titulo}</h1>
          <Autoria obra={obra} />
          {naGrade && (
            <p className="text-body-sm text-on-surface-variant flex items-center gap-1">
              <Icone nome="menu_book" className="text-[15px] text-primary" /> {naGrade.grupo.nome} • capítulos {naGrade.leitura.capitulos}
            </p>
          )}
          <p className="text-body-sm text-on-surface-variant flex items-center gap-1">
            <Icone nome="schedule" className="text-[15px] text-primary" />
            {aberto ? `${restante.curto} • até ${formatarPrazo(ciclo.prazo)}` : restante.encerrado ? 'Ciclo encerrado' : 'Ainda não começou'}
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-center gap-1 ml-auto text-center">
          <Selo selo={selo} apagado={!existente} />
          <span className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant max-w-[90px]">{selo.nome}</span>
        </div>
      </section>

      {bloqueio ? (
        <Alerta tipo="info">{bloqueio}</Alerta>
      ) : (
        <form onSubmit={enviar} className="flex flex-col gap-space-md">
          <Alerta tipo="info">
            <strong>Fórmula 2+1:</strong> dois pontos fortes (narrativa, ritmo, personagens…) e uma sugestão carinhosa de
            melhoria. No total, pelo menos {PALAVRAS_MINIMAS} palavras. Comentários genéricos não contam.
          </Alerta>

          <AreaTexto rotulo="1º ponto forte" icone="star" valor={forte1} mudar={setForte1} desativado={somenteLeitura}
            dica="O que mais te prendeu? Um personagem, uma cena, o ritmo…" />
          <AreaTexto rotulo="2º ponto forte" icone="star" valor={forte2} mudar={setForte2} desativado={somenteLeitura}
            dica="Outro acerto: diálogos, ambientação, voz narrativa, coerência…" />
          <AreaTexto rotulo="Sugestão carinhosa" icone="lightbulb" valor={sugestao} mudar={setSugestao} desativado={somenteLeitura}
            dica="Uma melhoria concreta, com gentileza e exemplos." />

          <div className="flex items-center gap-space-sm">
            <div className="flex-1 h-2 rounded-full bg-surface-container-highest overflow-hidden" aria-hidden="true">
              <div
                className={`h-full rounded-full transition-all ${palavras >= PALAVRAS_MINIMAS ? 'bg-primary' : 'bg-primary/50'}`}
                style={{ width: `${Math.min(100, (palavras / PALAVRAS_MINIMAS) * 100)}%` }}
              />
            </div>
            <span className={`text-label-md whitespace-nowrap ${palavras >= PALAVRAS_MINIMAS ? 'text-primary' : 'text-on-surface-variant'}`} aria-live="polite">
              {palavras} / {PALAVRAS_MINIMAS} palavras
            </span>
          </div>

          <Alerta tipo="erro">{erro}</Alerta>

          {somenteLeitura ? (
            <Alerta tipo="info">O ciclo terminou; este feedback não pode mais ser editado.</Alerta>
          ) : (
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              {existente && (
                <button type="button" onClick={apagar} className="btn-ghost hover:text-error">
                  <Icone nome="delete" className="text-[18px]" /> Apagar
                </button>
              )}
              <BotaoEnviar carregando={enviando} className="sm:w-auto sm:px-8">
                <Icone nome={existente ? 'save' : 'send'} className="text-[18px]" />
                {existente ? 'Salvar alterações' : 'Enviar feedback'}
              </BotaoEnviar>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

function AreaTexto({
  rotulo,
  icone,
  valor,
  mudar,
  dica,
  desativado,
}: {
  rotulo: string;
  icone: string;
  valor: string;
  mudar: (v: string) => void;
  dica: string;
  desativado?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label-md text-on-surface-variant flex items-center gap-1.5">
        <Icone nome={icone} preenchido className="text-[16px] text-primary" /> {rotulo}
        <span className="text-primary">*</span>
        <span className="ml-auto font-normal text-on-surface-variant/70">{contarPalavras(valor)} palavras</span>
      </label>
      <textarea
        id={id}
        value={valor}
        onChange={(e) => mudar(e.target.value)}
        disabled={desativado}
        required
        rows={5}
        maxLength={5000}
        placeholder={dica}
        className="w-full rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-outline/70 text-body-md p-3.5 ring-1 ring-outline-variant/60 focus:ring-2 focus:ring-primary-container focus:outline-none transition-shadow resize-y disabled:opacity-70"
      />
    </div>
  );
}

/** Remonta a página ao trocar de obra (ex.: botão "Próxima"), para limpar o formulário. */
export function FeedbackRota() {
  const { obraId } = useParams();
  return <Feedback key={obraId} />;
}
