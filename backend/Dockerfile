# Dockerfile para Kiro Shoes Backend
FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache postgresql-client

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar el resto del código
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Crear directorio para logs
RUN mkdir -p logs

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
