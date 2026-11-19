"use client";

import { Boton, Campo, Celda, Mensaje, PageHeader, Seleccion, TablaSimple, Tarjeta } from "@/components/quizstar/ui";
import { useAuth } from "@/context/AuthContext";
import { useIdioma } from "@/context/IdiomaContext";
import { ApiError, apiFetch } from "@/lib/api";
import { ETIQUETA_ROL, type UsuarioLista } from "@/lib/tipos";
import { useCallback, useEffect, useState } from "react";

export default function UsuariosPagina() {
  const { usuario } = useAuth();
  const { t } = useIdioma();
  const esAdmin = usuario?.rol === "ADMIN";
  const [lista, setLista] = useState<UsuarioLista[]>([]);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("ESTUDIANTE");

  const cargar = useCallback(async () => {
    try {
      setLista(await apiFetch<UsuarioLista[]>("/usuarios"));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo cargar la lista");
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setExito("");
    try {
      await apiFetch("/usuarios", { metodo: "POST", cuerpo: { nombre, correo, password, rol } });
      setExito("Usuario creado");
      setNombre("");
      setCorreo("");
      setPassword("");
      cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el usuario");
    }
  }

  async function desactivar(id: string) {
    setError("");
    setExito("");
    try {
      await apiFetch(`/usuarios/${id}/desactivar`, { metodo: "PATCH" });
      setExito("Usuario desactivado");
      cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo desactivar");
    }
  }

  return (
    <>
      <PageHeader titulo="Usuarios" subtitulo="Profesores y estudiantes de tu institución." />
      {error && <Mensaje tipo="error">{error}</Mensaje>}
      {exito && <Mensaje tipo="exito">{exito}</Mensaje>}

      {esAdmin && (
        <Tarjeta titulo="Crear usuario">
          <form onSubmit={crear} className="grid gap-4 md:grid-cols-2">
            <Campo id="nombre" etiqueta="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            <Campo id="correo" etiqueta="Correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            <Campo id="password" etiqueta="Contraseña (mínimo 8 caracteres)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Seleccion id="rol" etiqueta="Rol" value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="ESTUDIANTE">{t("Estudiante")}</option>
              <option value="PROFESOR">{t("Profesor")}</option>
            </Seleccion>
            <div>
              <Boton type="submit">Crear usuario</Boton>
            </div>
          </form>
        </Tarjeta>
      )}

      <Tarjeta titulo="Lista de usuarios">
        <TablaSimple
          columnas={esAdmin ? ["Nombre", "Correo", "Rol", "Estado", ""] : ["Nombre", "Correo", "Rol"]}
          vacio="No hay usuarios todavía."
          hayFilas={lista.length > 0}
        >
          {lista.map((u) => (
            <tr key={u.id}>
              <Celda>{u.nombre}</Celda>
              <Celda>{u.correo}</Celda>
              <Celda>{t(ETIQUETA_ROL[u.rol])}</Celda>
              {esAdmin && <Celda>{t(u.activo ? "Activo" : "Inactivo")}</Celda>}
              {esAdmin && (
                <Celda>
                  {u.activo && u.rol !== "ADMIN" && (
                    <Boton variante="peligro" onClick={() => desactivar(u.id)}>
                      Desactivar
                    </Boton>
                  )}
                </Celda>
              )}
            </tr>
          ))}
        </TablaSimple>
      </Tarjeta>
    </>
  );
}
