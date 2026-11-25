#!/bin/sh
set -eu

echo "Aplicando migrações..."
flask --app "app_factory:create_app()" db upgrade

echo "Banco pronto."

echo "Executando seed do banco de dados..."
python seed.py

echo "Tudo pronto, iniciando o servidor..."

exec "$@"
