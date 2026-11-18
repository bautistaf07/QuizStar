"use client";

import { Boton, Celda, Mensaje, PageHeader, TablaSimple, Tarjeta } from "@/components/quizstar/ui";
import { useAuth } from "@/context/AuthContext";
import { Link } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { ETIQUETA_ESTADO, type Grupo, type QuizEstudiante, type QuizProfesor } from "@/lib/tipos";
import { useCallback, useEffect, useState } from "react";

function VistaProfesor() {
  const [quices, setQuices] = useState<QuizProfesor[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [quizSel, setQuizSel] = useState("");
  const [gruposSel, setGruposSel] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const cargar = useCallback(async () => {
    try {
      setQuices(await apiFetch<QuizProfesor[]>("/quices"));
      setGrupos(await apiFetch<Grupo[]>("/grupos"));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo cargar");
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function asignar() {
    setError("");
    setExito("");
    try {
      await apiFetch(`/quices/${quizSel}/asignaciones`, { metodo: "POST", cuerpo: { grupoIds: gruposSel } });
      setExito("Quiz asignado");
      setGruposSel([]);
      setQuizSel("");
      cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo asignar");
    }
  }

  return (
    <>
      <PageHeader titulo="Mis quices" subtitulo="Crea quices y asígnalos a tus grupos." />
      {error && <Mensaje tipo="error">{error}</Mensaje>}
      {exito && <Mensaje tipo="exito">{exito}</Mensaje>}
      <div className="mb-4">
        <Link href="/quices/nuevo" className="inline-flex rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
          Crear quiz
        </Link>
      </div>
      <Tarjeta>
        <TablaSimple
          columnas={["Título", "Tema", "Tiempo (min)", "Preguntas", "Grupos", ""]}
          vacio="Aún no has creado quices."
          hayFilas={quices.length > 0}
        >
          {quices.map((q) => (
            <tr key={q.id}>
              <Celda>{q.titulo}</Celda>
              <Celda>{q.tema}</Celda>
              <Celda>{q.tiempoLimiteMin}</Celda>
              <Celda>{q._count.preguntas}</Celda>
              <Celda>{q._count.asignaciones}</Celda>
              <Celda>
                <div className="flex gap-2">
                  <Boton variante="contorno" onClick={() => { setQuizSel(q.id); setGruposSel([]); }}>
                    Asignar
                  </Boton>
                  <Link href={`/quices/${q.id}/resultados`} className="inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-brand-500 ring-1 ring-inset ring-brand-300 hover:bg-brand-50">
                    Resultados
                  </Link>
                </div>
              </Celda>
            </tr>
          ))}
        </TablaSimple>
      </Tarjeta>

      {quizSel && (
        <Tarjeta titulo={`Asignar: ${quices.find((q) => q.id === quizSel)?.titulo ?? ""}`}>
          <ul className="mb-4 space-y-2">
            {grupos.map((g) => (
              <li key={g.id}>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={gruposSel.includes(g.id)}
                    onChange={() => setGruposSel((s) => (s.includes(g.id) ? s.filter((x) => x !== g.id) : [...s, g.id]))}
                  />
                  {g.nombre} ({g.grado})
                </label>
              </li>
            ))}
          </ul>
          <Boton disabled={gruposSel.length === 0} onClick={asignar}>
            Asignar a grupos seleccionados
          </Boton>
        </Tarjeta>
      )}
    </>
  );
}

function VistaEstudiante() {
  const [quices, setQuices] = useState<QuizEstudiante[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<QuizEstudiante[]>("/quices")
      .then(setQuices)
      .catch((e) => setError(e instanceof ApiError ? e.message : "No se pudo cargar"));
  }, []);

  return (
    <>
      <PageHeader titulo="Mis quices" subtitulo="Quices asignados a tus grupos." />
      {error && <Mensaje tipo="error">{error}</Mensaje>}
      <Tarjeta>
        <TablaSimple
          columnas={["Título", "Tema", "Tiempo (min)", "Estado", "Nota", ""]}
          vacio="No tienes quices asignados."
          hayFilas={quices.length > 0}
        >
          {quices.map((q) => (
            <tr key={q.id}>
              <Celda>{q.titulo}</Celda>
              <Celda>{q.tema}</Celda>
              <Celda>{q.tiempoLimiteMin}</Celda>
              <Celda>{ETIQUETA_ESTADO[q.estadoIntento]}</Celda>
              <Celda>{q.calificacion ?? "-"}</Celda>
              <Celda>
                {(q.estadoIntento === "SIN_INICIAR" || q.estadoIntento === "EN_CURSO") && (
                  <Link href={`/quices/${q.id}/presentar`} className="inline-flex rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
                    {q.estadoIntento === "EN_CURSO" ? "Continuar" : "Presentar"}
                  </Link>
                )}
              </Celda>
            </tr>
          ))}
        </TablaSimple>
      </Tarjeta>
    </>
  );
}

export default function QuicesPagina() {
  const { usuario } = useAuth();
  if (!usuario) return null;
  return usuario.rol === "PROFESOR" ? <VistaProfesor /> : <VistaEstudiante />;
}
