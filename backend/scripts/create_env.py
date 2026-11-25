"""Create private Docker/HTTPS configuration once; never overwrite existing secrets."""
import json
from pathlib import Path
import secrets

backend = Path(__file__).resolve().parents[1]
password = secrets.token_hex(24)
values = {
    "SQLALCHEMY_DATABASE_URI": f"postgresql+psycopg://postgres:{password}@db:5432/monitora",
    "SECRET_KEY": secrets.token_hex(32),
    "JWT_SECRET_KEY": secrets.token_hex(32),
    "POSTGRES_PASSWORD": password,
    "PROFESSOR_CODES_JSON": json.dumps({
        key: secrets.token_hex(8).upper()
        for key in ("off-ihc", "off-es", "off-aoc", "off-md", "off-alg", "off-ing")
    }, separators=(",", ":")),
}
example = (backend / ".env.example").read_text(encoding="utf-8")
lines = []
for line in example.splitlines():
    key = line.split("=", 1)[0]
    lines.append(f"{key}={values[key]}" if key in values else line)
target = backend / ".env"
with target.open("x", encoding="utf-8", newline="\n") as file:
    target.chmod(0o600)
    file.write("\n".join(lines) + "\n")
print(".env criado. Segredos preservados no arquivo; não o envie ao GitHub.")
