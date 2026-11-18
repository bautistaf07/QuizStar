import { expect, test } from "@playwright/test";
import { EST1, EST2, PROFE, iniciarSesion, prepararQuizAsignado, sufijo } from "./ayudas";

test.describe("Flujo principal: del login al resultado", () => {
  test("E2E-04 · profesor crea grupo y quiz, el estudiante lo presenta y ve 100 (SWR-CUR-001, QUIZ-001, ASG-002, PRES-002, CAL-001)", async ({
    page,
    browser,
  }) => {
    const sfx = sufijo();
    const nombreGrupo = `Grupo UI ${sfx}`;
    const titulo = `Quiz UI ${sfx}`;

    // 1) El profesor crea un grupo y matricula a un estudiante.
    await iniciarSesion(page, PROFE);
    await page.goto("/grupos");
    await page.getByLabel("Nombre del grupo").fill(nombreGrupo);
    await page.getByLabel("Grado o semestre").fill("Pruebas");
    await page.getByRole("button", { name: "Crear grupo" }).click();
    await expect(page.getByRole("status")).toHaveText("Grupo creado");

    await page.getByRole("row", { name: new RegExp(nombreGrupo) }).getByRole("button", { name: "Matricular estudiantes" }).click();
    await page.getByLabel(new RegExp(EST1.correo)).check();
    await page.getByRole("button", { name: "Matricular seleccionados" }).click();
    await expect(page.getByRole("status")).toHaveText("Estudiantes matriculados");

    // 2) El profesor crea un quiz con una pregunta (opción 1 correcta).
    await page.goto("/quices/nuevo");
    await page.getByLabel("Título").fill(titulo);
    await page.getByLabel("Tema").fill("Pruebas automáticas");
    await page.getByLabel("Enunciado").fill("¿Cuánto es 2 + 2?");
    await page.getByLabel("Opción 1").fill("4");
    await page.getByLabel("Opción 2").fill("3");
    await page.getByLabel("Opción 3").fill("5");
    await page.getByLabel("Opción 4").fill("22");
    await page.getByRole("button", { name: "Guardar quiz" }).click();
    await expect(page).toHaveURL(/\/quices$/);

    // 3) Lo asigna al grupo.
    await page.getByRole("row", { name: new RegExp(titulo) }).getByRole("button", { name: "Asignar" }).click();
    await page.getByLabel(new RegExp(nombreGrupo)).check();
    await page.getByRole("button", { name: "Asignar a grupos seleccionados" }).click();
    await expect(page.getByRole("status")).toHaveText("Quiz asignado");

    // 4) El estudiante (otra sesión) lo presenta y responde bien.
    const contextoEst = await browser.newContext();
    const pagEst = await contextoEst.newPage();
    await iniciarSesion(pagEst, EST1);
    await pagEst.goto("/quices");
    await pagEst.getByRole("row", { name: new RegExp(titulo) }).getByRole("link", { name: "Presentar" }).click();
    await pagEst.getByLabel("4", { exact: true }).check();
    await pagEst.getByRole("button", { name: "Finalizar quiz" }).click();

    await expect(pagEst.getByText("Nota: 100 / 100")).toBeVisible();
    await expect(pagEst.getByText("Respuestas correctas: 1 de 1")).toBeVisible();
    await contextoEst.close();

    // 5) El profesor ve el resultado del estudiante.
    await page.goto("/quices");
    await page.getByRole("row", { name: new RegExp(titulo) }).getByRole("link", { name: "Resultados" }).click();
    await expect(page.getByRole("row", { name: /Finalizado.*100/ })).toBeVisible();
  });

  test("E2E-05 · el estudiante responde una bien y una mal, ve 50 y el profesor lo ve en el ranking (SWR-CAL-001, RANK-001)", async ({
    page,
    browser,
    request,
  }) => {
    const { titulo, nombreGrupo } = await prepararQuizAsignado(request, EST2, sufijo());

    // El estudiante presenta: pregunta 1 correcta, pregunta 2 incorrecta.
    await iniciarSesion(page, EST2);
    await page.goto("/quices");
    await page.getByRole("row", { name: new RegExp(titulo) }).getByRole("link", { name: "Presentar" }).click();
    await page.getByRole("radiogroup", { name: "Pregunta 1" }).getByLabel("Uno correcta").check();
    await page.getByRole("radiogroup", { name: "Pregunta 2" }).getByLabel("Dos B").check();
    await page.getByRole("button", { name: "Finalizar quiz" }).click();

    await expect(page.getByText("Nota: 50 / 100")).toBeVisible();
    await expect(page.getByText("Respuestas correctas: 1 de 2")).toBeVisible();

    // El profesor revisa el ranking del grupo.
    const contextoProfe = await browser.newContext();
    const pagProfe = await contextoProfe.newPage();
    await iniciarSesion(pagProfe, PROFE);
    await pagProfe.goto("/ranking");
    await pagProfe.getByLabel("Grupo").selectOption({ label: nombreGrupo });
    await expect(pagProfe.getByRole("cell", { name: "50", exact: true })).toBeVisible();
    await contextoProfe.close();
  });
});
