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
   - No desktop, painel institucional com frases rotativas + cartão de acesso com etapa OTP em 6 caixinhas; no celular, layout focado em entrada limpa e modal de Aparência.
   - Criação de conta para **Estudante** e para **Monitor(a)** — a conta de monitor (validada em 6 caixinhas estilo OTP) e a publicação de novos horários exigem um **código exclusivo de 6 caracteres por disciplina** (`IHC026`, `ESW026`, `AOC026`, `MAT026`, `ALG026`, `ING026`), isolando cada monitoria apenas aos seus próprios alunos.
   - Acesso rápido de demonstração para apresentação (*Estudante* e *Monitor*) com isolamento de horários atrás de autenticação.
2. **Jornada de Agendamento em 3 Etapas (Estilo Cal.com):**
   - **Passo 1:** Lista respirada por disciplina/monitor (com busca `/` e alternância para **Grade Semanal** `[4 horários × 5 dias]`).
   - **Passo 2:** Calendário mensal à esquerda + horários do dia selecionado à direita.
   - **Passo 3:** Atalhos de assunto, validação de choque de horário e geração imediata de protocolo (`#MON-2026-XXX`) com download `.ics`.
3. **Painel do Monitor:**
   - Publicação de novos horários na agenda (validada pelo código docente) e acompanhamento dos alunos agendados com conclusão de atendimentos.
4. **Central de Configurações & Tecnologia Assistiva (WCAG 2.2):**
   - Modal em 2 colunas (desktop) / abas (mobile) acessível por `Alt + ,` com **Geral** (visualização padrão), **Aparência** (`Claro / Escuro / Alto Contraste AAA`, slider de fonte `88%–152%` e redução de animações), **Acessibilidade** (filtros para Daltonismo, espaçamento para Dislexia, Régua de leitura, Foco extra visível, Alvos ≥ 48px e leitura da tela em voz alta PT-BR), **Agenda**, **Atalhos** (`← ↑ ↓ →`, `/`, `Alt + L`) e **Conta/LGPD** (exportação JSON e exclusão local).

---

## Estrutura de Arquivos

```text
├── index.html             # Landing, fluxo de agendamento, agendamentos e painel do monitor
├── styles.css             # Design system (Escuro, Claro e Alto Contraste) + intro animada
├── app.js                 # Autenticação, regras de negócio, calendário e localStorage
├── docs/
│   └── RELATORIO_IHC.md   # Roteiro e tabelas de IHC (modelos 7.1 e 7.4)
└── README.md
```

---

## Como Executar ou Publicar no GitHub Pages

1. Abra `index.html` diretamente no navegador (funciona 100% offline).
2. Para publicar no **GitHub Pages**: envie para um repositório público no GitHub e ative em **Settings → Pages** (`main` / `/root`).
