#!/bin/bash

# Script de Restauración de Base de Datos
# Uso: ./restore-db.sh backup_20260529_120000.sql.gz

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BACKUP_FILE=$1
DB_NAME="${DB_NAME:-kiro_inventory}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Validar argumentos
if [ -z "$BACKUP_FILE" ]; then
  echo -e "${RED}❌ Error: Debes especificar un archivo de backup${NC}"
  echo -e "${YELLOW}Uso: ./restore-db.sh <archivo_backup.sql.gz>${NC}"
  echo -e "\n${YELLOW}Backups disponibles:${NC}"
  ls -lh ./backups/backup_*.sql.gz 2>/dev/null | tail -5
  exit 1
fi

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}❌ Error: El archivo $BACKUP_FILE no existe${NC}"
  exit 1
fi

echo -e "${YELLOW}⚠️  ADVERTENCIA: Esta operación sobrescribirá la base de datos actual${NC}"
echo -e "${YELLOW}Base de datos: $DB_NAME${NC}"
echo -e "${YELLOW}Archivo: $BACKUP_FILE${NC}\n"

read -p "¿Estás seguro de que deseas continuar? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo -e "${YELLOW}❌ Operación cancelada${NC}"
  exit 0
fi

echo -e "\n${GREEN}🔄 Iniciando restauración de base de datos...${NC}\n"

# Descomprimir
echo -e "${YELLOW}📦 Descomprimiendo backup...${NC}"
gunzip -c $BACKUP_FILE > temp_restore.sql

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Error al descomprimir backup${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Backup descomprimido${NC}"

# Hacer backup de seguridad antes de restaurar
echo -e "\n${YELLOW}💾 Creando backup de seguridad antes de restaurar...${NC}"
SAFETY_BACKUP="./backups/safety_backup_$(date +%Y%m%d_%H%M%S).sql"
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $SAFETY_BACKUP

if [ $? -eq 0 ]; then
  gzip $SAFETY_BACKUP
  echo -e "${GREEN}✅ Backup de seguridad creado: $SAFETY_BACKUP.gz${NC}"
else
  echo -e "${RED}❌ Error al crear backup de seguridad${NC}"
  rm -f temp_restore.sql
  exit 1
fi

# Restaurar
echo -e "\n${YELLOW}🔄 Restaurando base de datos...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < temp_restore.sql

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Base de datos restaurada exitosamente${NC}"
  
  # Limpiar archivo temporal
  rm -f temp_restore.sql
  echo -e "${GREEN}✅ Archivos temporales eliminados${NC}"
  
  echo -e "\n${GREEN}✅ Restauración completada exitosamente!${NC}"
  echo -e "${YELLOW}💡 Backup de seguridad guardado en: $SAFETY_BACKUP.gz${NC}"
  exit 0
else
  echo -e "${RED}❌ Error al restaurar base de datos${NC}"
  echo -e "${YELLOW}💡 Puedes restaurar el backup de seguridad: $SAFETY_BACKUP.gz${NC}"
  rm -f temp_restore.sql
  exit 1
fi
