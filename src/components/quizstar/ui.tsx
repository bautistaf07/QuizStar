"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

/** Piezas reutilizables de QuizStar (mismo estilo de la plantilla: tarjetas, campos y botones). */

/** Franja de color a todo el ancho (como la cabecera de los reportes de Kahoot, con los colores de QuizStar). */
export function Banda({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className="relative left-1/2 mb-6 w-screen -translate-x-1/2 overflow-hidden bg-brand-500">
      <svg className="pointer-events-none absolute -right-10 top-0 hidden h-full w-[55%] md:block" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true">
        <path d="M120 0 H400 V200 H0 C80 170 60 60 120 0 Z" fill="#382EB8" />
      </svg>
      <div className={`relative mx-auto max-w-6xl px-4 py-8 text-white md:px-6 ${className}`}>{children}</div>
    </div>
  );
}

export function PageHeader({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <Banda>
      <p className="text-sm font-medium text-[#FFC933]">QuizStar</p>
      <h1 className="text-3xl font-extrabold">{titulo}</h1>
      {subtitulo && <p className="mt-1 text-sm text-white/80">{subtitulo}</p>}
    </Banda>
  );
}

export function Tarjeta({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <div className="relative mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      {titulo && (
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">{titulo}</h2>
      )}
      {children}
    </div>
  );
}

export function Mensaje({ tipo, children }: { tipo: "error" | "exito"; children: ReactNode }) {
  const estilos =
    tipo === "error"
      ? "border-error-200 bg-error-50 text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400"
      : "border-success-200 bg-success-50 text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400";
  return (
    <div role={tipo === "error" ? "alert" : "status"} className={`relative mb-4 rounded-lg border p-3 text-sm ${estilos}`}>
      {children}
    </div>
  );
}

const CLASE_CAMPO =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";

export function Campo({
  etiqueta,
  id,
  ...props
}: { etiqueta: string; id: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        {etiqueta}
      </label>
      <input id={id} className={CLASE_CAMPO} {...props} />
    </div>
  );
}

export function Seleccion({
  etiqueta,
  id,
  children,
  ...props
}: { etiqueta: string; id: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        {etiqueta}
      </label>
      <select id={id} className={CLASE_CAMPO} {...props}>
        {children}
      </select>
    </div>
  );
}

export function Boton({
  variante = "primario",
  className = "",
  ...props
}: { variante?: "primario" | "contorno" | "peligro" } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const estilos = {
    primario: "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
    contorno:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-white/5",
    peligro: "bg-error-500 text-white hover:bg-error-600 disabled:bg-error-300",
  }[variante];
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${estilos} ${className}`}
      {...props}
    />
  );
}

export function TablaSimple({
  columnas,
  children,
  vacio,
  hayFilas,
}: {
  columnas: string[];
  children: ReactNode;
  vacio: string;
  hayFilas: boolean;
}) {
  if (!hayFilas) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">{vacio}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-start dark:border-gray-800">
            {columnas.map((c) => (
              <th key={c} className="px-3 py-2 text-start font-medium text-gray-500 dark:text-gray-400">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{children}</tbody>
      </table>
    </div>
  );
}

export function Celda({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-3 py-3 text-gray-700 dark:text-gray-300 ${className}`}>{children}</td>;
}

export function formatearTiempo(segundos: number | null): string {
  if (segundos === null || segundos === undefined) return "-";
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
