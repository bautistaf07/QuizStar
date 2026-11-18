import { Boton, Campo, Celda, Mensaje, TablaSimple, formatearTiempo } from "@/components/quizstar/ui";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Piezas de interfaz de QuizStar", () => {
  it("RTL-01 · Mensaje de error se anuncia con role=alert (SWR-AUTH-002)", () => {
    render(<Mensaje tipo="error">Correo o contraseña incorrectos</Mensaje>);
    expect(screen.getByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos");
  });

  it("RTL-02 · Mensaje de éxito se anuncia con role=status", () => {
    render(<Mensaje tipo="exito">Grupo creado</Mensaje>);
    expect(screen.getByRole("status")).toHaveTextContent("Grupo creado");
  });

  it("RTL-03 · Campo asocia la etiqueta con su input", () => {
    render(<Campo id="correo" etiqueta="Correo electrónico" />);
    expect(screen.getByLabelText("Correo electrónico")).toHaveAttribute("id", "correo");
  });

  it('RTL-04 · Boton es type="button" por defecto para no enviar formularios sin querer', () => {
    render(<Boton>Guardar</Boton>);
    expect(screen.getByRole("button", { name: "Guardar" })).toHaveAttribute("type", "button");
  });

  it("RTL-05 · TablaSimple muestra el texto de vacío cuando no hay filas (SWR-RANK-001)", () => {
    render(
      <TablaSimple columnas={["Puesto"]} vacio="Todavía no hay quices finalizados" hayFilas={false}>
        <tr />
      </TablaSimple>,
    );
    expect(screen.getByText("Todavía no hay quices finalizados")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("RTL-06 · TablaSimple muestra encabezados y filas cuando hay datos", () => {
    render(
      <TablaSimple columnas={["Estudiante", "Nota"]} vacio="vacío" hayFilas>
        <tr>
          <Celda>Ana</Celda>
          <Celda>95</Celda>
        </tr>
      </TablaSimple>,
    );
    expect(screen.getByRole("columnheader", { name: "Estudiante" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Ana" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "95" })).toBeInTheDocument();
  });

  it("RTL-07 · formatearTiempo da minutos:segundos y guion si no hay dato (SWR-PRES-002)", () => {
    expect(formatearTiempo(125)).toBe("2:05");
    expect(formatearTiempo(0)).toBe("0:00");
    expect(formatearTiempo(null)).toBe("-");
  });
});
