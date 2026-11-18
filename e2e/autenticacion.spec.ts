import { expect, test } from "@playwright/test";
import { PROFE, iniciarSesion } from "./ayudas";

test.describe("Autenticación y rutas protegidas", () => {
  test("E2E-01 · el profesor inicia sesión y ve su panel (SWR-AUTH-001)", async ({ page }) => {
    await iniciarSesion(page, PROFE);

    await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Quices" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Crear quiz" }).first()).toBeVisible();
  });

  test("E2E-02 · credenciales incorrectas muestran un mensaje y no entran (SWR-AUTH-002)", async ({ page }) => {
    await page.goto("/signin");
    await page.getByLabel("Correo electrónico").fill(PROFE.correo);
    await page.getByLabel("Contraseña").fill("ClaveIncorrecta999");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    // Next.js tiene su propio aviso invisible con role="alert", por eso se filtra por texto.
    await expect(page.getByRole("alert").filter({ hasText: "Correo o contraseña" })).toHaveText("Correo o contraseña incorrectos");
    await expect(page).toHaveURL(/\/signin$/);
  });

  test("E2E-03 · sin sesión, /panel lleva al inicio de sesión (SWR-AUTH-007)", async ({ page }) => {
    await page.goto("/panel");

    await expect(page).toHaveURL(/\/signin$/);
    await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
  });
});
