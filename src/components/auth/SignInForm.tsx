"use client";

import { Boton, Campo, Mensaje } from "@/components/quizstar/ui";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api";
import Image from "next/image";
import { useState, type FormEvent } from "react";

export default function SignInForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    if (!correo.trim() || !password) {
      setError("Escribe tu correo y tu contraseña.");
      return;
    }

    setEnviando(true);
    try {
      await login(correo.trim(), password);
      router.replace("/panel");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo iniciar sesión.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="mb-8">
          <Image
            src="/images/logo/quizstar-logo-ancho-claro.svg"
            alt="QuizStar"
            width={180}
            height={40}
            className="mb-6 dark:hidden"
          />
          <Image
            src="/images/logo/quizstar-logo-ancho-oscuro.svg"
            alt="QuizStar"
            width={180}
            height={40}
            className="mb-6 hidden dark:block"
          />
          <h1 className="mb-2 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
            Iniciar sesión
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Escribe tu correo y tu contraseña para entrar a QuizStar.
          </p>
        </div>

        {error && <Mensaje tipo="error">{error}</Mensaje>}

        <form onSubmit={enviar} noValidate className="space-y-6">
          <Campo
            id="correo"
            etiqueta="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="profe@quizstar.test"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <Campo
            id="password"
            etiqueta="Contraseña"
            type="password"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Boton type="submit" className="w-full" disabled={enviando}>
            {enviando ? "Entrando..." : "Iniciar sesión"}
          </Boton>
        </form>
      </div>
    </div>
  );
}
