// Cliente para hablar con el backend de QuizStar (NestJS).
// El frontend NUNCA se conecta a la base de datos: solo usa esta API.

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const CLAVE_TOKEN = "quizstar_token";

export function leerToken(): string | null {
  try {
    return window.localStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
}

export function guardarToken(token: string) {
  try {
    window.localStorage.setItem(CLAVE_TOKEN, token);
  } catch {
    /* sin almacenamiento: la sesión dura hasta recargar */
  }
}

export function borrarToken() {
  try {
    window.localStorage.removeItem(CLAVE_TOKEN);
  } catch {
    /* nada que borrar */
  }
}

export class ApiError extends Error {
  estado: number;

  constructor(mensaje: string, estado: number) {
    super(mensaje);
    this.estado = estado;
  }
}

interface Opciones {
  metodo?: "GET" | "POST" | "PATCH" | "DELETE";
  cuerpo?: unknown;
}

export async function apiFetch<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
  const token = leerToken();
  let respuesta: Response;

  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: opciones.metodo ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined,
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. Revisa que el backend esté encendido.", 0);
  }

  const texto = await respuesta.text();
  let datos: unknown = null;
  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = null;
    }
  }

  if (!respuesta.ok) {
    // Sesión vencida o inválida: se limpia y se vuelve al login (salvo en el propio login).
    if (respuesta.status === 401 && ruta !== "/auth/login") {
      borrarToken();
      window.location.href = "/signin";
    }
    const mensaje = (datos as { message?: string | string[] } | null)?.message;
    throw new ApiError(
      Array.isArray(mensaje) ? mensaje.join(". ") : (mensaje ?? "Ocurrió un error inesperado"),
      respuesta.status,
    );
  }

  return datos as T;
}
