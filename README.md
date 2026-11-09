# Constelação Literária

Site estático (React + Vite + Tailwind), responsivo e instalável como app (PWA), para os ciclos de leitura
recíproca entre autoras e autores do Wattpad. O conteúdo (obras, grade, regras) fica em arquivos dentro de
`src/data/`; só as **contas** (login, cadastro e aprovação de ADMs) usam o [Supabase](https://supabase.com).

O protótipo original (gerado no Stitch) continua em [`prototipo/`](prototipo/).

## Páginas

| Rota          | Conteúdo                                                                  |
| ------------- | ------------------------------------------------------------------------- |
| `#/`          | Vitrine: destaques, recém-chegadas, todas as obras, busca e filtro        |
| `#/grade`     | Grade de leitura do ciclo, por grupo, com contagem regressiva             |
| `#/obra/<id>` | Detalhes da obra: sinopse, dados, feedbacks e se está na grade da semana  |
| `#/regras`    | Como funciona, Protocolo de Honra, regulamento, ritmos e grupos           |
| `#/entrar`    | Login (abas "Autor & Leitor" e "Mesa ADM") e recuperação de senha         |
| `#/cadastro`  | Cadastro como leitora/autora ou como ADM                                  |
| `#/conta`     | Minha conta: dados, status da solicitação de ADM, sair                    |
| `#/adm`       | Painel ADM: aprovar/recusar novas ADMs e ver membros (só ADMs aprovadas)  |

Na vitrine e na grade, **clicar na capa abre a obra direto no Wattpad** (nova aba).
O título leva para a página de detalhes.

## Como editar o conteúdo

- **Obras** → [`src/data/obras.json`](src/data/obras.json)
  Para cadastrar uma história nova, basta o link do Wattpad:

  ```bash
  npm run obra:adicionar -- https://www.wattpad.com/story/123456789-titulo
  ```

  O script busca título, @, sinopse, capa, capítulos, status e classificação, e já marca a obra como
  recém-chegada (`"nova": true`). Depois, revise no JSON os gêneros, os `avisos` de conteúdo e a sinopse (às vezes
  ela traz notas do autor). Para atualizar capítulos, status e capa de todas as obras de uma vez:

  ```bash
  npm run obras:atualizar
  ```

  Outros campos que você pode mudar à mão: `"destaque": true` (vai para "Constelações em Destaque"), remover
  `"nova"` (sai de "Recém-chegadas") e `"autora"` (nome exibido; sem ele, aparece só o @).
- **Grade da semana** → [`src/data/ciclo.ts`](src/data/ciclo.ts)
  Número do ciclo, datas de início/prazo e as leituras de cada grupo (usando o `id` da obra, que aparece no
  `obras.json` e na URL `#/obra/<id>`). Com a lista de grupos vazia, a página mostra "grade em preparação".
- **Textos** (dica da semana, regras, frase do rodapé) → [`src/data/site.ts`](src/data/site.ts)

Na grade, cada pessoa pode marcar as leituras como lidas; isso fica salvo apenas no navegador dela.

## Contas e ADMs

- Leitoras/autoras se cadastram e já podem entrar (depois de confirmar o e-mail).
- Quem se cadastra como **ADM** fica **pendente** até uma ADM aprovada aprovar no Painel ADM. Enquanto isso, usa o
  site como leitora/autora. Se for recusada, a conta continua existindo, só que sem acesso ADM.
- A conta de **julianapelozopacheco@gmail.com** é a **ADM Primordial**: já nasce aprovada.
- As regras de permissão ficam no banco ([`supabase/schema.sql`](supabase/schema.sql)), e não no site. Assim,
  ninguém consegue se promover a ADM mexendo no navegador.

### Configurando o Supabase (uma vez só)

1. Crie uma conta e um projeto em [supabase.com](https://supabase.com). Na região, prefira *South America (São Paulo)*.
2. No painel do projeto, abra **SQL Editor → New query**, cole todo o conteúdo de
   [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**.
3. Em **Authentication → Sign In / Providers → Email**, deixe **Confirm email** ativado. Isso é importante: é a
   confirmação do e-mail que garante que só a dona do e-mail primordial vira ADM Primordial.
4. Em **Authentication → URL Configuration**:
   - **Site URL**: o endereço do site publicado, ex.: `https://SEU-USUARIO.github.io/contelacao-literaria/`
   - **Redirect URLs**: adicione `https://SEU-USUARIO.github.io/contelacao-literaria/**` e
     `http://localhost:5173/**`
5. Em **Project Settings → API**, copie a *Project URL* e a chave *anon public*:
   - para rodar no seu computador: copie `.env.example` para `.env.local` e preencha;
   - para o site publicado: no GitHub, abra **Settings → Secrets and variables → Actions → Variables** e crie
     `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

   A chave *anon* é pública por natureza (vai junto do site). Nunca use a chave *service_role* aqui.
6. **Conta da Juliana:** abra o site em `#/cadastro`, cadastre-se com `julianapelozopacheco@gmail.com` e confirme o
   e-mail. A conta já entra como ADM Primordial.

> O envio de e-mails embutido no Supabase tem um limite baixo (poucos e-mails por hora) e serve para testes. Quando
> a comunidade começar a se cadastrar, configure um SMTP próprio em **Authentication → Emails → SMTP Settings**
> (ex.: Resend, Brevo). Os textos dos e-mails podem ser traduzidos em **Authentication → Emails → Templates**.

## Rodando localmente

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run build     # gera o site em dist/
npm run preview   # serve o dist/ (útil para testar o PWA)
```

## Publicação

O workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) publica no GitHub Pages a cada push na
`main`. Para ativar: no GitHub, **Settings → Pages → Source: GitHub Actions**.

O site também funciona em qualquer hospedagem estática (Netlify, Vercel, Cloudflare Pages): basta enviar a pasta
`dist/`. Como as rotas usam `#/`, não é preciso configurar redirecionamentos.

## PWA

O app pode ser instalado na tela inicial (o ícone de instalação aparece no cabeçalho quando o navegador permite)
e funciona offline depois da primeira visita. Os ícones ficam em `public/`; a arte-fonte está em
[`assets/icone.svg`](assets/icone.svg).
