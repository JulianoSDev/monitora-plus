#!/bin/bash

echo "Aguardando banco..."
while ! flask --app "app_factory:create_app()" db upgrade; do
    echo "Falhou, tentando de novo em 2s..."
    sleep 2
done

echo "Banco pronto."

echo "Executando seed do banco de dados..."
python seed.py

echo "Tudo pronto, iniciando o servidor..."

exec "$@"