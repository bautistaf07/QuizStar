import { AuthProvider, useAuth } from "@/context/AuthContext";
import { guardarToken, leerToken } from "@/lib/api";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function respuesta(estado: number, cuerpo: unknown) {
  return { ok: estado < 300, status: estado, text: async () => JSON.stringify(cuerpo) };
}

const PROFESOR = { id: "u1", nombre: "Profesor Demo", correo: "profe@quizstar.test", rol: "PROFESOR" };

function Vista() {
  const { usuario, cargando, login, logout } = useAuth();
  return (
    <div>
      <p data-testid="estado">{cargando ? "cargando" : usuario ? usuario.nombre : "sin sesión"}</p>
      <button onClick={() => login("profe@quizstar.test", "Profe12345")}>entrar</button>
      <button onClick={logout}>salir</button>
    </div>
  );
}

describe("Sesión de usuario (AuthProvider)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("RTL-20 · sin token guardado queda sin sesión y sin llamar al backend", async () => {
    const fetchFalso = vi.fn();
    vi.stubGlobal("fetch", fetchFalso);

    render(
      <AuthProvider>
        <Vista />
      </AuthProvider>,
    );

    expect(await screen.findByText("sin sesión")).toBeInTheDocument();
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("RTL-21 · con token guardado recupera la sesión con /auth/me (SWR-AUTH-007)", async () => {
    guardarToken("token-valido");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respuesta(200, PROFESOR)));

    render(
      <AuthProvider>
        <Vista />
      </AuthProvider>,
    );

    expect(await screen.findByText("Profesor Demo")).toBeInTheDocument();
  });

  it("RTL-22 · login guarda el token y logout lo borra (SWR-AUTH-001)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(respuesta(200, { accessToken: "token-nuevo", usuario: PROFESOR })),
    );
    const usuario = userEvent.setup();
    render(
      <AuthProvider>
        <Vista />
      </AuthProvider>,
    );
    await screen.findByText("sin sesión");

    await usuario.click(screen.getByRole("button", { name: "entrar" }));
    expect(await screen.findByText("Profesor Demo")).toBeInTheDocument();
    expect(leerToken()).toBe("token-nuevo");

    await usuario.click(screen.getByRole("button", { name: "salir" }));
    expect(await screen.findByText("sin sesión")).toBeInTheDocument();
    expect(leerToken()).toBeNull();
  });
});
