"use client";

import { Boton, Mensaje, PageHeader, Tarjeta, formatearTiempo } from "@/components/quizstar/ui";
import { Link } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import type { QuizIniciado, ResultadoQuiz } from "@/lib/tipos";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function PresentarQuiz() {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<QuizIniciado | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [restante, setRestante] = useState(0);
  const [resultado, setResultado] = useState<ResultadoQuiz | null>(null);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const yaIniciado = useRef(false);
  const finalizando = useRef(false);

  // Inicia el intento una sola vez (evita doble llamada en modo desarrollo).
  useEffect(() => {
    if (yaIniciado.current) return;
    yaIniciado.current = true;
    apiFetch<QuizIniciado>(`/quices/${id}/iniciar`, { metodo: "POST" })
      .then((q) => {
        setQuiz(q);
        setRestante(q.restanteSeg);
        const previas: Record<string, number> = {};
        q.respuestasGuardadas.forEach((r) => (previas[r.preguntaId] = r.opcion));
        setRespuestas(previas);
      })
      .catch(async (e) => {
        if (e instanceof ApiError && e.estado === 409) {
          try {
            setResultado(await apiFetch<ResultadoQuiz>(`/quices/${id}/resultado`));
            return;
          } catch {
            /* se muestra el error original */
          }
        }
        setError(e instanceof ApiError ? e.message : "No se pudo iniciar el quiz");
      });
  }, [id]);

  const finalizar = useCallback(async () => {
    if (finalizando.current) return;
    finalizando.current = true;
    setEnviando(true);
    try {
      await apiFetch(`/quices/${id}/finalizar`, { metodo: "POST" });
    } catch {
      /* si ya se cerró por tiempo, igual se consulta el resultado */
    }
    try {
      setResultado(await apiFetch<ResultadoQuiz>(`/quices/${id}/resultado`));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo obtener el resultado");
    } finally {
      setEnviando(false);
    }
  }, [id]);

  // Cuenta regresiva: al llegar a cero se finaliza solo.
  useEffect(() => {
    if (!quiz || resultado) return;
    if (restante <= 0) {
      finalizar();
      return;
    }
    const t = setTimeout(() => setRestante((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [quiz, resultado, restante, finalizar]);

  async function elegir(preguntaId: string, opcion: number) {
    setRespuestas((r) => ({ ...r, [preguntaId]: opcion }));
    try {
      await apiFetch(`/quices/${id}/responder`, { metodo: "POST", cuerpo: { preguntaId, opcion } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar la respuesta");
    }
  }

  if (resultado) {
    return (
      <>
        <PageHeader titulo="Resultado" />
        <Tarjeta>
          {resultado.estado === "CERRADO_POR_TIEMPO" && (
            <Mensaje tipo="error">El tiempo terminó y el quiz se cerró automáticamente.</Mensaje>
          )}
          <p className="text-3xl font-semibold text-gray-800 dark:text-white/90">
            Nota: {resultado.calificacion ?? "-"} / 100
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Respuestas correctas: {resultado.correctas ?? 0} de {resultado.total}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tiempo usado: {formatearTiempo(resultado.tiempoTotalSeg)}
          </p>
          <div className="mt-5">
            <Link href="/quices" className="inline-flex rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
              Volver a mis quices
            </Link>
          </div>
        </Tarjeta>
      </>
    );
  }

  if (error && !quiz) {
    return (
      <>
        <PageHeader titulo="Presentar quiz" />
        <Mensaje tipo="error">{error}</Mensaje>
        <Link href="/quices" className="text-brand-500 hover:underline">Volver a mis quices</Link>
      </>
    );
  }

  if (!quiz) return <p className="text-sm text-gray-500">Cargando quiz...</p>;

  return (
    <>
      <PageHeader titulo="Presentar quiz" />
      <div className="sticky top-20 z-10 mb-4 rounded-lg bg-brand-500 px-4 py-2 text-white" aria-live="off">
        Tiempo restante: <strong>{formatearTiempo(Math.max(restante, 0))}</strong>
      </div>
      {error && <Mensaje tipo="error">{error}</Mensaje>}
      {quiz.preguntas.map((p, i) => (
        <Tarjeta key={p.id} titulo={`${i + 1}. ${p.enunciado}`}>
          <div className="space-y-2" role="radiogroup" aria-label={`Pregunta ${i + 1}`}>
            {p.opciones.map((o, j) => (
              <label key={j} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  name={`p-${p.id}`}
                  checked={respuestas[p.id] === j}
                  onChange={() => elegir(p.id, j)}
                />
                {o}
              </label>
            ))}
          </div>
        </Tarjeta>
      ))}
      <Boton disabled={enviando} onClick={finalizar}>
        {enviando ? "Enviando..." : "Finalizar quiz"}
      </Boton>
    </>
  );
}
