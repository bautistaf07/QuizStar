# QuizStar - Backend (NestJS + Prisma + PostgreSQL en Supabase)

API del MVP de QuizStar. El frontend (Next.js) solo habla con esta API; nunca con la base de datos.

## Cómo correrlo (PowerShell)

```powershell
cd backend
npm install
Copy-Item .env.example .env      # luego abre .env y pega tu DATABASE_URL y un JWT_SECRET
npx prisma db push               # crea las tablas en Supabase
npm run db:seed                  # crea la institución y usuarios de prueba
npm run start:dev                # API en http://localhost:4000
```

Usuarios de prueba (solo para desarrollo):

| Rol | Correo | Contraseña |
|---|---|---|
| ADMIN | admin@quizstar.test | Admin12345 |
| PROFESOR | profe@quizstar.test | Profe12345 |
| ESTUDIANTE | est1@quizstar.test | Estu12345 |

## Endpoints

| Método | Ruta | Roles | SWR |
|---|---|---|---|
| POST | /auth/login | público | SWR-AUTH-001, 002 |
| GET | /auth/me | autenticado | SWR-AUTH-007 |
| POST | /usuarios | ADMIN | SWR-USR-001, SWR-SEC-002, SWR-USR-006 |
| GET | /usuarios | ADMIN, PROFESOR | SWR-USR-001 |
| PATCH | /usuarios/:id/desactivar | ADMIN | SWR-USR-001 |
| POST | /grupos | ADMIN, PROFESOR | SWR-CUR-001 |
| GET | /grupos | todos (cada uno ve lo suyo) | SWR-CUR-001 |
| POST | /grupos/:id/matriculas | ADMIN, PROFESOR | SWR-CUR-003 |
| GET | /grupos/:id/estudiantes | ADMIN, PROFESOR | SWR-CUR-003 |
| POST | /quices | PROFESOR | SWR-QUIZ-001 |
| GET | /quices | PROFESOR, ESTUDIANTE | SWR-ASG-002 |
| GET | /quices/:id | PROFESOR, ESTUDIANTE | SWR-QUIZ-001 |
| POST | /quices/:id/asignaciones | PROFESOR | SWR-ASG-002 |
| POST | /quices/:id/iniciar | ESTUDIANTE | SWR-PRES-002 |
| POST | /quices/:id/responder | ESTUDIANTE | SWR-PRES-002 |
| POST | /quices/:id/finalizar | ESTUDIANTE | SWR-CAL-001, SWR-PRES-002 |
| GET | /quices/:id/resultado | ESTUDIANTE | SWR-CAL-001 |
| GET | /quices/:id/resultados | PROFESOR | SWR-CAL-001 |
| GET | /ranking/grupos/:grupoId | todos (cada uno ve lo suyo) | SWR-RANK-001 |

Todas las rutas (menos el login) piden el encabezado `Authorization: Bearer <token>`.

## Reglas de negocio (código puro, con pruebas unitarias)

- `src/quices/quiz.rules.ts`: calificación, tiempo vencido, conteo de aciertos, validación de preguntas.
- `src/ranking/ranking.rules.ts`: orden del ranking y empates.
- `src/auth/password.rules.ts`: validación de contraseña.
- `src/grupos/matricula.rules.ts`: duplicados al matricular.
- `src/common/privacy.ts`: correo enmascarado para logs.

## Logs (Shift Right)

Cada evento sale como una línea JSON en la consola y en `logs/app.log`:
`{ timestamp, level, context, event, message, metadata }`.
Eventos: `APP_STARTED`, `LOGIN_OK`, `LOGIN_FAILED`, `USER_CREATED`, `GROUP_CREATED`,
`STUDENTS_ENROLLED`, `QUIZ_CREATED`, `QUIZ_ASSIGNED`, `ATTEMPT_STARTED`, `ATTEMPT_FINISHED`,
`ATTEMPT_CLOSED_BY_TIMEOUT`, `VALIDATION_REJECTED`, `REQUEST_REJECTED`, `UNHANDLED_ERROR`, `HTTP_REQUEST` (con `duracionMs`).
Nunca se registran contraseñas ni tokens.
