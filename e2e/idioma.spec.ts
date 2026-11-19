import { expect, test } from "@playwright/test";
import { PROFE, iniciarSesion } from "./ayudas";

test.describe("Cambio de idioma", () => {
  test("E2E-06 · el usuario cambia la aplicación a inglés y la vuelve a español", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();

    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();

    // El idioma se mantiene después de entrar a la aplicación.
    await page.getByLabel("Email").fill(PROFE.correo);
    await page.getByLabel("Password").fill(PROFE.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/panel$/);
    await expect(page.getByRole("link", { name: "Quizzes" }).first()).toBeVisible();

    await page.getByRole("button", { name: "ES", exact: true }).click();
    await expect(page.getByRole("link", { name: "Quices" }).first()).toBeVisible();
  });
});
