# Monitora+ · Sistema de Agendamento de Monitorias Acadêmicas

Protótipo digital interativo desenvolvido para a **3ª Avaliação da Aprendizagem — Atividade Avaliativa Integradora** (1º período de Engenharia de Software, entrega em **02/12/2026**).

- **Parte A · Introdução à Engenharia de Software** (Prof. Francisco Canindé) — Documento de Requisitos
- **Parte B · Algoritmo e Programação** (Prof. Rogério Lima) — Protótipo em Python (vetores e matriz)
- **Parte C · Interação Humano-Computador (IHC)** (Profa. Amélia Batista) — **Protótipo de interface e relatório de experiência de uso**

---

## Integrantes e Identificação

- **Grupo:** `[Preencher Nome do Grupo]`
- **Turma:** `[Preencher Turma]`
- **Integrantes e contribuições:**
  - `[Seu Nome]` — Protótipo Front-end (HTML/CSS/JS), fluxo de agendamento, sistema de contas e acessibilidade
  - `[Integrante 2]` — `[Contribuição]`
  - `[Integrante 3]` — `[Contribuição]`

---

## Fluxo e Funcionalidades

1. **Landing 50/50 (Desktop) & App Nativo (Mobile):**
   - No desktop, painel institucional com frases rotativas e cartão de acesso; no celular, layout focado em entrada e modal de Aparência.
   - Cadastro e login reais para **Estudante** e **Monitor(a)**, com sessão em cookie HttpOnly. Cadastro de monitor e publicação de horários exigem código privado da disciplina, validado pelo servidor.
   - Google/Gennera não estão disponíveis: os acessos simulados do protótipo foram removidos. Não há integração OAuth implementada.
2. **Jornada de Agendamento em 3 Etapas (Estilo Cal.com):**
   - **Passo 1:** Lista respirada por disciplina/monitor (com busca `/` e alternância para **Grade Semanal** `[4 horários × 5 dias]`).
   - **Passo 2:** Calendário mensal à esquerda + horários do dia selecionado à direita.
   - **Passo 3:** Atalhos de assunto, validação de choque de horário e geração imediata de protocolo (`#MON-2026-XXX`) com download `.ics`.
3. **Painel do Monitor:**
   - Publicação de novos horários na agenda (validada pelo código docente) e acompanhamento dos alunos agendados com conclusão de atendimentos.
4. **Central de Configurações & Tecnologia Assistiva (WCAG 2.2):**
   - Modal em 2 colunas (desktop) / abas (mobile) acessível por `Alt + ,` com **Geral**, **Aparência**, **Acessibilidade**, **Agenda**, **Atalhos** e **Conta/LGPD** (exportação JSON e exclusão da conta no servidor). Preferências visuais ficam neste navegador; contas, horários e agendamentos ficam no PostgreSQL. Choques de horário são sempre bloqueados pelo servidor.

---

## Estrutura de Arquivos

```text
├── index.html             # Landing, fluxo de agendamento, agendamentos e painel do monitor
├── styles.css             # Design system (Escuro, Claro e Alto Contraste) + intro animada
├── app.js                 # Interface, calendário e adaptação das respostas da API
├── api.js                 # HTTP, cookies, CSRF em memória, erros e timeout
├── api-config.js          # URL pública da API (atualizar se o Quick Tunnel mudar)
├── backend/               # Flask + PostgreSQL 17 + Docker; veja backend/DEPLOY.md
├── tests/                 # Testes do cliente HTTP e fluxos de navegador
├── docs/
│   └── RELATORIO_IHC.md   # Roteiro e tabelas de IHC (modelos 7.1 e 7.4)
└── README.md
```

---

## Como Executar ou Publicar no GitHub Pages

1. Sirva o frontend por HTTP/HTTPS; não abra por `file://`. Para desenvolvimento, use Live Server na porta 5500 ou `python -m http.server 5500`.
2. Em `localhost`/`127.0.0.1`, o frontend usa `http://localhost:8000/api`. Suba o backend conforme [backend/DEPLOY.md](backend/DEPLOY.md), usando cookies `Secure=False` e `SameSite=Lax` somente no HTTP local.
3. No GitHub Pages, a API HTTPS vem de `api-config.js`. A configuração é pública e não contém segredos. Se o Quick Tunnel reiniciar e mudar de endereço, atualize esse arquivo e publique de novo.
4. O Pages está configurado para publicar `main` / `/root`. Contas e operações exigem a API disponível; falhas de rede não geram dados fictícios nem usam localhost silenciosamente.

## Sessão e dados

Todos os pedidos usam `credentials: "include"`. Login/cadastro e `/auth/me` fornecem o CSRF usado nas alterações, mantido em memória. O JWT permanece HttpOnly; senhas e dados acadêmicos não são persistidos em localStorage. A versão antiga de contas locais é descartada, preservando apenas preferências visuais. Cada cadastro de apresentação deve ser criado novamente na API.

Em navegação com cookies de terceiros bloqueados, a autenticação entre Pages e a API pode falhar. A interface detecta a sessão ausente após login/cadastro e informa o problema. Teste o navegador da apresentação antes; o Quick Tunnel é temporário e não garante disponibilidade.

## Validação

```bash
npm ci
npm test
```

`npm run test:e2e` usa Chrome instalado e cria contas/horários temporários na API de demonstração. Configure `MONITORA_E2E_PROFESSOR_CODE` com o código privado de `off-ihc`; nunca o inclua no Git. O teste remove as contas e retira os horários criados ao terminar. Use apenas ambiente de demonstração. `MONITORA_E2E_SOURCE=1` testa os arquivos locais sob a origem do Pages antes da publicação; sem isso, testa os arquivos efetivamente publicados. `MONITORA_E2E_API_URL` e `MONITORA_E2E_ORIGIN` permitem outros destinos.
