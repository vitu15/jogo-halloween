# Arquitetura

O projeto nasceu como um único `index.html` de 11 MB (HTML, CSS, JS e as músicas em base64). Ele foi
reorganizado sem mudar o comportamento do jogo: mesmas cartas, mesmas músicas, mesmo layout, mesmas
animações e a mesma chave de `localStorage` (`maldicao_v1`), então partidas salvas na versão antiga continuam
funcionando.

## Visão geral

```
            shared/data/cards.json  (fonte única do baralho)
                 │                        │
        ┌────────┴────────┐      ┌────────┴────────┐
        │    frontend     │      │     backend     │
        │  (jogo, Vite)   │      │ (Express, API)  │
        └─────────────────┘      └─────────────────┘
```

O frontend importa o baralho no build, então o jogo roda como site estático, sem servidor. O backend lê o
mesmo arquivo para expor a API e, em produção, também serve o build do frontend.

## Frontend — camadas

As dependências apontam sempre para dentro: `presentation → application → domain`.
`infrastructure` implementa detalhes técnicos que as camadas internas recebem por injeção.

| Camada           | Responsabilidade                                                                                                    | Conhece DOM?         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `domain`         | `Deck` (consultas ao baralho), categorias, estado inicial e restauração                                             | Não                  |
| `application`    | `GameSession`: casos de uso (sortear, efetivar, pular, cumprir, finalizar, configurar)                              | Não                  |
| `infrastructure` | `LocalStorageGameRepository`, `SoundEffects` (Web Audio), `MusicPlayer`, vibração                                   | Só APIs do navegador |
| `presentation`   | Views (renderizam), controllers (traduzem eventos em casos de uso), componentes (toast, modais, confirmação, telas) | Sim                  |
| `main.js`        | Raiz de composição: instancia e conecta tudo                                                                        | —                    |

Decisões principais:

- **`GameSession` não sabe nada de UI.** O sorteio é dividido em `prepareDraw()` (escolhe, sem efeito
  colateral) e `commitDraw()` (efetiva e salva), porque a interface precisa esperar a carta virar de volta
  antes de registrar a nova — exatamente como no original.
- **Persistência por porta/adaptador.** `GameSession` recebe qualquer objeto com `load()`/`save()`. Em
  produção é o `LocalStorageGameRepository` (com fallback em memória); nos testes, um repositório em memória.
- **Aleatoriedade injetável.** `random` pode ser passado a `GameSession` e `MusicPlayer`, o que torna os
  testes determinísticos.
- **Temporizações nomeadas.** Os tempos de animação (330 ms, 420 ms, 500 ms, 520 ms, 650 ms) viraram
  constantes com nome nos controllers/views, com os mesmos valores do original.
- **CSS dividido por responsabilidade** (`base/`, `components/`, `screens/`), importado em `main.css` na
  mesma ordem da folha original para preservar a cascata.
- **HTML preservado.** A marcação de `index.html` é a original; o Prettier ignora `*.html` para não alterá-la.

## Backend — módulos

Cada módulo segue `repository → service → controller → routes`:

- **Repository** (`JsonCardRepository`): lê e cacheia `cards.json`. `InMemoryCardRepository` serve aos testes.
- **Service** (`CardService`): regras de consulta (filtro por categoria, busca por id, resumo) e erros de
  domínio (`ValidationError`, `NotFoundError`).
- **Controller**: adapta HTTP ↔ service. Express 5 encaminha erros assíncronos ao `errorHandler`.
- **`createApp({ cardRepository, staticDir })`**: recebe dependências prontas, então os testes sobem a API
  sem tocar em disco nem em porta de rede.

Segurança: `helmet` (com `style-src 'unsafe-inline'`, necessário porque o jogo aplica estilos inline nas
cartas e efeitos), `x-powered-by` desativado e respostas de erro 500 sem detalhes internos.

## Testes

- `frontend/tests`: domínio, casos de uso, repositório, player de música, template da carta e integridade do
  baralho oficial.
- `backend/tests`: todas as rotas da API, servidor estático e leitura do baralho compartilhado.
