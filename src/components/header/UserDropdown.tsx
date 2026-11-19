"use client";

import { useAuth } from "@/context/AuthContext";
import { useIdioma } from "@/context/IdiomaContext";
import { useRouter } from "@/i18n/navigation";
import { ChevronDownIcon } from "@/icons";
import { ETIQUETA_ROL } from "@/lib/tipos";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

export default function UserDropdown() {
  const { usuario, logout } = useAuth();
  const { t } = useIdioma();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (!usuario) return null;

  const iniciales = usuario.nombre
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function cerrarSesion() {
    setIsOpen(false);
    logout();
    router.replace("/signin");
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="dropdown-toggle flex items-center text-white"
      >
        <span className="me-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFC933] text-sm font-bold text-[#1B1740]">
          {iniciales}
        </span>

        <span className="me-1 hidden text-theme-sm font-medium sm:block">{usuario.nombre}</span>

        <ChevronDownIcon
          className={`size-5 text-white/80 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="absolute mt-4.25 flex w-65 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg ltr:right-0 rtl:right-auto rtl:left-0 dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="border-b border-gray-200 pb-3 dark:border-gray-800">
          <span className="block text-theme-sm font-medium text-gray-700 dark:text-gray-400">
            {usuario.nombre}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {usuario.correo}
          </span>
          <span className="mt-1 block text-theme-xs font-medium text-brand-500">
            {t(ETIQUETA_ROL[usuario.rol])}
          </span>
        </div>
        <button
          type="button"
          onClick={cerrarSesion}
          className="mt-3 flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-theme-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/5"
        >
          {t("Cerrar sesión")}
        </button>
      </Dropdown>
    </div>
  );
}
