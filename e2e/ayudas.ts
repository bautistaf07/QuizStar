import { expect, type APIRequestContext, type Page } from "@playwright/test";

// Cuentas de demostración que crea el seed del backend (no son datos reales).
export const PROFE = {
  correo: process.env.E2E_PROFE_CORREO ?? "profe@quizstar.test",
  password: process.env.E2E_PROFE_PASSWORD ?? "Profe12345",
};
export const EST1 = {
  correo: process.env.E2E_EST1_CORREO ?? "est1@quizstar.test",
  password: process.env.E2E_EST_PASSWORD ?? "Estu12345",
};
export const EST2 = {
  correo: process.env.E2E_EST2_CORREO ?? "est2@quizstar.test",
  password: process.env.E2E_EST_PASSWORD ?? "Estu12345",
};

export const API = process.env.E2E_API_URL ?? "http://localhost:4000";

// Nombres únicos para no chocar con datos de corridas anteriores.
export function sufijo() {
  return Date.now().toString().slice(-7);
}

export async function iniciarSesion(page: Page, cuenta: { correo: string; password: string }) {
  await page.goto("/signin");
  await page.getByLabel("Correo electrónico").fill(cuenta.correo);
  await page.getByLabel("Contraseña").fill(cuenta.password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/panel$/);
}

// Preparación de datos por API (no es lo que se prueba, solo deja listo el escenario).
export async function prepararQuizAsignado(
  request: APIRequestContext,
  cuentaEstudiante: { correo: string },
  sfx: string,
) {
  const login = await request.post(`${API}/auth/login`, { data: { correo: PROFE.correo, password: PROFE.password } });
  expect(login.ok()).toBeTruthy();
  const { accessToken } = await login.json();
  const cabeceras = { Authorization: `Bearer ${accessToken}` };

  const usuarios = await (await request.get(`${API}/usuarios`, { headers: cabeceras })).json();
  const estudiante = usuarios.find((u: { correo: string }) => u.correo === cuentaEstudiante.correo);
  expect(estudiante).toBeTruthy();

  const grupo = await (
    await request.post(`${API}/grupos`, { headers: cabeceras, data: { nombre: `Grupo E2E ${sfx}`, grado: "Pruebas" } })
  ).json();
  await request.post(`${API}/grupos/${grupo.id}/matriculas`, {
    headers: cabeceras,
    data: { estudianteIds: [estudiante.id] },
  });

  const titulo = `Quiz E2E ${sfx}`;
  const quiz = await (
    await request.post(`${API}/quices`, {
      headers: cabeceras,
      data: {
        titulo,
        tema: "Pruebas automáticas",
        tiempoLimiteMin: 10,
        preguntas: [
          { enunciado: "Pregunta uno", opciones: ["Uno correcta", "Uno B", "Uno C", "Uno D"], opcionCorrecta: 0 },
          { enunciado: "Pregunta dos", opciones: ["Dos correcta", "Dos B", "Dos C", "Dos D"], opcionCorrecta: 0 },
        ],
      },
    })
  ).json();
  await request.post(`${API}/quices/${quiz.id}/asignaciones`, { headers: cabeceras, data: { grupoIds: [grupo.id] } });

  return { titulo, nombreGrupo: `Grupo E2E ${sfx}`, quizId: quiz.id as string };
}
