# Monitora+ na radar-vps — apresentação sem domínio

Destino: Ubuntu 24.04, `35.253.22.18`, usuário `julianosavio32`.
Use uma pasta própria (`~/monitora-plus`), separada de `~/radar-ofertas`.
API e PostgreSQL ficam no Docker. Somente `127.0.0.1:8000` é publicado;
o perfil `demo` cria um Cloudflare Quick Tunnel com HTTPS temporário.
Não precisa de domínio, conta Cloudflare ou portas 80/443 abertas.
O túnel precisa de saída HTTPS e TCP 7844 (HTTP/2); não altera o firewall do GCP.

## Preparação única do Docker (Ubuntu)

Se `sudo docker compose version` funcionar, pule esta seção.

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
. /etc/os-release
printf '%s\n' "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $VERSION_CODENAME stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
```

## Primeiro deploy

```bash
# Execute na VPS, após ssh julianosavio32@35.253.22.18
git clone https://github.com/JulianoSDev/monitora-plus.git ~/monitora-plus
cd ~/monitora-plus
git switch main
git pull --ff-only origin main
cd backend
python3 scripts/create_env.py
sudo docker compose --profile demo up -d --build --wait
sudo docker compose ps
curl -fsS http://127.0.0.1:8000/api/health
curl -fsS http://127.0.0.1:8000/api/offerings
sudo docker compose logs --tail=50 tunnel
```

Se a pasta já existir, comece por `cd ~/monitora-plus`; não clone por cima.
O gerador lê `.env.example`, cria chaves independentes e aleatórias para
`SECRET_KEY`, `JWT_SECRET_KEY`, senha PostgreSQL e seis códigos privados de monitor.
Ele grava `.env` com permissão 0600 e **recusa sobrescrever** um arquivo existente.
O CORS já inclui `https://julianosdev.github.io` e origens de desenvolvimento.
Cookies HTTPS usam `JWT_COOKIE_SAMESITE=None` e `JWT_COOKIE_SECURE=True`.
Somente altere a senha de um banco existente com `ALTER ROLE`; mudar `.env`
sozinho não muda a senha gravada no volume do PostgreSQL.

Abra o `.env` na VPS para consultar os códigos de professor e distribua-os
privadamente aos monitores da demonstração. Nunca envie o arquivo ao GitHub.
Os códigos públicos no protótipo não autorizam cadastros no backend configurado.
`python seed.py` preserva hashes existentes; para rotacionar, ajuste o JSON e rode
`sudo docker compose exec api python seed.py --update-codes`.

Copie a URL `https://....trycloudflare.com` dos logs e teste:

```bash
API_URL=https://SUBSTITUA-PELA-URL-DOS-LOGS.trycloudflare.com
curl -fsS "$API_URL/api/health"
curl -fsS "$API_URL/api/offerings"
curl -i -X OPTIONS "$API_URL/api/slots/1" \
  -H 'Origin: https://julianosdev.github.io' \
  -H 'Access-Control-Request-Method: DELETE' \
  -H 'Access-Control-Request-Headers: X-CSRF-TOKEN'
sudo docker compose logs --tail=100 -f api
```

Health esperado: `{"status":"ok"}`. Disciplinas: objeto com seis `offerings`.
Preflight deve devolver origem exata e `Access-Control-Allow-Credentials: true`.
Quick Tunnel muda de URL ao recriar/reiniciar o processo e não tem garantia de
disponibilidade. Verifique a URL e o login antes da apresentação.

## Atualizar e parar

```bash
cd ~/monitora-plus
git pull --ff-only origin main
cd backend
sudo docker compose --profile demo up -d --build --wait
# Preserve o volume e os dados ao parar a apresentação:
sudo docker compose --profile demo stop
# Retomar (o túnel pode ganhar outra URL):
sudo docker compose --profile demo up -d --wait
sudo docker compose logs --tail=50 tunnel
```

O entrypoint aplica migrações e seed antes do Gunicorn. Falha de migração/seed
interrompe o processo e aparece nos logs; não fica tentando indefinidamente.
Não use `down -v` no projeto de apresentação: isso apaga o banco.
Limites: API 320 MiB, PostgreSQL 256 MiB, túnel 128 MiB; dois workers Gunicorn.
São valores iniciais para piloto compartilhando 2 GB com o Radar, não dimensionamento
para produção. Monitore `sudo docker stats --no-stream` e `free -m` antes de apresentar.

## Testes com PostgreSQL descartável

O nome de projeto abaixo isola rede, containers e volume dos dados da apresentação.
Não use `MONITORA_TEST_DATABASE=1` em outro banco: os testes limpam tabelas.

```bash
cd ~/monitora-plus/backend
sudo docker compose -p monitora-plus-test up -d --wait db
sudo docker compose -p monitora-plus-test run --rm --build -T \
  -e MONITORA_TEST_DATABASE=1 api python -m unittest discover -s tests -v
sudo docker compose -p monitora-plus-test down -v
```

Testes cobrem CORS com múltiplas origens, cookies seguros/CSRF, nomes de turma até
80 caracteres, exclusão por monitor da disciplina, conflito 409, histórico,
republicação e disputa simultânea entre reservar e excluir.
Migração amplia `users.course`, adiciona exclusão lógica (`slots.deleted_at`),
índice único apenas para horários ativos e a sequência de protocolos ausente na
migração inicial. Downgrade recusa perder nomes longos ou histórico excluído.

## Frontend integrado

A interface publicada usa `api.js` para cookies/CSRF e `app.js` para carregar os
dados reais. A URL HTTPS está em `../api-config.js`; atualize-a quando o Quick
Tunnel mudar e envie a alteração ao GitHub Pages. Apenas preferências visuais
ficam no localStorage. O backend valida vagas, códigos de professor e permissões.
Os acessos Google/Gennera simulados foram removidos. Monitores usam o campo de
código privado, sem a limitação de seis caracteres do protótipo.

O exemplo abaixo documenta o protocolo usado pelo cliente:

Nenhum arquivo do frontend precisa mudar para subir a API. Depois, integre as rotas:

```js
const local = ["localhost", "127.0.0.1"].includes(location.hostname);
const API_BASE = local
  ? "http://localhost:8000/api"
  : "https://SUBSTITUA-PELA-URL-DOS-LOGS.trycloudflare.com/api";
let csrfToken;

async function api(path, { method = "GET", body } = {}) {
  const response = await fetch(API_BASE + path, {
    method,
    credentials: "include",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(!["GET", "HEAD", "OPTIONS"].includes(method) && csrfToken
        ? { "X-CSRF-TOKEN": csrfToken } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = response.status === 204 ? {} : await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error || "Falha na API"), {
    status: response.status, fields: data.fields || {},
  });
  if (data.csrf_token) csrfToken = data.csrf_token;
  if (path === "/auth/logout" || (path === "/auth/me" && method === "DELETE")) csrfToken = undefined;
  return data;
}
```

O fallback é escolhido pelo host local; falhas da API HTTPS devem aparecer ao
usuário, sem trocar silenciosamente por localhost ou dados fictícios.
Para desenvolvimento HTTP ajuste `.env` para `JWT_COOKIE_SECURE=False` e
`JWT_COOKIE_SAMESITE=Lax` e recrie a API. Use o mesmo hostname dos dois lados.
Login/cadastro e `GET /auth/me` devolvem `csrf_token` no JSON (sem devolver JWT).
Guarde o CSRF em memória e restaure via `/auth/me`; não tente ler o cookie de outro
domínio com `document.cookie`. Logout autenticado também exige CSRF.

**Limitação para a apresentação:** GitHub Pages → trycloudflare é cross-site.
`SameSite=None; Secure` é necessário, mas o navegador ainda pode bloquear cookies
de terceiros. Teste o navegador usado na apresentação. Se ele bloquear, use uma
exceção de cookies para essa demonstração ou sirva frontend e API pela mesma
origem num próximo passo. Não desative CSRF nem exponha JWT ao JavaScript.
A integração substitui o estado local do protótipo; contas antigas precisam ser
cadastradas novamente na API.

## Alternativa futura com domínio

Use `Caddyfile.example`, com registro A do subdomínio apontando para `35.253.22.18`
(reserve IP estático no GCP antes de depender dele). Permita TCP 80/443 nas regras
de firewall do GCP e no firewall do host. Instale Caddy pelo repositório oficial,
adicione o bloco ao Caddyfile existente, valide e recarregue:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Não substitua configurações de outros serviços. HTTPS é emitido automaticamente
para o domínio público; não presuma certificado confiável apenas usando o IP.

Referências: [Docker Ubuntu](https://docs.docker.com/engine/install/ubuntu/),
[Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/),
[Caddy HTTPS](https://caddyserver.com/docs/automatic-https),
[JWT e CSRF](https://flask-jwt-extended.readthedocs.io/en/stable/options.html),
[cookies de terceiros](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Third-party_cookies).
