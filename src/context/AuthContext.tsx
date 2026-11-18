"use client";

import { ApiError, apiFetch, borrarToken, guardarToken, leerToken } from "@/lib/api";
import type { UsuarioSesion } from "@/lib/tipos";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthContextValue {
  usuario: UsuarioSesion | null;
  cargando: boolean;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [cargando, setCargando] = useState(true);

  // Al abrir la página, si hay token guardado se recupera la sesión.
  useEffect(() => {
    let activo = true;
    async function recuperarSesion() {
      if (!leerToken()) {
        if (activo) setCargando(false);
        return;
      }
      try {
        const perfil = await apiFetch<UsuarioSesion>("/auth/me");
        if (activo) setUsuario(perfil);
      } catch (error) {
        if (!(error instanceof ApiError) || error.estado !== 401) {
          // Si el backend no responde dejamos la sesión como "no iniciada".
        }
        borrarToken();
      } finally {
        if (activo) setCargando(false);
      }
    }
    recuperarSesion();
    return () => {
      activo = false;
    };
  }, []);

  const login = useCallback(async (correo: string, password: string) => {
    const respuesta = await apiFetch<{ accessToken: string; usuario: UsuarioSesion }>(
      "/auth/login",
      { metodo: "POST", cuerpo: { correo, password } },
    );
    guardarToken(respuesta.accessToken);
    setUsuario(respuesta.usuario);
  }, []);

  const logout = useCallback(() => {
    borrarToken();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, cargando, login, logout }),
    [usuario, cargando, login, logout],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return contexto;
}
