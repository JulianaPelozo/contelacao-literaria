# Constelação Literária

Site estático (React + Vite + Tailwind), responsivo e instalável como app (PWA), para os ciclos de leitura
recíproca entre autoras e autores do Wattpad. Não tem backend: todo o conteúdo fica em arquivos dentro de `src/data/`.

O protótipo original (gerado no Stitch) continua em [`prototipo/`](prototipo/).

## Páginas

| Rota          | Conteúdo                                                                  |
| ------------- | ------------------------------------------------------------------------- |
| `#/`          | Vitrine: destaques, recém-chegadas, todas as obras, busca e filtro        |
| `#/grade`     | Grade de leitura do ciclo, por grupo, com contagem regressiva             |
| `#/obra/<id>` | Detalhes da obra: sinopse, dados, feedbacks e se está na grade da semana  |
| `#/regras`    | Como funciona, Protocolo de Honra, regulamento, ritmos e grupos           |

Na vitrine e na grade, **clicar na capa abre a obra direto no Wattpad** (nova aba).
O título leva para a página de detalhes.

## Como editar o conteúdo

- **Obras** → [`src/data/obras.ts`](src/data/obras.ts)
  As obras atuais são fictícias. Para cada obra real, preencha `wattpad` com o link da história e, se quiser a
  capa original, `capa` com o endereço da imagem (no Wattpad: botão direito na capa → "Copiar endereço da imagem").
  Sem `capa`, o site desenha uma capa automática com o título.
  `destaque: true` coloca a obra em "Constelações em Destaque"; `nova: true`, em "Recém-chegadas".
- **Grade da semana** → [`src/data/ciclo.ts`](src/data/ciclo.ts)
  Número do ciclo, datas de início/prazo e as leituras de cada grupo (usando o `id` da obra).
- **Textos** (dica da semana, regras, frase do rodapé) → [`src/data/site.ts`](src/data/site.ts)

Na grade, cada pessoa pode marcar as leituras como lidas; isso fica salvo apenas no navegador dela.

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
