import { ApiError, apiFetch, guardarToken, leerToken } from "@/lib/api";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function respuesta(estado: number, cuerpo: unknown) {
  return {
    ok: estado >= 200 && estado < 300,
    status: estado,
    text: async () => JSON.stringify(cuerpo),
  };
}

describe("Cliente de la API (apiFetch)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("RTL-08 · envía el token como Authorization: Bearer (SWR-AUTH-007)", async () => {
    guardarToken("token-de-prueba");
    const fetchFalso = vi.fn().mockResolvedValue(respuesta(200, { ok: true }));
    vi.stubGlobal("fetch", fetchFalso);

    await apiFetch("/grupos");

    const opciones = fetchFalso.mock.calls[0][1] as { headers: Record<string, string> };
    expect(opciones.headers.Authorization).toBe("Bearer token-de-prueba");
  });

  it("RTL-09 · une los mensajes de validación del backend en un solo texto (SWR-QUIZ-001)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(respuesta(400, { message: ["El título es obligatorio", "El tema es obligatorio"] })),
    );

    await expect(apiFetch("/quices", { metodo: "POST", cuerpo: {} })).rejects.toMatchObject({
      message: "El título es obligatorio. El tema es obligatorio",
      estado: 400,
    });
  });

  it("RTL-10 · si el backend no responde lanza un ApiError con estado 0", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fallo de red")));

    const error = await apiFetch("/grupos").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).estado).toBe(0);
  });

  it("RTL-11 · un 401 fuera del login borra el token y manda a /signin (SWR-AUTH-007)", async () => {
    guardarToken("token-vencido");
    const ubicacionFalsa = { href: "" };
    vi.stubGlobal("location", ubicacionFalsa);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respuesta(401, { message: "Sesión inválida o vencida" })));

    await expect(apiFetch("/quices")).rejects.toMatchObject({ estado: 401 });

    expect(leerToken()).toBeNull();
    expect(ubicacionFalsa.href).toBe("/signin");
  });

  it("RTL-12 · un 401 en el login NO redirige: solo muestra el error (SWR-AUTH-002)", async () => {
    const ubicacionFalsa = { href: "" };
    vi.stubGlobal("location", ubicacionFalsa);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(respuesta(401, { message: "Correo o contraseña incorrectos" })),
    );

    await expect(apiFetch("/auth/login", { metodo: "POST", cuerpo: {} })).rejects.toMatchObject({
      message: "Correo o contraseña incorrectos",
    });

    expect(ubicacionFalsa.href).toBe("");
  });
});
