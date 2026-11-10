import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider } from './lib/auth';
import { CicloProvider } from './lib/ciclo';
import { EditorGrade } from './pages/EditorGrade';
import { FeedbackRota } from './pages/Feedback';
import { Cadastro } from './pages/Cadastro';
import { Conta } from './pages/Conta';
import { Entrar } from './pages/Entrar';
import { PainelAdm } from './pages/PainelAdm';
import { RedefinirSenha } from './pages/RedefinirSenha';
import { Grade } from './pages/Grade';
import { Inicio } from './pages/Inicio';
import { NaoEncontrada } from './pages/NaoEncontrada';
import { ObraDetalhes } from './pages/ObraDetalhes';
import { Regras } from './pages/Regras';

// HashRouter: as rotas ficam em #/..., então o site funciona em qualquer hospedagem estática
// (GitHub Pages, Netlify etc.) sem configurar redirecionamentos.
export default function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
      <CicloProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="grade" element={<Grade />} />
          <Route path="obra/:id" element={<ObraDetalhes />} />
          <Route path="feedback/:obraId" element={<FeedbackRota />} />
          <Route path="regras" element={<Regras />} />
          <Route path="entrar" element={<Entrar />} />
          <Route path="cadastro" element={<Cadastro />} />
          <Route path="redefinir-senha" element={<RedefinirSenha />} />
          <Route path="conta" element={<Conta />} />
          <Route path="adm" element={<PainelAdm />} />
          <Route path="adm/grade" element={<EditorGrade />} />
          <Route path="*" element={<NaoEncontrada />} />
        </Route>
      </Routes>
      </CicloProvider>
      </AuthProvider>
    </HashRouter>
  );
}
