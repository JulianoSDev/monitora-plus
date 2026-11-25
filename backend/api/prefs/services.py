import json
import re

from sqlalchemy import text

from api.common import ServiceError, transactional
from extensions import db

HEX_COLOR_RE = re.compile(r"^#[0-9a-fA-F]{6}$")

VALID_THEMES = {"light", "dark", "contrast"}
VALID_COLOR_MODES = {None, "system", "light", "dark", "contrast"}
VALID_THEME_PRESETS = {"monitora", "academic-navy", "forest-slate", "amber-studio", "olive-moss", "graphite"}
VALID_UI_FONTS = {"dm-sans", "system", "readable", "mono"}
VALID_LAYOUTS = {"list", "matrix"}
VALID_ICS_MINUTES = {0, 15, 30, 60}
VALID_CVD_FILTERS = {"none", "protanopia", "deuteranopia", "tritanopia", "achromatopsia"}

BOOL_PREF_KEYS = (
    "confirmBeforeBook",
    "autoIcsHint",
    "dyslexiaSpacing",
    "readingMask",
    "pauseDistractions",
    "extraFocus",
    "largeTargets",
    "reducedMotion",
    "vlibras",
)

HEX_PREF_KEYS = ("customAccent", "customBg", "customFg")

ALLOWED_PREF_KEYS = {
    "theme",
    "fontScale",
    "colorMode",
    "themePreset",
    "uiFont",
    "defaultLayout",
    "icsReminderMinutes",
    "cvdFilter",
    *BOOL_PREF_KEYS,
    *HEX_PREF_KEYS,
}


def _validate_preferences(raw: dict) -> dict:
    if not isinstance(raw, dict):
        raise ServiceError("Formato de preferências inválido.", 422)

    unknown = [k for k in raw.keys() if k not in ALLOWED_PREF_KEYS]
    if unknown:
        raise ServiceError(
            "Preferências contêm campos não suportados.",
            422,
            {k: "Campo não permitido." for k in unknown},
        )

    errors: dict[str, str] = {}
    cleaned: dict = {}

    if "theme" in raw:
        v = raw["theme"]
        if v not in VALID_THEMES:
            errors["theme"] = "Tema inválido."
        else:
            cleaned["theme"] = v

    if "fontScale" in raw:
        v = raw["fontScale"]
        if isinstance(v, bool) or not isinstance(v, (int, float)) or not (0.88 <= float(v) <= 1.52):
            errors["fontScale"] = "Escala de fonte deve ficar entre 0.88 e 1.52."
        else:
            cleaned["fontScale"] = round(float(v), 2)

    if "colorMode" in raw:
        v = raw["colorMode"]
        if v not in VALID_COLOR_MODES:
            errors["colorMode"] = "Modo de cor inválido."
        else:
            cleaned["colorMode"] = v

    if "themePreset" in raw:
        v = raw["themePreset"]
        if v not in VALID_THEME_PRESETS:
            errors["themePreset"] = "Preset de tema inválido."
        else:
            cleaned["themePreset"] = v

    if "uiFont" in raw:
        v = raw["uiFont"]
        if v not in VALID_UI_FONTS:
            errors["uiFont"] = "Fonte da interface inválida."
        else:
            cleaned["uiFont"] = v

    if "defaultLayout" in raw:
        v = raw["defaultLayout"]
        if v not in VALID_LAYOUTS:
            errors["defaultLayout"] = "Layout padrão inválido."
        else:
            cleaned["defaultLayout"] = v

    if "icsReminderMinutes" in raw:
        v = raw["icsReminderMinutes"]
        if isinstance(v, bool) or not isinstance(v, int) or v not in VALID_ICS_MINUTES:
            errors["icsReminderMinutes"] = "Antecedência do lembrete inválida."
        else:
            cleaned["icsReminderMinutes"] = v

    if "cvdFilter" in raw:
        v = raw["cvdFilter"]
        if v not in VALID_CVD_FILTERS:
            errors["cvdFilter"] = "Filtro para daltonismo inválido."
        else:
            cleaned["cvdFilter"] = v

    for key in BOOL_PREF_KEYS:
        if key in raw:
            v = raw[key]
            if not isinstance(v, bool):
                errors[key] = "Valor booleano esperado."
            else:
                cleaned[key] = v

    for key in HEX_PREF_KEYS:
        if key in raw:
            v = raw[key]
            if v is None:
                cleaned[key] = None
            elif isinstance(v, str) and HEX_COLOR_RE.match(v.strip()):
                cleaned[key] = v.strip().lower()
            else:
                errors[key] = "Cor hexadecimal inválida (use #RRGGBB)."

    if errors:
        raise ServiceError("Preferências inválidas.", 422, errors)

    return cleaned


def _format_row(row) -> dict:
    updated = row["preferences_updated_at"]
    return {
        "preferences": row["preferences"],
        "updated_at": updated.isoformat() if updated else None,
    }


class PrefsService:
    @staticmethod
    def get_prefs(user_id: int) -> dict:
        row = db.session.execute(
            text("SELECT preferences, preferences_updated_at FROM users WHERE id = :id"),
            {"id": user_id},
        ).mappings().first()
        if not row:
            raise ServiceError("Sessão inválida. Faça login novamente.", 401)
        return _format_row(row)

    @staticmethod
    @transactional
    def save_prefs(user_id: int, data: dict) -> dict:
        payload = data.get("preferences") if isinstance(data, dict) and "preferences" in data else data
        cleaned = _validate_preferences(payload)
        row = db.session.execute(
            text(
                """
                UPDATE users
                SET preferences = CAST(:prefs AS jsonb),
                    preferences_updated_at = NOW()
                WHERE id = :id
                RETURNING preferences, preferences_updated_at
                """
            ),
            {"prefs": json.dumps(cleaned), "id": user_id},
        ).mappings().first()
        if not row:
            raise ServiceError("Sessão inválida. Faça login novamente.", 401)
        return _format_row(row)

    @staticmethod
    @transactional
    def reset_prefs(user_id: int) -> dict:
        # Registra explicitamente o timestamp do reset para impedir que outro dispositivo reenvie prefs antigas.
        row = db.session.execute(
            text(
                """
                UPDATE users
                SET preferences = NULL,
                    preferences_updated_at = NOW()
                WHERE id = :id
                RETURNING preferences, preferences_updated_at
                """
            ),
            {"id": user_id},
        ).mappings().first()
        if not row:
            raise ServiceError("Sessão inválida. Faça login novamente.", 401)
        return _format_row(row)
