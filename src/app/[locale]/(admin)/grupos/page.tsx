"use client";

import { Boton, Campo, Celda, Mensaje, PageHeader, TablaSimple, Tarjeta } from "@/components/quizstar/ui";
import { useAuth } from "@/context/AuthContext";
import { useIdioma } from "@/context/IdiomaContext";
import { ApiError, apiFetch } from "@/lib/api";
import type { Grupo, UsuarioLista } from "@/lib/tipos";
import { useCallback, useEffect, useState } from "react";

export default function GruposPagina() {
  const { usuario } = useAuth();
  const { t } = useIdioma();
  const puedeGestionar = usuario?.rol === "ADMIN" || usuario?.rol === "PROFESOR";
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [estudiantes, setEstudiantes] = useState<UsuarioLista[]>([]);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [nombre, setNombre] = useState("");
  const [grado, setGrado] = useState("");
  const [grupoSel, setGrupoSel] = useState("");
  const [seleccion, setSeleccion] = useState<string[]>([]);

  const cargar = useCallback(async () => {
    try {
      setGrupos(await apiFetch<Grupo[]>("/grupos"));
      if (puedeGestionar) {
        const us = await apiFetch<UsuarioLista[]>("/usuarios");
        setEstudiantes(us.filter((u) => u.rol === "ESTUDIANTE" && u.activo));
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo cargar");
    }
  }, [puedeGestionar]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setExito("");
    try {
      await apiFetch("/grupos", { metodo: "POST", cuerpo: { nombre, grado } });
      setExito("Grupo creado");
      setNombre("");
      setGrado("");
      cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el grupo");
    }
  }

  async function matricular() {
    setError("");
    setExito("");
    try {
      await apiFetch(`/grupos/${grupoSel}/matriculas`, { metodo: "POST", cuerpo: { estudianteIds: seleccion } });
      setExito("Estudiantes matriculados");
      setSeleccion([]);
      cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo matricular");
    }
  }

  function alternar(id: string) {
    setSeleccion((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <>
      <PageHeader titulo="Grupos" subtitulo="Cursos o grados con sus estudiantes." />
      {error && <Mensaje tipo="error">{error}</Mensaje>}
      {exito && <Mensaje tipo="exito">{exito}</Mensaje>}

      {puedeGestionar && (
        <Tarjeta titulo="Crear grupo">
          <form onSubmit={crear} className="grid gap-4 md:grid-cols-3">
            <Campo id="g-nombre" etiqueta="Nombre del grupo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            <Campo id="g-grado" etiqueta="Grado o semestre" value={grado} onChange={(e) => setGrado(e.target.value)} required />
            <div className="flex items-end">
              <Boton type="submit">Crear grupo</Boton>
            </div>
          </form>
        </Tarjeta>
      )}

      <Tarjeta titulo="Mis grupos">
        <TablaSimple
          columnas={puedeGestionar ? ["Nombre", "Grado", "Estudiantes", ""] : ["Nombre", "Grado"]}
          vacio="No hay grupos todavía."
          hayFilas={grupos.length > 0}
        >
          {grupos.map((g) => (
            <tr key={g.id}>
              <Celda>{g.nombre}</Celda>
              <Celda>{g.grado}</Celda>
              {puedeGestionar && <Celda>{g._count?.matriculas ?? 0}</Celda>}
              {puedeGestionar && (
                <Celda>
                  <Boton variante="contorno" onClick={() => { setGrupoSel(g.id); setSeleccion([]); }}>
                    Matricular estudiantes
                  </Boton>
                </Celda>
              )}
            </tr>
          ))}
        </TablaSimple>
      </Tarjeta>

      {puedeGestionar && grupoSel && (
        <Tarjeta titulo={`Matricular en: ${grupos.find((g) => g.id === grupoSel)?.nombre ?? ""}`}>
          {estudiantes.length === 0 ? (
            <p className="text-sm text-gray-500">{t("No hay estudiantes activos.")}</p>
          ) : (
            <ul className="mb-4 space-y-2">
              {estudiantes.map((u) => (
                <li key={u.id}>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input type="checkbox" checked={seleccion.includes(u.id)} onChange={() => alternar(u.id)} />
                    {u.nombre} ({u.correo})
                  </label>
                </li>
              ))}
            </ul>
          )}
          <Boton disabled={seleccion.length === 0} onClick={matricular}>
            Matricular seleccionados
          </Boton>
        </Tarjeta>
      )}
    </>
  );
}
