# Relatório de Avaliação da Experiência de Uso — Parte C (IHC)

- **Disciplina:** Interação Humano-Computador · Profa. Amélia Batista
- **Sistema:** Monitora+ — Sistema de Agendamento de Monitorias Acadêmicas
- **Grupo / Turma:** `[Preencher Nome do Grupo e Turma]`
- **Integrantes e contribuições:**
  - `[Seu Nome]` — Protótipo Front-end (HTML/CSS/JS), fluxo guiado, acessibilidade e publicação no GitHub
  - `[Nome 2]` — `[Papel/Contribuição]`
  - `[Nome 3]` — `[Papel/Contribuição]`
- **Data de entrega:** 02/12/2026

---

## 1. Fundamentos de IHC e Coerência com Requisitos (Seção 6.9)

O protótipo aplica o **Design Centrado no Ser Humano (ISO 9241-210)**, reduzindo os **Golfos de Execução e de Avaliação (Donald Norman)** e respeitando a **Lei de Hick-Hyman** por meio da divulgação progressiva em 3 etapas (`1. Escolher monitoria → 2. Data e horário → 3. Confirmar`).

| Requisito Funcional (RF) | Tela / Fluxo no Protótipo | Princípio de IHC Aplicado |
| --- | --- | --- |
| **RF01** — Criar conta / Registrar estudante ou monitor | **Landing / Criar conta** e passo 3 rápido | **Caso "Botão de 300 milhões":** permite *"Consultar horários sem fazer login"* antes de exigir cadastro. |
| **RF02** — Consultar horários disponíveis | **Passo 1** (Lista ou Grade Semanal) e **Passo 2** (Calendário + Horários) | **Lei de Hick-Hyman:** separa escolha da matéria da escolha do dia/hora. |
| **RF03** — Solicitar atendimento | **Passo 3 — Confirmar atendimento** + modal de revisão + protocolo `#MON-2026-XXX` | **Golfo de Avaliação + Caso Havaí:** resumo explícito antes de confirmar e comprovante imediato. |
| **RF04** — Acompanhar agendamentos | Aba **Meus Agendamentos** (status e `.ics`) | **Visibilidade do estado do sistema** e exportação de agenda. |
| **RF05** — Cancelar / Concluir atendimento | Diálogo de confirmação + botão **Desfazer** no toast | **Regra de Ouro nº 6 (Shneiderman):** reversão fácil de ações para reduzir ansiedade. |
| **RF06** — Publicar horários (Monitor) | **Painel do Monitor** protegido por código específico do professor | **Segurança Utilizável + Privacidade:** isola cada monitor apenas à sua própria disciplina. |

---

## 2. Avaliação Heurística com Escala de Severidade (Modelo 7.1)

> **Escala de severidade de Nielsen:** `0` Não é problema · `1` Cosmético · `2` Pequeno · `3` Grande · `4` Catastrófico.

| Princípio / Heurística | Evidência na interface | Sev. (0–4) | Problema ou acerto | Melhoria proposta / aplicada |
| --- | --- | --- | --- | --- |
| **1. Visibilidade do estado do sistema** | Stepper `1 → 2 → 3`, contador de vagas por horário, badge em *Meus Agendamentos* e comprovante com protocolo `#MON-2026-XXX`. | `0` | **Acerto** — reduz o golfo de avaliação após cada ação. | Mantido feedback imediato com toast e comprovante copiável. |
| **2. Correspondência com o mundo real** | Termos acadêmicos diretos (`Disciplina`, `Monitor`, `Matrícula`, `Lab 02`) e calendário mensal familiar (estilo Cal.com). | `0` | **Acerto** — alinha modelo mental do aluno ao sistema. | Datas e horários exibidos no padrão brasileiro (`DD/MM/AAAA`). |
| **3. Controle e liberdade do usuário** | Botão `Voltar` em todas as etapas, cancelamento em 1 clique com confirmação e botão **Desfazer** no toast após cancelar/concluir. | `1` | **Acerto** (após melhoria) — evita sensação de erro irreversível. | Implementado **Desfazer** por 5,5s no toast de ações reversíveis. |
| **4. Consistência e padrões** | Barra superior fixa, botões primários em cor única de destaque e padrão consistente de modais e listas. | `0` | **Acerto** — segue a Lei de Jakob (logo retorna ao início, busca previsível). | Padronizado o modal único de confirmação em todo o sistema. |
| **5. Prevenção de erros** | Bloqueio de horários lotados, bloqueio de choque de horário, código específico por disciplina para monitores e modal *"Confirmar ação?"* antes de agendar/publicar/concluir. | `3` *(resolvido)* | **Problema inicial:** clicar em confirmar/concluir executava direto sem revisão; Passo 3 antigo tinha campos em excesso. | Enxugado o Passo 3 para 2 campos mínimos e adicionado modal de confirmação prévia. |
| **6. Flexibilidade e eficiência de uso** | Atalho `/` foca a busca no Passo 1, botões de acesso rápido no login de demonstração e alternância Lista ↔ Grade Semanal. | `1` | **Acerto** — atende tanto novatos quanto usuários frequentes (Regra 2 de Shneiderman). | Mantido atalho `/` sem interferir quando o usuário digita em formulários. |
| **7. Estética e design minimalista** | Remoção de cards redundantes, divisórias finas `1px`, foco exclusivo na tarefa da etapa atual. | `2` *(resolvido)* | **Problema inicial:** primeira versão exibia grade, filtros e formulário tudo junto na mesma tela. | Redesenhado para fluxo progressivo com amplo respiro visual. |

---

## 3. Planejamento do Teste de Usabilidade, Métricas e SUS

> **Orientações éticas e Percurso Cognitivo:** participação voluntária com Termo de Consentimento Livre e Esclarecido, explicando que **o sistema está sendo testado, nunca a pessoa**. Utilizar protocolo **"pensar em voz alta"**, sem induzir o caminho.

### Roteiro de Tarefas (Mínimo 3)
1. **Tarefa 1 — Localizar um horário:** *"Você precisa de ajuda em Interação Humano-Computador em um dia que tenha vaga disponível. Encontre uma opção livre no sistema."*
2. **Tarefa 2 — Solicitar atendimento:** *"Agende esse atendimento informando que a sua dúvida é sobre heurísticas de usabilidade."*
3. **Tarefa 3 — Verificar a confirmação:** *"Confirme na tela de agendamentos se o seu pedido ficou registrado e localize o número do protocolo."*

### Quadro de Métricas Observadas (Preencher com ≥ 2 participantes — meta recomendada: 5)

| Participante | Tarefa 1 (sucesso / tempo / erros) | Tarefa 2 (sucesso / tempo / erros) | Tarefa 3 (sucesso / tempo / erros) | Nota SUS (0–100) | Comentários |
| --- | --- | --- | --- | --- | --- |
| **Participante P1** | `[Sim/Não · Xs · 0 erros]` | `[Sim/Não · Xs · 0 erros]` | `[Sim/Não · Xs · 0 erros]` | `[Ex.: 85]` | `[Observações]` |
| **Participante P2** | `[Sim/Não · Xs · 0 erros]` | `[Sim/Não · Xs · 0 erros]` | `[Sim/Não · Xs · 0 erros]` | `[Ex.: 80]` | `[Observações]` |

> **Referência SUS (System Usability Scale):** questionário de 10 itens em escala Likert de 1 a 5 (nota final de 0 a 100; benchmark médio de referência = **68**).

---

## 4. Entrevista Semiestruturada com Usuários (Mínimo 5 Perguntas Abertas)

1. *"Como você costuma descobrir os horários e marcar uma monitoria hoje?"*
2. *"Conte como foi a última vez que você tentou tirar uma dúvida com um monitor."*
3. *"Que informações você precisa ver antes de decidir um horário de monitoria?"*
4. *"Durante o uso do sistema, em algum momento você ficou na dúvida do que ia acontecer ao clicar em algum botão?"*
5. *"Se você precisasse cancelar uma monitoria em cima da hora, o que esperaria encontrar na tela?"*
6. *"Pensando no uso pelo celular no dia a dia, o que facilitaria ou atrapalharia nessa interface?"*

### Síntese das Respostas (≥ 2 Participantes)
- **Participante P1:** `[Registrar síntese após entrevista]`
- **Participante P2:** `[Registrar síntese após entrevista]`

---

## 5. Ética, LGPD, Segurança Utilizável e Inclusão (Modelo 7.4)

| Dimensão | Decisão tomada no protótipo | Base teórica (Aulas IHC / Normas) |
| --- | --- | --- |
| **Privacidade & LGPD (Necessidade e Titularidade)** | Armazenamento estritamente local no navegador, sem coleta de CPF ou telefone, e botão claro **`Excluir minha conta e dados`** com confirmação definitiva. | **LGPD (Lei 13.709/2018)** e **Privacy by Design** (controle real de eliminação pelo titular). |
| **Ausência de Padrões Enganosos (*Dark Patterns*)** | Cancelar um agendamento ou excluir a conta é tão direto e visível quanto agendar ou entrar; nenhuma opção vem pré-marcada contra o interesse do usuário. | **Prevenção a *Roach Motel* e *Confirmshaming*** (Aula 4). |
| **Segurança Utilizável e Isolamento de Dados** | Contas de monitor exigem código específico de 6 caracteres por professor/disciplina (`IHC026`, `ALG026`, etc.), e cada monitor enxerga **apenas os alunos da sua própria matéria**. | **Segurança Utilizável** e prevenção de vazamento de dúvidas entre disciplinas. |
| **Inclusão, Acessibilidade e Efeito Rampa** | Alternância **Escuro / Claro / Alto Contraste**, ajuste de fonte (`A-` / `A+`), alvos de toque ≥ 44px (**Lei de Fitts**), rótulos `<label>` em todos os campos, navegação por teclado (`Tab`, `Esc`, `/`), regiões `aria-live` e suporte a `prefers-reduced-motion`. | **WCAG 2.2 (POUR)**, **eMAG**, **LBI (Lei 13.146/2015, art. 63)** e **Espectro de Personas**. |

---

## 6. Melhorias Concretas Aplicadas a partir da Avaliação (Mínimo 3)

1. **Transição de layout denso para fluxo guiado em 3 etapas + intro animada:** reduziu a sobrecarga cognitiva inicial e alinhou o caminho exatamente às 3 tarefas principais do estudante.
2. **Simplificação do Passo 3 ("Confirmar atendimento"):** redução de 4 campos de cadastro completo para apenas 2 campos mínimos (`Seu nome` e `Matrícula`) para visitantes, reduzindo o atrito de entrada (*Lei de Hick* e caso *Botão de 300 milhões*).
3. **Prevenção e reversão de erros em ações críticas:** inclusão de modal único de confirmação com resumo da consequência antes de agendar, publicar ou concluir, somado ao botão **Desfazer** no toast após cancelamentos/conclusões.
4. **Isolamento por disciplina e códigos específicos por professor:** impediu que contas de monitor de uma disciplina visualizassem dúvidas ou publicassem horários em outra matéria.
