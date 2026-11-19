"use client";

import { traducir, type Idioma } from "@/i18n/textos";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface IdiomaValor {
  idioma: Idioma;
  cambiarIdioma: (idioma: Idioma) => void;
  /** Devuelve el texto en el idioma activo. Si no hay traducción, deja el texto en español. */
  t: (texto: string) => string;
}

// Sin proveedor (por ejemplo en las pruebas de componentes) la app queda en español.
const porDefecto: IdiomaValor = { idioma: "es", cambiarIdioma: () => {}, t: (texto) => texto };

const IdiomaContext = createContext<IdiomaValor>(porDefecto);

const CLAVE = "quizstar-idioma";

export function IdiomaProvider({ children }: { children: ReactNode }) {
  const [idioma, setIdioma] = useState<Idioma>("es");

  // Al abrir la página se recupera el idioma que la persona eligió la última vez.
  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CLAVE);
      if (guardado === "en" || guardado === "es") setIdioma(guardado);
    } catch {
      /* sin almacenamiento: se queda en español */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = idioma;
  }, [idioma]);

  const cambiarIdioma = useCallback((nuevo: Idioma) => {
    setIdioma(nuevo);
    try {
      window.localStorage.setItem(CLAVE, nuevo);
    } catch {
      /* si no se puede guardar, el cambio vale solo para esta visita */
    }
  }, []);

  const t = useCallback((texto: string) => traducir(texto, idioma), [idioma]);
  const valor = useMemo(() => ({ idioma, cambiarIdioma, t }), [idioma, cambiarIdioma, t]);

  return <IdiomaContext.Provider value={valor}>{children}</IdiomaContext.Provider>;
}

export function useIdioma(): IdiomaValor {
  return useContext(IdiomaContext);
}
