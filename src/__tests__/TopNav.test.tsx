import TopNav from "@/layout/TopNav";
import type { Rol } from "@/lib/tipos";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

let rolActual: Rol = "PROFESOR";

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ usuario: { id: "u1", nombre: "Persona Demo", correo: "demo@quizstar.test", rol: rolActual } }),
}));

vi.mock("@/i18n/navigation", async () => {
  const React = await import("react");
  return {
    Link: (props: { href: string; children?: React.ReactNode; className?: string }) =>
      React.createElement("a", { href: props.href, className: props.className }, props.children),
    usePathname: () => "/panel",
  };
});

vi.mock("@/icons", () => {
  const Icono = () => null;
  return { GridIcon: Icono, BoxCubeIcon: Icono, ListIcon: Icono, UserCircleIcon: Icono, PageIcon: Icono };
});

vi.mock("@/components/header/UserDropdown", () => ({ default: () => null }));
vi.mock("@/components/common/ThemeToggleButton", () => ({ ThemeToggleButton: () => null }));

vi.mock("next/image", async () => {
  const React = await import("react");
  return {
    default: (props: { alt: string; src: string }) =>
      React.createElement("img", { alt: props.alt, src: props.src }),
  };
});

function menuPrincipal() {
  return within(screen.getByRole("navigation", { name: "Principal" }));
}

describe("Menú superior por rol (SWR-AUTH-007, SWR-USR-006)", () => {
  beforeEach(() => {
    rolActual = "PROFESOR";
  });

  it("RTL-17 · el profesor ve Quices, Grupos y Ranking, y el botón Crear quiz", () => {
    render(<TopNav />);

    expect(menuPrincipal().getByRole("link", { name: "Quices" })).toBeInTheDocument();
    expect(menuPrincipal().getByRole("link", { name: "Grupos" })).toBeInTheDocument();
    expect(menuPrincipal().getByRole("link", { name: "Ranking" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Crear quiz" })).toHaveAttribute("href", "/quices/nuevo");
  });

  it("RTL-18 · el estudiante NO ve Grupos ni Usuarios y no tiene botón de crear", () => {
    rolActual = "ESTUDIANTE";
    render(<TopNav />);

    expect(menuPrincipal().getByRole("link", { name: "Quices" })).toBeInTheDocument();
    expect(menuPrincipal().queryByRole("link", { name: "Grupos" })).not.toBeInTheDocument();
    expect(menuPrincipal().queryByRole("link", { name: "Usuarios" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Crear/ })).not.toBeInTheDocument();
  });

  it("RTL-19 · el administrador ve Usuarios y Crear usuario, pero no Quices", () => {
    rolActual = "ADMIN";
    render(<TopNav />);

    expect(menuPrincipal().getByRole("link", { name: "Usuarios" })).toBeInTheDocument();
    expect(menuPrincipal().queryByRole("link", { name: "Quices" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Crear usuario" })).toBeInTheDocument();
  });
});
