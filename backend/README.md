# Backend - Etapa 1

Esta carpeta contiene la base de datos y scripts iniciales para inventario.

## Requisitos

- Node.js 18+

## Configuracion

1. Copiar variables de entorno:
   - `cp .env.example .env` (PowerShell: `Copy-Item .env.example .env`)
2. Instalar dependencias:
   - `npm install`
3. Ejecutar setup completo:
   - `npm run db:setup`

## Scripts

- `npm run db:migrate`: crea migracion inicial
- `npm run db:generate`: genera Prisma Client
- `npm run db:seed`: inserta catalogos, tallas y admin
- `npm run db:import`: importa productos desde `public/data/store.json`
- `npm run db:setup`: ejecuta todo en orden

## Credenciales admin inicial

- Email: `admin@kiroshoes.local`
- Password: `Admin12345`

> En Etapa 2 se reemplaza el hash sha256 por bcrypt/argon2 y flujo de login real.
