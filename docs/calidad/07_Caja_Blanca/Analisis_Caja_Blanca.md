# Análisis de caja blanca – QuizStar

**Estudiante:** Francisco Bautista Vanegas · **Asignatura:** Calidad de Software · **Docente:** Cesar Augusto Pérez Tafur · **Fecha:** 18/11/2026

En la caja blanca revisé el código por dentro. Para cada función miré las ramas (los `if`), los valores límite, qué camino no estaba cubierto por las pruebas y si había un defecto oculto. Los defectos los comprobé ejecutando el código, no los supuse.

**Cobertura antes de este análisis (npm run test:cov, 28 pruebas):**

| Archivo | % Stmts | % Branch | Línea sin cubrir |
|---|---|---|---|
| quiz.rules.ts | 97.5 | 91.66 | 65 |
| privacy.ts | 85.71 | 50 | 3 |
| password, matricula, ranking | 100 | 100 | ninguna |

Evidencia: `06_Pruebas_Unitarias/unit_tests_coverage_tabla.png`.

---

## Análisis 1 · `validarPreguntas` (quiz.rules.ts) · SWR-QUIZ-001

**Qué hace:** revisa que cada pregunta tenga enunciado, 4 opciones distintas y una opción correcta entre 0 y 3.

**Ramas (una por cada `if`):**

| # | Condición | Resultado | Prueba que la cubre |
|---|---|---|---|
| 1 | lista vacía | "al menos una pregunta" | quiz.rules.spec – lista vacía |
| 2 | enunciado vacío | "no tiene enunciado" | quiz.rules.spec – enunciado vacío |
| 3 | no hay 4 opciones | "exactamente 4 opciones" | quiz.rules.spec – 3 opciones |
| 4 | opción vacía | "opción vacía" | **caja-blanca.spec** (antes sin cubrir) |
| 5 | opciones repetidas | "opciones repetidas" | quiz.rules.spec – Lima/lima |
| 6 | opción correcta fuera de 0–3 | "entre 0 y 3" | quiz.rules.spec y caja-blanca.spec |
| 7 | todo bien | `null` | quiz.rules.spec – pregunta válida |

**Valores límite de `opcionCorrecta`:** -1 (rechaza), 0 (acepta), 3 (acepta), 4 (rechaza), 1.5 (rechaza por no ser entero).

**Camino no cubierto:** la línea 65, la rama 4 (opción vacía). La cobertura la marcaba en rojo. Escribí una prueba que manda `['A', '', 'C', 'D']` y ahora esa rama se ejecuta.

**Defecto oculto D-001:** si una opción llega como número (por ejemplo `['A', 2, 'C', 'D']`), la función no devolvía un mensaje: se caía con `TypeError: (o ?? "").trim is not a function`. Lo comprobé ejecutando el código. La causa era que se llamaba `.trim()` sin revisar el tipo.
- **Impacto:** el servidor respondería error 500 en vez de un mensaje claro.
- **Corrección:** antes de limpiar las opciones se revisa que todas sean texto y se devuelve "tiene una opción que no es texto".
- **Re-test:** prueba "re-test D-001" en caja-blanca.spec.ts.

---

## Análisis 2 · `estaVencido` (quiz.rules.ts) · SWR-PRES-002

**Qué hace:** dice si ya se acabó el tiempo del quiz. Vence cuando se supera el límite, con una gracia opcional en segundos por la demora de la red.

**Ramas:**

| # | Condición | Resultado | Prueba |
|---|---|---|---|
| 1 | `limiteMin <= 0` | lanza error | quiz.rules.spec – límite cero |
| 2 | fecha inválida | lanza error (nuevo) | caja-blanca.spec – D-002 |
| 3 | tiempo transcurrido > límite + gracia | `true` | quiz.rules.spec – 1 s después |
| 4 | tiempo transcurrido ≤ límite + gracia | `false` | quiz.rules.spec – límite exacto |

**Valores límite:** con 10 minutos, a los 10:00 exactos no vence (`false`) y a los 10:01 s sí (`true`). Con 1 minuto: 60 000 ms no vence y 60 001 ms sí. Con gracia de 5 s: 4 s no vence y 6 s sí.

**Camino no cubierto:** aquí la cobertura de líneas era completa, pero no había ninguna prueba con fechas inválidas, que es un camino que el código no contemplaba.

**Defecto oculto D-002:** con una fecha inválida (`new Date('x')`) la resta da `NaN`, y `NaN > límite` siempre es `false`. La función respondía "no vencido" para siempre. Lo comprobé: `estaVencido(new Date('x'), new Date(), 10)` devolvía `false`.
- **Impacto:** un intento con fecha dañada nunca se cerraría por tiempo, y el estudiante podría seguir respondiendo sin límite.
- **Corrección:** si alguna de las dos fechas es inválida, se lanza el error "Fecha inválida".
- **Re-test:** prueba "re-test D-002" en caja-blanca.spec.ts.

---

## Análisis 3 · `enmascararCorreo` (privacy.ts) · logs seguros (relacionado con SWR-SEC-002)

**Qué hace:** oculta el correo para que no quede completo en los logs (`ana@correo.com` → `a***@correo.com`).

**Ramas:**

| # | Condición | Resultado | Prueba |
|---|---|---|---|
| 1 | el valor no es texto | `***` | **caja-blanca.spec** (antes sin cubrir) |
| 2 | no hay `@` o termina en `@` | `***` | privacy.spec y caja-blanca.spec |
| 3 | correo normal | primera letra + `***` + dominio | privacy.spec |

**Valores límite:** `sin-arroba` (→ `***`), `ana@` (→ `***`) y `null` o un número (→ `***`).

**Camino no cubierto:** la línea 3 (valor que no es texto). La cobertura de ramas de este archivo era de solo 50 %. Ahora se prueba con `null` y con `123`.

**Defecto oculto D-003:** con varias arrobas (`a@b@c.com`) la función cortaba el texto con `split('@')` y se quedaba solo con el segundo pedazo: devolvía `a***@b`, perdiendo `@c.com`. Lo comprobé ejecutando el código.
- **Impacto:** bajo, porque el correo ya está validado al crear el usuario. Pero el log perdería información del dominio.
- **Corrección:** se busca la primera arroba con `indexOf` y se conserva todo lo que viene después.
- **Re-test:** prueba "re-test D-003" en caja-blanca.spec.ts.

---

## Resumen

| ID | Función | Defecto | Cómo lo encontré | Estado |
|---|---|---|---|---|
| D-001 | validarPreguntas | opción numérica lanza TypeError | ejecutando el código | Corregido y re-probado |
| D-002 | estaVencido | fecha inválida nunca vence | ejecutando el código | Corregido y re-probado |
| D-003 | enmascararCorreo | varias arrobas pierden dominio | ejecutando el código | Corregido y re-probado |

**Resultado de las pruebas después de las correcciones (npm run test:cov, 18/11/2026):** 6 suites y 37 pruebas, todas pasaron.

| Archivo | % Stmts | % Branch | % Funcs | % Lines | Línea sin cubrir |
|---|---|---|---|---|---|
| quiz.rules.ts | 100 | 100 | 100 | 100 | ninguna (antes: 65) |
| privacy.ts | 100 | 100 | 100 | 100 | ninguna (antes: 3) |
| Todos los archivos | 100 | 100 | 100 | 100 | ninguna |

Antes: 97.18 % de sentencias y 92.3 % de ramas. Después: 100 % en todo.
Evidencia: `06_Pruebas_Unitarias/unit_tests_coverage_despues_tabla.png` y `unit_tests_coverage_despues_inicio.png`.
