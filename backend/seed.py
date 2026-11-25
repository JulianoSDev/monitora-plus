"""Cria as tabelas (se não existirem) e insere os dados essenciais: as 6 disciplinas e seus códigos.

Uso:
    python seed.py                 # cria tabelas e insere/atualiza as disciplinas (idempotente)
    python seed.py --update-codes  # também sobrescreve os códigos dos professores já gravados

Sem a opção --update-codes, rodar de novo NÃO altera os códigos que já estão no banco.
Os códigos abaixo são os do protótipo do front: troque pelos reais antes de ir para produção.
"""

import sys

from sqlalchemy import text

from app_factory import create_app
from extensions import bcrypt, db

OFFERINGS = [
    {
        "id": "off-ihc",
        "subject": "Interação Humano-Computador",
        "short_subject": "IHC",
        "title": "Heurísticas, Usabilidade e Protótipos (90h/a)",
        "mode": "Presencial / Online",
        "location": "Sala 104 · Bloco A / Virtual",
        "short_location": "Sala 104 · Presencial / Online",
        "code": "IHC026",
    },
    {
        "id": "off-es",
        "subject": "Introdução à Engenharia de Software",
        "short_subject": "Eng. Software",
        "title": "Requisitos, Casos de Uso e Processos (72h/a)",
        "mode": "Presencial",
        "location": "Presencial · Sala 201, Bloco A",
        "short_location": "Sala 201 · Presencial",
        "code": "ESW026",
    },
    {
        "id": "off-aoc",
        "subject": "Arquitetura e Organização de Computadores",
        "short_subject": "Arq. Computadores",
        "title": "Sistemas Numéricos, Portas Lógicas e ULA (54h/a)",
        "mode": "Presencial",
        "location": "Presencial · Lab Hardware, Bloco C",
        "short_location": "Lab Hardware · Presencial",
        "code": "AOC026",
    },
    {
        "id": "off-md",
        "subject": "Matemática Discreta",
        "short_subject": "Mat. Discreta",
        "title": "Conjuntos, Relações, Grafos e Indução (54h/a)",
        "mode": "Online",
        "location": "Online · Sala Virtual Acadêmica",
        "short_location": "Sala Virtual · Online",
        "code": "MAT026",
    },
    {
        "id": "off-alg",
        "subject": "Algoritmo e Programação",
        "short_subject": "Algoritmos",
        "title": "Vetores, Matrizes e Lógica em Python (54h/a)",
        "mode": "Presencial",
        "location": "Presencial · Lab 02, Bloco B",
        "short_location": "Lab 02 · Presencial",
        "code": "ALG026",
    },
    {
        "id": "off-ing",
        "subject": "Introdução à Língua Inglesa",
        "short_subject": "Língua Inglesa",
        "title": "Leitura Técnica e Vocabulário de Computação (54h/a)",
        "mode": "Online",
        "location": "Online · Sala Virtual Acadêmica",
        "short_location": "Sala Virtual · Online",
        "code": "ING026",
    },
]


def seed(update_codes: bool = False) -> None:
    db.create_all()

    code_update = ", professor_code_hash = EXCLUDED.professor_code_hash" if update_codes else ""
    sql = text(
        f"""
        INSERT INTO offerings
            (id, subject, short_subject, title, mode, location, short_location, professor_code_hash)
        VALUES
            (:id, :subject, :short_subject, :title, :mode, :location, :short_location, :code_hash)
        ON CONFLICT (id) DO UPDATE SET
            subject = EXCLUDED.subject,
            short_subject = EXCLUDED.short_subject,
            title = EXCLUDED.title,
            mode = EXCLUDED.mode,
            location = EXCLUDED.location,
            short_location = EXCLUDED.short_location
            {code_update}
        """
    )

    for off in OFFERINGS:
        params = {k: v for k, v in off.items() if k != "code"}
        params["code_hash"] = bcrypt.generate_password_hash(off["code"]).decode("utf-8")
        db.session.execute(sql, params)

    db.session.commit()
    print(f"OK: {len(OFFERINGS)} disciplinas gravadas.")


if __name__ == "__main__":
    with create_app().app_context():
        seed(update_codes="--update-codes" in sys.argv)
