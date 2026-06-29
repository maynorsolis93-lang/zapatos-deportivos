#!/bin/bash

# Script Bash para iniciar Backend y Frontend (Linux/Mac)
# Uso: ./start-all.sh

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  🚀 KIRO SHOES INVENTORY SYSTEM${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# Verificar que las carpetas existan
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: No se encuentra la carpeta 'backend'${NC}"
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: No se encuentra la carpeta 'frontend'${NC}"
    exit 1
fi

# Función para iniciar servicios
start_services() {
    # Iniciar Backend en background
    echo -e "${YELLOW}🔧 Iniciando Backend...${NC}"
    cd backend
    npm run dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Esperar 2 segundos
    sleep 2
    
    # Iniciar Frontend en background
    echo -e "${YELLOW}🎨 Iniciando Frontend...${NC}"
    cd frontend
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # Guardar PIDs
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
    
    echo ""
    echo -e "${GREEN}✅ Servicios iniciados!${NC}"
    echo ""
    echo -e "${CYAN}📍 URLs importantes:${NC}"
    echo -e "   ${WHITE}Backend API:      http://localhost:3000${NC}"
    echo -e "   ${WHITE}Frontend:         http://localhost:5173${NC}"
    echo -e "   ${WHITE}Panel Admin:      http://localhost:5173/admin/${NC}"
    echo ""
    echo -e "${CYAN}🔑 Credenciales Admin:${NC}"
    echo -e "   ${WHITE}Email:    maymesm@yahoo.com${NC}"
    echo -e "   ${WHITE}Password: Solislidia123${NC}"
    echo ""
    echo -e "${GRAY}ℹ️  Los logs se guardan en backend.log y frontend.log${NC}"
    echo -e "${GRAY}ℹ️  Para detener: ./stop-all.sh${NC}"
    echo ""
}

# Ejecutar
start_services
