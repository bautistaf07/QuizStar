"use client";

import { useIdioma } from "@/context/IdiomaContext";
import type { Idioma } from "@/i18n/textos";

const OPCIONES: { id: Idioma; texto: string; nombre: string }[] = [
  { id: "es", texto: "ES", nombre: "Español" },
  { id: "en", texto: "EN", nombre: "English" },
];

/** Botones ES | EN para cambiar el idioma de la aplicación. */
export default function SelectorIdioma({ className = "" }: { className?: string }) {
  const { idioma, cambiarIdioma } = useIdioma();
  return (
    <div role="group" aria-label="Idioma / Language" className={`inline-flex overflow-hidden rounded-lg border border-current/30 text-xs font-bold ${className}`}>
      {OPCIONES.map((o) => (
        <button
          key={o.id}
          type="button"
          lang={o.id}
          title={o.nombre}
          aria-pressed={idioma === o.id}
          onClick={() => cambiarIdioma(o.id)}
          className={`px-2.5 py-1.5 transition ${idioma === o.id ? "bg-[#FFC933] text-[#1B1740]" : "opacity-80 hover:opacity-100"}`}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}
