import SelectorIdioma from "@/components/common/SelectorIdioma";
import { IdiomaProvider, useIdioma } from "@/context/IdiomaContext";
import { traducir } from "@/i18n/textos";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

function Muestra() {
  const { t } = useIdioma();
  return <p>{t("Mis quices")}</p>;
}

describe("Cambio de idioma (español / inglés)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("RTL-23 · sin proveedor los textos se quedan en español", () => {
    render(<Muestra />);
    expect(screen.getByText("Mis quices")).toBeInTheDocument();
  });

  it("RTL-24 · traducir pasa a inglés y deja igual lo que no conoce", () => {
    expect(traducir("Mis quices", "en")).toBe("My quizzes");
    expect(traducir("Hola, Ana", "en")).toBe("Hello, Ana");
    expect(traducir("Texto que no existe", "en")).toBe("Texto que no existe");
    expect(traducir("Mis quices", "es")).toBe("Mis quices");
  });

  it("RTL-25 · el selector cambia el idioma a inglés y de vuelta a español", async () => {
    const usuario = userEvent.setup();
    render(
      <IdiomaProvider>
        <SelectorIdioma />
        <Muestra />
      </IdiomaProvider>,
    );

    expect(screen.getByText("Mis quices")).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByText("My quizzes")).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "ES" }));
    expect(screen.getByText("Mis quices")).toBeInTheDocument();
  });

  it("RTL-26 · guarda el idioma elegido para la próxima visita", async () => {
    const usuario = userEvent.setup();
    render(
      <IdiomaProvider>
        <SelectorIdioma />
      </IdiomaProvider>,
    );

    await usuario.click(screen.getByRole("button", { name: "EN" }));
    expect(window.localStorage.getItem("quizstar-idioma")).toBe("en");
  });
});
