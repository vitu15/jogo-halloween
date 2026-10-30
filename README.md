# MALDIÇÃO: Faça ou Beba 🎃

Jogo de cartas de Halloween para celular. Um baralho, um celular, várias vítimas: puxe uma carta, leia em voz alta e cumpra — ou beba.

- **53 cartas** em 3 categorias: desafios, perguntas e penalidades de rodada
- Cartas não se repetem até o baralho acabar; a partida fica salva no aparelho
- 6 trilhas sonoras de terror, efeitos sonoros sintetizados e vibração
- Configurações de categorias, som, música, animações e intensidade visual

> Beba com responsabilidade. Quem não quiser beber pode escolher outra penalidade combinada com o grupo. Não dirija depois de beber.

## Stack

| Parte     | Tecnologia                                              |
| --------- | ------------------------------------------------------- |
| Frontend  | JavaScript (ES modules) + CSS puro, empacotado com Vite |
| Backend   | Node.js + Express 5 (API REST + serve o frontend)       |
| Testes    | Vitest (frontend) e `node:test` + Supertest (backend)   |
| Qualidade | ESLint, Prettier, EditorConfig, GitHub Actions          |

Sem frameworks de UI: o jogo é leve e roda em qualquer celular.

## Estrutura

```
.
├── frontend/              # Aplicação web (o jogo)
│   ├── index.html
│   ├── public/audio/      # Trilhas sonoras (.mp3)
│   ├── src/
│   │   ├── domain/        # Regras puras: baralho, categorias, estado
│   │   ├── application/   # Casos de uso da partida (GameSession)
│   │   ├── infrastructure/# localStorage, Web Audio, música, vibração
│   │   ├── presentation/  # Views, controllers, componentes, templates
│   │   ├── config/        # Lista de trilhas
│   │   ├── shared/utils/  # Utilitários genéricos
│   │   ├── styles/        # CSS dividido por responsabilidade
│   │   └── main.js        # Raiz de composição
│   └── tests/
├── backend/               # API + servidor de produção
│   ├── src/
│   │   ├── config/        # Variáveis de ambiente
│   │   ├── modules/       # cards/ (repository → service → controller → routes), health/
│   │   ├── middlewares/   # 404 e tratamento de erros
│   │   ├── shared/        # Erros de aplicação
│   │   ├── app.js         # Monta o Express (injeção de dependências)
│   │   └── server.js      # Sobe o servidor
│   └── tests/
├── shared/data/cards.json # Baralho oficial — fonte única para front e back
├── docs/ARCHITECTURE.md   # Decisões de arquitetura
├── Dockerfile
└── .github/workflows/ci.yml
```

Detalhes das camadas e do fluxo de dependências em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Como rodar

Pré-requisito: **Node.js 20.19+** (recomendado 22, ver `.nvmrc`).

```bash
npm install          # instala tudo (workspaces frontend + backend)
npm run dev          # jogo em http://localhost:5173 (hot reload)
```

Para testar no celular na mesma rede Wi‑Fi, abra o endereço `Network` que o Vite mostra no terminal.

### Produção local

```bash
npm run build        # gera frontend/dist
npm start            # backend serve o jogo + API em http://localhost:3000
```

### Scripts

| Comando               | O que faz                                       |
| --------------------- | ----------------------------------------------- |
| `npm run dev`         | Frontend em modo desenvolvimento                |
| `npm run dev:backend` | Backend com reinício automático                 |
| `npm run build`       | Build de produção do frontend                   |
| `npm start`           | Servidor de produção (backend + frontend)       |
| `npm test`            | Todos os testes                                 |
| `npm run lint`        | ESLint                                          |
| `npm run format`      | Formata o código com Prettier                   |
| `npm run check`       | Lint + formatação + testes + build (igual à CI) |

## API

| Método | Rota                          | Descrição                                        |
| ------ | ----------------------------- | ------------------------------------------------ |
| GET    | `/api/health`                 | Status do servidor                               |
| GET    | `/api/cards`                  | Todas as cartas                                  |
| GET    | `/api/cards?category=desafio` | Filtra por `desafio`, `pergunta` ou `penalidade` |
| GET    | `/api/cards/summary`          | Total de cartas por categoria                    |
| GET    | `/api/cards/:id`              | Uma carta pelo número                            |

Respostas no formato `{ "data": ... }`; erros como `{ "error": { "message": "..." } }`.

## Hospedagem

O frontend é 100% estático e **não depende do backend** para funcionar, então há duas opções:

**1. Só o jogo (estático, gratuito)** — GitHub Pages, Netlify, Vercel ou Cloudflare Pages:

- Comando de build: `npm run build`
- Pasta publicada: `frontend/dist`

O build usa caminhos relativos, então funciona também em subpastas (ex.: `usuario.github.io/maldicao/`).

**2. Jogo + API (Node)** — Render, Railway, Fly.io ou qualquer VPS:

```bash
docker build -t maldicao .
docker run -p 3000:3000 maldicao
```

Ou sem Docker: `npm ci && npm run build && npm start`. Variáveis em [`.env.example`](.env.example).

## Editando o conteúdo

- **Cartas:** `shared/data/cards.json`. Campos: `id`, `cat` (`desafio` | `pergunta` | `penalidade`), `tipo`, `title`, `desc`, `pen`, e opcionais `ans` (resposta) e `ex` (exemplos).
- **Músicas:** coloque o `.mp3` em `frontend/public/audio/` e registre em `frontend/src/config/tracks.js`.

Os testes validam o baralho (ids únicos, campos obrigatórios); ajuste a contagem em `frontend/tests/data/cards.test.js` se adicionar ou remover cartas.
