# 🎯 Cravou — Bolões

Plataforma web de **bolões** para esportes, jogos e eventos em geral.  
Feita por **Vitor Camargo** · HTML + CSS + JavaScript vanilla com ES Modules · Zero dependências.

---

## Como rodar

1. Abra a pasta `cravou/` no **VS Code**.
2. Instale a extensão **Live Server** (Ritwick Dey) se ainda não tiver.
3. Clique com o botão direito em `index.html` → **Open with Live Server**.
4. O navegador abrirá em `http://127.0.0.1:5500/` (ou porta similar).

> ⚠️ Não abra `index.html` diretamente como `file://` — ES Modules exigem HTTP.

---

## Funcionalidades

| # | Funcionalidade | Descrição |
|---|---------------|-----------|
| 1 | **Sidebar retrátil** | Botão ☰ abre; overlay e ✕ fecham |
| 2 | **Hero** | Título, subtítulo, CTA e estatísticas ao vivo |
| 3 | **Carrossel** | Destaques com auto-avanço a cada 5s, setas e dots |
| 4 | **Cards de evento** | 3 estados: Aberto / Ao Vivo / Encerrado |
| 5 | **Countdown** | Contador regressivo em cards abertos |
| 6 | **Palpites** | Modal com placar, salvo no localStorage |
| 7 | **Pontuação** | Calculada automaticamente nos encerrados |
| 8 | **Auth** | Cadastro + login + logout via localStorage |
| 9 | **Ranking** | Base fixa + pontos do usuário logado |
| 10| **Configurações** | Tema, idioma, volume, fonte, acessibilidade |
| 11| **i18n** | PT 🇧🇷 / EN 🇺🇸 / ES 🇪🇸 — troca na hora |

---

## Tabela de pontuação

| Resultado | Pontos |
|-----------|--------|
| Placar exato (ex: palpitou 1×1 → encerrou 1×1) | **+2 pts** |
| Acertou só o vencedor/empate, mas não o placar | **+1 pt** |
| Errou o resultado da partida | **+0 pts** |

A lógica usa `Math.sign(home − away)` para comparar o sinal do palpite com o do resultado.

---

## Estrutura de pastas

```
cravou/
├── index.html              # Shell HTML da aplicação
├── README.md
├── css/
│   ├── main.css            # @import dos demais
│   ├── tokens.css          # Custom properties: tema, cores, fonte
│   ├── base.css            # Reset + tipografia
│   ├── layout.css          # Topbar, sidebar, wrap, footer
│   └── components.css      # Cards, badges, carrossel, ranking, modais, toasts
└── js/
    ├── app.js              # Ponto de entrada (type="module")
    ├── store.js            # Wrapper localStorage (get/set JSON)
    ├── state.js            # Estado global (user, predictions, settings)
    ├── i18n.js             # Dicionário PT/EN/ES + apply()
    ├── data.js             # Seed de eventos + ranking base
    ├── sound.js            # Web Audio API (beep sintético)
    ├── events.js           # Ciclo de vida + cálculo de pontos
    ├── auth.js             # Cadastro / login / logout
    ├── predictions.js      # Modal de palpite + salvar
    ├── carousel.js         # Carrossel rotativo automático
    ├── ranking.js          # Ranking base + pontos do usuário
    ├── settings.js         # Tema, idioma, volume, acessibilidade
    ├── sidebar.js          # Sidebar retrátil
    └── ui.js               # Helpers: toast, abrir/fechar modal
```

---

## Ranking base

| Posição | Jogador | Pontos |
|---------|---------|--------|
| 🥇 | Lucas  | 9 |
| 🥈 | BG     | 8 |
| 🥉 | Heitor | 7 |
| 4° | Tales  | 6 |
| 5° | Yoko   | 6 |
| 6° | Vitor  | 5 |
| 7° | Tomás  | 4 |
| 8° | Felipe | 4 |
| 9° | Pops   | 3 |

---

## Temas e acessibilidade

- **Tema claro** (padrão) e **escuro** (cyber-lite com acento neon)
- **Alto contraste** para baixa visão
- **Reduzir animações** para quem prefere menos movimento
- **3 tamanhos de fonte**: P (14px) · M (16px) · G (19px)
- Tudo controlado por CSS custom properties em `tokens.css`

---

> ⚠️ **Nota de segurança**: este projeto é um protótipo front-end.  
> Senhas são armazenadas em texto no `localStorage` apenas para demonstração.  
> Em produção, use **hash bcrypt + API REST segura** — nunca armazene senhas em texto.
