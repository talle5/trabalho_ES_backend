#!/usr/bin/env bash
# Cria a fila de demonstração do dia. Uso: bash scripts/popular-demo.sh
URL=${URL:-https://ubs-backend-90zn.onrender.com}
SUFIXO=$(date +%H%M%S)

for p in 1 2 3 4 5; do
  curl -s -X POST "$URL/fila" -H "Content-Type: application/json" \
    -d "{\"pacienteId\":$p,\"senha\":\"L$p-$SUFIXO\",\"profissionalId\":2}" > /dev/null
done

for p in 6 7 8; do
  curl -s -X POST "$URL/fila" -H "Content-Type: application/json" \
    -d "{\"pacienteId\":$p,\"senha\":\"R$p-$SUFIXO\",\"profissionalId\":1}" > /dev/null
done

echo "Fila de demonstração criada."
