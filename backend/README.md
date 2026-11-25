# Monitora+ · Backend (Flask + PostgreSQL)

API do sistema de agendamento de monitorias. JWT em cookie `HttpOnly` + proteção CSRF, SQL puro com `text()`.

## Estrutura

```
backend/
├── app_factory.py     # create_app(): extensões, CORS, blueprint pai, handlers de erro JSON
├── extensions.py      # db, jwt, bcrypt, cors
├── models.py          # User, Offering, Slot, Booking
├── seed.py            # cria as tabelas + as 6 disciplinas e seus códigos
└── api/
    ├── __init__.py    # blueprint pai (/api) que registra as filhas
    ├── common.py      # ServiceError, helpers e constantes compartilhadas
    ├── auth/          # routes.py (blueprint) + services.py (AuthService) + guards.py
    ├── offerings/     # disciplinas
    ├── slots/         # horários publicados pelos monitores
    ├── schedules/     # agendamentos

```

Regra do projeto: `routes.py` só lê a requisição e chama `Classe.metodo(...)`. Validação, regras e SQL ficam em `services.py`.

## Rodando

```bash
python -m venv venv
venv\Scripts\activate            # Windows  (Linux/Mac: source venv/bin/activate)
pip install -r requirements.txt

copy .env.example .env           # e edite (DATABASE_URL, JWT_SECRET_KEY, CORS_ORIGINS)
python seed.py                   # cria as tabelas e grava as disciplinas
flask --app app_factory run      # ou: python app_factory.py, ISSO PARA TESTES, EM PRODUÇÃO USE UM SERVIDOR WSGI!!!
```

- A URL do banco usa o psycopg 3: `postgresql+psycopg://usuario:senha@host:5432/banco`.
- `python seed.py` pode rodar quantas vezes quiser. Ele **não** sobrescreve os códigos de professor já gravados; use `python seed.py --update-codes` para isso.
- Os códigos do `seed.py` (`IHC026`, `ESW026`, ...) são os do protótipo. Troque antes de publicar.
- Tabelas são criadas com `db.create_all()`; ele não altera tabelas já existentes. Para mudar colunas depois, use SQL ou Flask-Migrate.

## Autenticação (cookie + CSRF)

No `login`/`register` a API define dois cookies:

| Cookie | HttpOnly | Para quê |
|---|---|---|
| `access_token_cookie` | sim | o JWT (o JS não lê) |
| `csrf_access_token` | **não** | valor que o front copia para o header |

Regras para o front:
1. Todo `fetch` usa `credentials: "include"`.
2. `POST`, `PUT`, `PATCH` e `DELETE` autenticados precisam do header `X-CSRF-TOKEN` com o valor do cookie `csrf_access_token`. `GET` não precisa.
3. `401` = sem sessão / expirada (mandar para o login). `403` = sem permissão **ou** CSRF ausente.
4. O token vale 8 horas (`JWT_EXPIRES_HOURS`), sem refresh.

```js
const API = "/api"; // em desenvolvimento: "http://localhost:5000/api"

const csrf = () =>
  document.cookie.split("; ").find((c) => c.startsWith("csrf_access_token="))?.split("=")[1];

async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(API + path, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(method !== "GET" ? { "X-CSRF-TOKEN": csrf() } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Erro"), { status: res.status, fields: data.fields || {} });
  return data;
}
```

Em desenvolvimento com o front em outra porta (Live Server), use `localhost` nos dois lados (não misture `127.0.0.1` com `localhost`) e coloque a origem do front em `CORS_ORIGINS`. Na VPS, com nginx servindo o front e repassando `/api` ao Flask, não precisa de CORS; ligue `JWT_COOKIE_SECURE=True` (HTTPS).

## Formato dos erros

```json
{ "error": "mensagem geral", "fields": { "email": "mensagem do campo" } }
```

`fields` vem nas validações e usa os nomes dos campos do corpo da requisição, para o front destacar o input certo. Códigos: `422` validação · `401` login/sessão · `403` permissão/código de professor/CSRF · `404` não encontrado · `409` conflito (duplicado, vaga esgotada, choque de horário).

Use as URLs sem barra final ou com; as duas funcionam.

## Rotas

Todas com prefixo `/api`. 🔒 = exige cookie de sessão · 🎓 = só monitor.

### Auth
| Método e rota | Corpo | Resposta |
|---|---|---|
| `POST /auth/register` | `role` (`student`/`monitor`), `name`, `ra`, `email`, `password`; aluno: `course`; monitor: `offering_id` e `professor_code` | 201 `{user}` + cookies |
| `POST /auth/login` | `identifier` (matrícula ou e-mail), `password` | 200 `{user}` + cookies |
| `POST /auth/logout` | – | 200, limpa os cookies |
| `GET /auth/me` 🔒 | – | `{user}` (use para restaurar a sessão ao abrir o site) |
| `DELETE /auth/me` 🔒 | – | apaga conta, agendamentos e preferências (LGPD) |

`user` = `{id, role, name, ra, email, course, offering_id}`.

### Disciplinas
| `GET /offerings` | pública | `{offerings: [{id, subject, short_subject, title, mode, location, short_location, monitors: [nomes], remaining_total, duration_minutes}]}` |
|---|---|---|

`remaining_total` soma só horários futuros. `monitors` vem dos usuários monitores cadastrados na disciplina.

### Horários
| Método e rota | Corpo/Query | Resposta |
|---|---|---|
| `GET /slots?offering_id=off-alg` 🔒 | `offering_id` opcional | `{slots: [{id, offering_id, date, day_name, start_time, end_time, time, capacity, occupied, remaining}]}` só futuros |
| `POST /slots` 🎓 | `date` (`AAAA-MM-DD`), `time` (`"14:00 - 14:40"`, uma das 4 faixas), `capacity` (1 a 15), `professor_code` | 201 `{slot}` na disciplina do monitor |

### Agendamentos
| Método e rota | Corpo/Query | O que faz |
|---|---|---|
| `GET /schedules?status=Confirmado` 🔒 | `status` opcional | meus agendamentos (confirmados primeiro) |
| `POST /schedules` 🔒 | `slot_id`, `topic` (4 a 180 caracteres) | agenda; devolve o protocolo |
| `PATCH /schedules/{id}/slot` 🔒 | `slot_id`, `topic` (opcional) | reagenda (mesma disciplina, mesmo protocolo) |
| `PATCH /schedules/{id}/status` 🔒 | `status` | ver tabela abaixo |
| `GET /schedules/monitor?scope=active` 🎓 | `scope`: `active` (padrão) ou `all` | agendamentos da disciplina do monitor, com `student: {id, name, ra}` |

`PATCH .../status`:

| De → Para | Quem pode | Uso no front |
|---|---|---|
| Confirmado → Cancelado | dono | botão Cancelar |
| Cancelado → Confirmado | dono | "Desfazer" do cancelamento (revalida vaga, horário e choque) |
| Confirmado → Concluído | monitor da disciplina | botão Concluir |
| Concluído → Confirmado | monitor da disciplina | "Desfazer" da conclusão |

Item de agendamento: `{id, protocol, status, topic, created_at, slot: {id, date, day_name, start_time, end_time, time, capacity}, offering: {id, subject, short_subject, title, location, short_location, monitors}}`.

Campos (snake_case): `theme` (`light`/`dark`/`contrast`), `font_scale` (0.88 a 1.52), `default_layout` (`list`/`matrix`), `confirm_before_book`, `block_conflicts`, `auto_ics_hint`, `ics_reminder_minutes` (0/15/30/60), `cvd_filter` (`none`/`protanopia`/`deuteranopia`/`tritanopia`/`achromatopsia`), `dyslexia_spacing`, `reading_mask`, `pause_distractions`, `extra_focus`, `large_targets`, `reduced_motion`, `vlibras`.

`block_conflicts` também vale no servidor: se estiver ligado (padrão), a API recusa dois agendamentos confirmados no mesmo dia e faixa.

## O que muda no front

- Trocar o `localStorage` pelos `fetch` acima. O estado de sessão vem de `GET /auth/me`.
- **Remover a "dica" do código do professor** na tela do código (`otp-hint-code`): a API nunca devolve os códigos. Hoje isso dá acesso de monitor a qualquer pessoa.
- Cadastro de monitor: o front já coleta o código antes de criar a conta; mande tudo de uma vez em `POST /auth/register`.
- Os IDs de horário e agendamento agora são números. As disciplinas mantêm `off-ihc`, `off-es`, etc.
- Os nomes dos monitores vêm dos usuários cadastrados (não existe mais "Monitor Bruno T." fixo).
- Vagas, protocolo e choque de horário são calculados no servidor; o front só exibe.
- O `.ics` e o JSON de exportação continuam no front, montados a partir de `GET /schedules`.

## Decisões de logística (fáceis de mudar)

- Um horário é único por `(disciplina, data, hora de início)`; publicar de novo dá 409.
- Não dá para publicar nem agendar horário que já passou. Horários passados somem das listas.
- Os códigos de professor ficam em `offerings` como hash bcrypt.
- Senha mínima de 4 caracteres, igual ao front (`MIN_PASSWORD_LENGTH` em `api/auth/services.py`).
- Não há limite de tentativas de login (rate limit).
