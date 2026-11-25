"""Peças compartilhadas pelos módulos da API (sem dependência de nenhum deles)."""

from datetime import datetime
from functools import wraps
from zoneinfo import ZoneInfo

from flask import current_app, request

from extensions import db

# Faixas de 40 minutos permitidas (as mesmas do front).
TIME_BANDS = ["14:00 - 14:40", "15:00 - 15:40", "16:30 - 17:10", "18:30 - 19:10"]
SLOT_DURATION_MINUTES = 40

WEEKDAY_NAMES = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]

# Nomes dos monitores de uma disciplina (usa o alias `o` para offerings).
# É uma constante do código, nunca recebe dado do usuário.
MONITOR_NAMES_SQL = (
    "COALESCE((SELECT array_agg(m.name ORDER BY m.name) FROM users m "
    "WHERE m.role = 'monitor' AND m.offering_id = o.id), CAST('{}' AS text[]))"
)


class ServiceError(Exception):
    """Erro de regra de negócio/validação. A rota o converte em resposta JSON."""

    def __init__(self, message: str, status: int = 400, fields: dict | None = None):
        super().__init__(message)
        self.message = message
        self.status = status
        self.fields = fields or {}


def clean_text(value) -> str:
    """Valor recebido do JSON como string sem espaços nas pontas (aceita inteiro, ex.: matrícula)."""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, int) and not isinstance(value, bool):
        return str(value)
    return ""


def get_json_body() -> dict:
    """Corpo JSON da requisição como dict (vazio se não houver ou se não for objeto)."""
    data = request.get_json(force=True, silent=True)
    return data if isinstance(data, dict) else {}


def now_local() -> datetime:
    """Data/hora atual no fuso configurado, sem tzinfo (compatível com date + time do banco)."""
    tz = ZoneInfo(current_app.config["TIMEZONE"])
    return datetime.now(tz).replace(tzinfo=None)


def transactional(fn):
    """Faz commit se o método terminar bem e rollback se qualquer exceção sair dele."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            result = fn(*args, **kwargs)
            db.session.commit()
            return result
        except Exception:
            db.session.rollback()
            raise

    return wrapper
