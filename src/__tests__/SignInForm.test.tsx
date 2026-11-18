import SignInForm from "@/components/auth/SignInForm";
import { ApiError } from "@/lib/api";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const login = vi.fn();
const replace = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ login }),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("next/image", async () => {
  const React = await import("react");
  return {
    default: (props: { alt: string; src: string }) =>
      React.createElement("img", { alt: props.alt, src: props.src }),
  };
});

describe("Formulario de inicio de sesión", () => {
  beforeEach(() => {
    login.mockReset();
    replace.mockReset();
  });

  it("RTL-13 · pide correo y contraseña si se envía vacío (SWR-AUTH-001)", async () => {
    const usuario = userEvent.setup();
    render(<SignInForm />);

    await usuario.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Escribe tu correo y tu contraseña.");
    expect(login).not.toHaveBeenCalled();
  });

  it("RTL-14 · llama a login con los datos y lleva al panel (SWR-AUTH-001)", async () => {
    login.mockResolvedValue(undefined);
    const usuario = userEvent.setup();
    render(<SignInForm />);

    await usuario.type(screen.getByLabelText("Correo electrónico"), "profe@quizstar.test");
    await usuario.type(screen.getByLabelText("Contraseña"), "Profe12345");
    await usuario.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/panel"));
    expect(login).toHaveBeenCalledWith("profe@quizstar.test", "Profe12345");
  });

  it("RTL-15 · muestra el mensaje del backend si las credenciales son malas (SWR-AUTH-002)", async () => {
    login.mockRejectedValue(new ApiError("Correo o contraseña incorrectos", 401));
    const usuario = userEvent.setup();
    render(<SignInForm />);

    await usuario.type(screen.getByLabelText("Correo electrónico"), "profe@quizstar.test");
    await usuario.type(screen.getByLabelText("Contraseña"), "ClaveMala999");
    await usuario.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos");
    expect(replace).not.toHaveBeenCalled();
  });

  it("RTL-16 · deshabilita el botón mientras entra para evitar doble envío", async () => {
    let terminar: () => void = () => {};
    login.mockImplementation(() => new Promise<void>((resolver) => (terminar = resolver)));
    const usuario = userEvent.setup();
    render(<SignInForm />);

    await usuario.type(screen.getByLabelText("Correo electrónico"), "profe@quizstar.test");
    await usuario.type(screen.getByLabelText("Contraseña"), "Profe12345");
    await usuario.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByRole("button", { name: "Entrando..." })).toBeDisabled();
    terminar();
    await waitFor(() => expect(replace).toHaveBeenCalled());
  });
});
