"use client";

import { Banda } from "@/components/quizstar/ui";
import { useAuth } from "@/context/AuthContext";
import { useIdioma } from "@/context/IdiomaContext";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import {
  ETIQUETA_ROL,
  type Grupo,
  type QuizEstudiante,
  type QuizProfesor,
  type Rol,
  type UsuarioLista,
} from "@/lib/tipos";
import { useEffect, useState } from "react";

interface Dato {
  etiqueta: string;
  valor: string | number;
  color: string;
}

const ATAJOS: Record<Rol, { href: string; titulo: string; texto: string; color: string }[]> = {
  ADMIN: [
    { href: "/usuarios", titulo: "Usuarios", texto: "Crea y desactiva profesores y estudiantes.", color: "bg-brand-500" },
    { href: "/grupos", titulo: "Grupos", texto: "Mira los grupos de tu institución.", color: "bg-[#2BC0A1]" },
  ],
  PROFESOR: [
    { href: "/quices/nuevo", titulo: "Crear un quiz", texto: "Arma preguntas con tiempo límite.", color: "bg-brand-500" },
    { href: "/quices", titulo: "Mis quices", texto: "Asígnalos a grupos y mira resultados.", color: "bg-[#FF5A5F]" },
    { href: "/grupos", titulo: "Grupos", texto: "Crea grupos y matricula estudiantes.", color: "bg-[#2BC0A1]" },
    { href: "/ranking", titulo: "Ranking", texto: "Quién va de primero en cada grupo.", color: "bg-[#FFC933]" },
  ],
  ESTUDIANTE: [
    { href: "/quices", titulo: "Mis quices", texto: "Presenta los que tienes pendientes.", color: "bg-brand-500" },
    { href: "/ranking", titulo: "Ranking", texto: "Mira tu puesto en el grupo.", color: "bg-[#FFC933]" },
  ],
};

export default function Inicio() {
  const { usuario } = useAuth();
  const { t } = useIdioma();
  const [datos, setDatos] = useState<Dato[]>([]);

  useEffect(() => {
    if (!usuario) return;
    async function cargar() {
      try {
        if (usuario!.rol === "PROFESOR") {
          const [q, g, u] = await Promise.all([
            apiFetch<QuizProfesor[]>("/quices"),
            apiFetch<Grupo[]>("/grupos"),
            apiFetch<UsuarioLista[]>("/usuarios"),
          ]);
          setDatos([
            { etiqueta: "Quices creados", valor: q.length, color: "text-brand-500" },
            { etiqueta: "Grupos", valor: g.length, color: "text-[#2BC0A1]" },
            { etiqueta: "Estudiantes", valor: u.filter((x) => x.rol === "ESTUDIANTE").length, color: "text-[#FF5A5F]" },
          ]);
        } else if (usuario!.rol === "ESTUDIANTE") {
          const q = await apiFetch<QuizEstudiante[]>("/quices");
          const hechos = q.filter((x) => x.calificacion !== null);
          const prom = hechos.length
            ? Math.round((hechos.reduce((a, x) => a + (x.calificacion ?? 0), 0) / hechos.length) * 10) / 10
            : "-";
          setDatos([
            { etiqueta: "Pendientes", valor: q.filter((x) => x.estadoIntento === "SIN_INICIAR" || x.estadoIntento === "EN_CURSO").length, color: "text-[#FF5A5F]" },
            { etiqueta: "Presentados", valor: hechos.length, color: "text-brand-500" },
            { etiqueta: "Promedio", valor: prom, color: "text-[#2BC0A1]" },
          ]);
        } else {
          const [u, g] = await Promise.all([
            apiFetch<UsuarioLista[]>("/usuarios"),
            apiFetch<Grupo[]>("/grupos"),
          ]);
          setDatos([
            { etiqueta: "Usuarios", valor: u.length, color: "text-brand-500" },
            { etiqueta: "Grupos", valor: g.length, color: "text-[#2BC0A1]" },
          ]);
        }
      } catch {
        setDatos([]);
      }
    }
    cargar();
  }, [usuario]);

  if (!usuario) return null;
  const nombre = usuario.nombre.split(" ")[0];

  return (
    <>
      <Banda className="pb-24">
        <p className="text-sm font-medium text-[#FFC933]">{t(ETIQUETA_ROL[usuario.rol])}</p>
        <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">{t(`Hola, ${nombre}`)}</h1>
        <p className="mt-2 max-w-md text-sm text-white/80">
          {t("Esto es lo que tienes hoy en QuizStar. Elige una opción para empezar.")}
        </p>
      </Banda>

      {/* Tarjetas montadas sobre la franja */}
      {datos.length > 0 && (
        <div className="relative -mt-20 mb-8 grid gap-4 sm:grid-cols-3">
          {datos.map((d) => (
            <div key={d.etiqueta} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t(d.etiqueta)}</p>
              <p className={`mt-1 text-4xl font-extrabold ${d.color}`}>{d.valor}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className={`relative mb-3 text-lg font-bold text-gray-800 dark:text-white/90 ${datos.length === 0 ? "-mt-12" : ""}`}>
        {t("¿Qué quieres hacer?")}
      </h2>
      <div className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ATAJOS[usuario.rol].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <span className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg text-base font-bold ${a.color} ${a.color.includes("FFC933") ? "text-[#1B1740]" : "text-white"}`}>
              {t(a.titulo).charAt(0)}
            </span>
            <h3 className="font-bold text-gray-800 dark:text-white/90">{t(a.titulo)}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t(a.texto)}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
