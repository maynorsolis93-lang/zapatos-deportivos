#!/bin/bash

# Script de Backup de Base de Datos
# Uso: ./backup-db.sh

# Configuración
DB_NAME="${DB_NAME:-kiro_inventory}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 Iniciando backup de base de datos...${NC}\n"

# Crear directorio si no existe
if [ ! -d "$BACKUP_DIR" ]; then
  echo -e "${YELLOW}📁 Creando directorio de backups...${NC}"
  mkdir -p $BACKUP_DIR
fi

# Hacer backup
echo -e "${YELLOW}💾 Creando backup...${NC}"
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Backup creado exitosamente${NC}"
  
  # Comprimir
  echo -e "${YELLOW}🗜️  Comprimiendo backup...${NC}"
  gzip $BACKUP_FILE
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup comprimido: $BACKUP_FILE.gz${NC}"
    
    # Mostrar tamaño
    SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
    echo -e "${GREEN}📦 Tamaño: $SIZE${NC}"
  else
    echo -e "${RED}❌ Error al comprimir backup${NC}"
    exit 1
  fi
  
  # Eliminar backups antiguos (más de 30 días)
  echo -e "\n${YELLOW}🧹 Limpiando backups antiguos (>30 días)...${NC}"
  DELETED=$(find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete -print | wc -l)
  
  if [ $DELETED -gt 0 ]; then
    echo -e "${GREEN}✅ $DELETED backups antiguos eliminados${NC}"
  else
    echo -e "${GREEN}✅ No hay backups antiguos para eliminar${NC}"
  fi
  
  # Listar backups existentes
  echo -e "\n${GREEN}📋 Backups disponibles:${NC}"
  ls -lh $BACKUP_DIR/backup_*.sql.gz 2>/dev/null | tail -5
  
  echo -e "\n${GREEN}✅ Backup completado exitosamente!${NC}"
  exit 0
else
  echo -e "${RED}❌ Error al crear backup${NC}"
  exit 1
fi
