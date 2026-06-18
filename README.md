# LMSIAC

Aplicacion web LMS con backend Spring Boot y frontend React. Usa las tablas existentes en Supabase PostgreSQL; el backend esta configurado con `spring.jpa.hibernate.ddl-auto=none`, por lo que no elimina ni recrea tablas.

## Tecnologias

- Backend: Java 21, Spring Boot 3, Maven, Spring Web, Spring Data JPA, Spring Security, JWT, PostgreSQL Driver, Validation.
- Frontend: React, Vite, TypeScript, Tailwind CSS, Axios, React Router.
- Base de datos: Supabase PostgreSQL.

## Variables de entorno backend

Configura estas variables antes de ejecutar:

```powershell
$env:DB_URL="jdbc:postgresql://HOST:5432/postgres"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="TU_PASSWORD"
$env:JWT_SECRET="usa-una-clave-secreta-de-al-menos-32-caracteres"
$env:SUPABASE_URL="https://TU_PROYECTO.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="TU_SERVICE_ROLE_KEY"
$env:SUPABASE_STORAGE_BUCKET="lmsiac"
```

No coloques credenciales reales en el codigo.

## Supabase Storage

Crear un bucket llamado `lmsiac` en Supabase Storage. Para URLs publicas, configura el bucket como publico o agrega politicas de lectura compatibles con tu proyecto. La `service role key` solo se usa en backend mediante variables de entorno y no debe exponerse en frontend.

Endpoint de subida:

```http
POST /api/files/upload
Authorization: Bearer TOKEN
Content-Type: multipart/form-data

file=<archivo>
folder=sesiones|tareas|entregas
```

Respuesta:

```json
{
  "url": "https://...",
  "path": "sesiones/..."
}
```

Tipos permitidos: `pdf`, `doc`, `docx`, `ppt`, `pptx`, `xls`, `xlsx`, `jpg`, `jpeg`, `png`, `mp4`. Tamano maximo: 10MB. Archivos peligrosos como `exe`, `bat`, `cmd`, `js` y `sh` son rechazados.

Flujo de prueba de archivos:

1. Login como profesor.
2. Crear una sesion subiendo un PDF como material.
3. Login como alumno y abrir el material.
4. Login como profesor y crear una tarea con archivo.
5. Login como alumno, abrir la tarea y subir entrega.
6. Login como profesor, abrir la entrega y calificar.

## Modulos Semanales

LMSIAC incluye una vista de curso tipo LMS universitario, organizada por semanas y recursos. Antes de usarla en Supabase ejecuta la migracion no destructiva:

```sql
backend/migrations/001_modulos_clase.sql
```

La migracion crea:

- `modulos_clase`
- `recursos_modulo`
- columna opcional `tareas.modulo_id`

Endpoints profesor:

- `GET /api/profesor/clases/{claseId}/modulos`
- `POST /api/profesor/clases/{claseId}/modulos`
- `PUT /api/profesor/modulos/{moduloId}`
- `DELETE /api/profesor/modulos/{moduloId}`
- `PATCH /api/profesor/modulos/{moduloId}/visible`
- `GET /api/profesor/modulos/{moduloId}/recursos`
- `POST /api/profesor/modulos/{moduloId}/recursos`
- `PUT /api/profesor/recursos/{recursoId}`
- `DELETE /api/profesor/recursos/{recursoId}`
- `PATCH /api/profesor/recursos/{recursoId}/visible`

Endpoint alumno:

- `GET /api/alumno/clases/{claseId}/modulos`

Rutas frontend:

- Profesor: `/profesor/clases/:id/curso`
- Alumno: `/alumno/clases/:id/curso`
- Visor PDF: `/viewer/pdf?title=&url=`

Para subir recursos de modulo se usa Supabase Storage con folder `recursos`.

## Ejecutar backend

```powershell
cd backend
mvn spring-boot:run
```

El backend corre en `http://localhost:8080`.

## Ejecutar frontend

```powershell
cd frontend
npm install
npm run dev
```

El frontend corre en `http://localhost:5173`.

Opcionalmente puedes definir `VITE_API_URL` si el backend no esta en `http://localhost:8080/api`.

## Crear primer administrador

Ejecuta una sola vez, antes de que exista cualquier usuario con rol `ADMINISTRADOR`:

```http
POST http://localhost:8080/api/setup/admin
Content-Type: application/json

{
  "nombres": "Admin",
  "apellidos": "LMSIAC",
  "email": "admin@lms.com",
  "password": "123456"
}
```

El endpoint rechaza la solicitud si ya existe un administrador.

## Login

```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "admin@lms.com",
  "password": "123456"
}
```

Respuesta:

```json
{
  "token": "...",
  "usuario": {
    "id": 1,
    "nombres": "Admin",
    "apellidos": "LMSIAC",
    "email": "admin@lms.com",
    "rol": "ADMINISTRADOR",
    "estado": true
  }
}
```

## Endpoints principales

- Publicos: `POST /api/auth/login`, `POST /api/setup/admin`.
- Administrador: usuarios, roles, cursos, clases, alumnos por clase, alumnos disponibles, dashboard y reportes en `/api/admin/**`.
- Profesor: clases asignadas, sesiones, tareas, entregas, examenes, preguntas, opciones y streaming en `/api/profesor/**`.
- Alumno: clases matriculadas, sesiones, tareas, entregas, examenes, respuestas, streaming y notas en `/api/alumno/**`.

Endpoints admin agregados:

- `PATCH /api/admin/clases/{id}/estado`
- `GET /api/admin/clases/{claseId}/alumnos`
- `GET /api/admin/alumnos-disponibles/{claseId}`
- `GET /api/admin/reportes`

Endpoints profesor agregados o completados:

- `GET /api/profesor/dashboard`
- `GET /api/profesor/clases/{claseId}/alumnos`
- `GET /api/profesor/clases/{claseId}/personas`
- `PUT /api/profesor/examenes/{id}`
- `DELETE /api/profesor/examenes/{id}`
- `PUT /api/profesor/preguntas/{id}`
- `DELETE /api/profesor/preguntas/{id}`
- `PUT /api/profesor/opciones/{id}`
- `DELETE /api/profesor/opciones/{id}`
- `PATCH /api/profesor/streaming/{id}/estado`

Endpoints alumno agregados o completados:

- `GET /api/alumno/dashboard`
- `GET /api/alumno/clases/{claseId}/personas`
- `PUT /api/alumno/entregas/{entregaId}`

Endpoint admin agregado:

- `GET /api/admin/clases/{claseId}/personas`

## Roles

- `ADMINISTRADOR`: gestiona usuarios, roles, cursos, clases, asignacion de profesores y matricula de alumnos.
- `PROFESOR`: gestiona solo sus clases asignadas, sesiones, tareas, entregas, examenes y clases en vivo.
- `ALUMNO`: ve solo clases donde esta matriculado, revisa materiales, entrega tareas, responde examenes y accede a streaming.
