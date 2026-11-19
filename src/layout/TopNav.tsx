"use client";

import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";
import SelectorIdioma from "@/components/common/SelectorIdioma";
import { useAuth } from "@/context/AuthContext";
import { useIdioma } from "@/context/IdiomaContext";
import { Link, usePathname } from "@/i18n/navigation";
import { BoxCubeIcon, GridIcon, ListIcon, PageIcon, UserCircleIcon } from "@/icons";
import Image from "next/image";
import type { ReactNode } from "react";

const ENLACES: { href: string; texto: string; icono: ReactNode; roles: string[] }[] = [
  { href: "/panel", texto: "Inicio", icono: <GridIcon className="size-5" />, roles: ["ADMIN", "PROFESOR", "ESTUDIANTE"] },
  { href: "/quices", texto: "Quices", icono: <BoxCubeIcon className="size-5" />, roles: ["PROFESOR", "ESTUDIANTE"] },
  { href: "/grupos", texto: "Grupos", icono: <ListIcon className="size-5" />, roles: ["ADMIN", "PROFESOR"] },
  { href: "/usuarios", texto: "Usuarios", icono: <UserCircleIcon className="size-5" />, roles: ["ADMIN"] },
  { href: "/ranking", texto: "Ranking", icono: <PageIcon className="size-5" />, roles: ["PROFESOR", "ESTUDIANTE"] },
];

export default function TopNav() {
  const { usuario } = useAuth();
  const { t } = useIdioma();
  const ruta = usePathname();
  if (!usuario) return null;

  const enlaces = ENLACES.filter((e) => e.roles.includes(usuario.rol));
  const botonCrear =
    usuario.rol === "PROFESOR"
      ? { href: "/quices/nuevo", texto: "Crear quiz" }
      : usuario.rol === "ADMIN"
        ? { href: "/usuarios", texto: "Crear usuario" }
        : null;

  const lista = (
    <ul className="flex items-stretch gap-1">
      {enlaces.map((e) => {
        const activo = e.href === "/panel" ? ruta === "/panel" : ruta.startsWith(e.href);
        return (
          <li key={e.href} className="flex">
            <Link
              href={e.href}
              className={`relative flex items-center gap-2 px-4 text-sm font-semibold transition ${
                activo ? "text-white" : "text-white/70 hover:text-white"
              }`}
            >
              {e.icono}
              {t(e.texto)}
              {activo && <span className="absolute inset-x-3 bottom-0 h-1 rounded-t bg-[#FFC933]" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <header className="sticky top-0 z-40 bg-brand-700 text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-stretch justify-between gap-4 px-4 md:px-6">
        <div className="flex items-stretch gap-6">
          <Link href="/panel" className="flex items-center" aria-label="QuizStar">
            <Image src="/images/logo/quizstar-logo-ancho-oscuro.svg" alt="QuizStar" width={140} height={32} priority className="h-8 w-auto" />
          </Link>
          <nav className="hidden md:flex" aria-label="Principal">{lista}</nav>
        </div>
        <div className="flex items-center gap-3">
          {botonCrear && (
            <Link href={botonCrear.href} className="hidden rounded-lg bg-white px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-25 sm:inline-flex">
              {t(botonCrear.texto)}
            </Link>
          )}
          <SelectorIdioma className="text-white" />
          <ThemeToggleButton />
          <UserDropdown />
        </div>
      </div>
      {/* En celular el menú va en una fila que se desliza */}
      <nav className="no-scrollbar flex h-12 overflow-x-auto border-t border-white/10 md:hidden" aria-label="Principal móvil">
        <div className="mx-auto flex px-2">{lista}</div>
      </nav>
    </header>
  );
}
