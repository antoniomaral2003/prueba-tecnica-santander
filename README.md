# 🚀 Sistema de Gestión de Candidatos

Aplicación full-stack moderna para la gestión de candidatos con procesamiento de archivos Excel. Incluye backend en NestJS, frontend en Angular 21 con Angular Material, y despliegue automático en Render.

# 📋 Características Principales

🎯 Backend (NestJS)
- ✅ API REST completa con CRUD de candidatos
- ✅ Procesamiento de archivos Excel con xlsx
- ✅ Validación de datos con class-validator
- ✅ Base de datos PostgreSQL con TypeORM 
- ✅ Migraciones de base de datos
- ✅ Tests unitarios con Jest
- ✅ CORS configurado para producción
- ✅ Endpoint para subida de archivos Excel

🎨 Frontend (Angular 17)
- ✅ Componentes standalone
- ✅ Formularios reactivos con validaciones
- ✅ Tabla Angular Material con paginación y ordenamiento 
- ✅ Subida de archivos Excel con preview
- ✅ Pantalla de detalle de candidatos
- ✅ Gestión de estado reactiva con RxJS
- ✅ Diseño responsive con Angular Material
- ✅ Loading states y manejo de errores

⚙️ DevOps
- ✅ CI/CD con GitHub Actions
- ✅ Despliegue automático en Render
- ✅ Base de datos PostgreSQL
- ✅ Variables de entorno por ambiente
- ✅ Build optimizado para producción



# Pre-requisitos 📋

- Node.js 18.x o superior
- npm 9.x o superior
- PostgreSQL 14+ (local para desarrollo)
- Git

# Instalación Local 🔧

1. Clonar el repositorio

```
git clone https://github.com/tu-usuario/candidates-system.git
cd candidates-system
```

2. Configurar Backend

```
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

3. Configurar Base de Datos Local
```
# Crear base de datos
createdb candidates_db
```

4. Configurar Frontend

```
cd ../frontend
npm install
```

5. Ejecutar en Desarrollo

```
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm start
```

La aplicación estará disponible en:

- Frontend: http://localhost:4200

- Backend API: http://localhost:3000/candidates

# 📁 Estructura de Archivos Excel

Para crear un candidato, sube un archivo Excel con exactamente una fila y las siguientes columnas:

Ejemplo de archivo Excel:

seniority | years | availability
----------|-------|-------------
senior    | 5     | true

# 🧪 Ejecutar Tests

Backend Tests

```
cd backend
npm test              # Ejecutar todos los tests
npm run test:watch    # Modo watch
npm run test:cov      # Con cobertura
npm run test:e2e      # Tests E2E
```

# 🔧 Variables de Entorno

Backend (.env)

```
# Desarrollo
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=candidates_db
DB_SYNCHRONIZE=true
```
Frontend (environment.ts)
```
// Desarrollo
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

# 📚 API Documentation

Endpoints Principales

Método | Endpoint | Descripción
----------|-------|-------------
GET    | /candidates     | Obtener todos los candidatos
----------|-------|-------------
GET    | /candidates/:id     | Obtener un candidato por ID
----------|-------|-------------
POST    | /candidates     | Crear un candidato manualmente
----------|-------|-------------
POST    | /candidates/create-excel     | Crear un candidato con un archivo Excel (.xlsx, .csv) incluido
----------|-------|-------------
PATCH    | /candidates/:id     | Actualizar candidato
----------|-------|-------------
DELETE    | /candidates/:id     | Eliminar candidato

## Construido con 🛠️

* [Angular](https://angular.dev/overview) - El framework usado en el frontend
* [NestJS](https://docs.nestjs.com/) - El framework usado en el backend
* [TypeORM](https://typeorm.io/docs/getting-started) - ORM para TypeScript y JavaScript
* [Render](https://render.com/docs) - Plataforma de despliegue en la nube
* [Angular Material](https://material.angular.dev/guide/getting-started) - Componentes UI para Angular

## Autores ✒️

* **Antonio Martín** - [antoniomaral2003](https://github.com/antoniomaral2003) 

## Licencia 📄

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE.md](LICENSE.md) para detalles




---
⌨️ con ❤️ por [antoniomaral2003](https://github.com/antoniomaral2003) 😊
