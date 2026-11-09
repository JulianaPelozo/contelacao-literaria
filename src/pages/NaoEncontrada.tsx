import { Link } from 'react-router-dom';
import { Icone } from '../components/Icone';

export function NaoEncontrada({ mensagem = 'Essa página se perdeu no espaço profundo.' }: { mensagem?: string }) {
  return (
    <div className="max-w-xl mx-auto px-gutter-mobile py-space-xl text-center flex flex-col items-center gap-space-md">
      <Icone nome="satellite_alt" className="text-[56px] text-primary/70" />
      <h1 className="font-display text-headline-lg-mobile text-on-surface">Fora de órbita</h1>
      <p className="text-on-surface-variant">{mensagem}</p>
      <Link to="/" className="btn-primary">
        <Icone nome="home" className="text-[18px]" /> Voltar à vitrine
      </Link>
    </div>
  );
}
