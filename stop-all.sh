#!/bin/bash

# Script para detener Backend y Frontend (Linux/Mac)
# Uso: ./stop-all.sh

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
echo ""

# Detener Backend
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Deteniendo Backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID
        echo -e "${GREEN}✅ Backend detenido${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend ya estaba detenido${NC}"
    fi
    rm .backend.pid
else
    echo -e "${YELLOW}⚠️  No se encontró PID del Backend${NC}"
fi

# Detener Frontend
if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Deteniendo Frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID
        echo -e "${GREEN}✅ Frontend detenido${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend ya estaba detenido${NC}"
    fi
    rm .frontend.pid
else
    echo -e "${YELLOW}⚠️  No se encontró PID del Frontend${NC}"
fi

# Limpiar logs
if [ -f backend.log ]; then
    rm backend.log
fi

if [ -f frontend.log ]; then
    rm frontend.log
fi

echo ""
echo -e "${GREEN}✅ Servicios detenidos completamente${NC}"
echo ""
