"use client";

import { Boton, Campo, Mensaje, PageHeader, Tarjeta } from "@/components/quizstar/ui";
import { useIdioma } from "@/context/IdiomaContext";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { useState } from "react";

interface PreguntaForm {
  enunciado: string;
  opciones: string[];
  opcionCorrecta: number;
}

const preguntaVacia = (): PreguntaForm => ({ enunciado: "", opciones: ["", "", "", ""], opcionCorrecta: 0 });

export default function NuevoQuiz() {
  const router = useRouter();
  const { t } = useIdioma();
  const [titulo, setTitulo] = useState("");
  const [tema, setTema] = useState("");
  const [tiempo, setTiempo] = useState("10");
  const [preguntas, setPreguntas] = useState<PreguntaForm[]>([preguntaVacia()]);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  function cambiar(i: number, cambio: Partial<PreguntaForm>) {
    setPreguntas((ps) => ps.map((p, idx) => (idx === i ? { ...p, ...cambio } : p)));
  }

  function cambiarOpcion(i: number, j: number, valor: string) {
    setPreguntas((ps) =>
      ps.map((p, idx) => (idx === i ? { ...p, opciones: p.opciones.map((o, k) => (k === j ? valor : o)) } : p)),
    );
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await apiFetch("/quices", {
        metodo: "POST",
        cuerpo: { titulo, tema, tiempoLimiteMin: Number(tiempo), preguntas },
      });
      router.replace("/quices");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el quiz");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <PageHeader titulo="Crear quiz" subtitulo="Cada pregunta tiene 4 opciones y una sola correcta." />
      {error && <Mensaje tipo="error">{error}</Mensaje>}
      <form onSubmit={guardar}>
        <Tarjeta titulo="Datos del quiz">
          <div className="grid gap-4 md:grid-cols-3">
            <Campo id="titulo" etiqueta="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            <Campo id="tema" etiqueta="Tema" value={tema} onChange={(e) => setTema(e.target.value)} required />
            <Campo id="tiempo" etiqueta="Tiempo límite (minutos)" type="number" min={1} max={180} value={tiempo} onChange={(e) => setTiempo(e.target.value)} required />
          </div>
        </Tarjeta>

        {preguntas.map((p, i) => (
          <Tarjeta key={i} titulo={`Pregunta ${i + 1}`}>
            <div className="space-y-3">
              <Campo id={`enun-${i}`} etiqueta="Enunciado" value={p.enunciado} onChange={(e) => cambiar(i, { enunciado: e.target.value })} required />
              {p.opciones.map((o, j) => (
                <div key={j} className="flex items-end gap-3">
                  <div className="flex-1">
                    <Campo id={`op-${i}-${j}`} etiqueta={`Opción ${j + 1}`} value={o} onChange={(e) => cambiarOpcion(i, j, e.target.value)} required />
                  </div>
                  <label className="mb-3 flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                    <input type="radio" name={`correcta-${i}`} checked={p.opcionCorrecta === j} onChange={() => cambiar(i, { opcionCorrecta: j })} />
                    {t("Correcta")}
                  </label>
                </div>
              ))}
              {preguntas.length > 1 && (
                <Boton variante="peligro" onClick={() => setPreguntas((ps) => ps.filter((_, idx) => idx !== i))}>
                  Quitar pregunta
                </Boton>
              )}
            </div>
          </Tarjeta>
        ))}

        <div className="flex gap-3">
          <Boton variante="contorno" onClick={() => setPreguntas((ps) => [...ps, preguntaVacia()])}>
            Agregar pregunta
          </Boton>
          <Boton type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar quiz"}
          </Boton>
        </div>
      </form>
    </>
  );
}
