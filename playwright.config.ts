import { defineConfig, devices } from "@playwright/test";

// Pruebas E2E de QuizStar. Antes de correrlas deben estar encendidos:
//   - el backend (puerto 4000)
//   - el frontend (puerto 3000) con `npm run dev`
export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  // Informe HTML con trazas: se abre con `npx playwright show-report`
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on",
    screenshot: "on",
    locale: "es-CO",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
