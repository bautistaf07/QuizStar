"use client";

import SelectorIdioma from "@/components/common/SelectorIdioma";
import { useAuth } from "@/context/AuthContext";
import { useIdioma } from "@/context/IdiomaContext";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

function Ilustracion() {
  return (
    <svg viewBox="0 0 520 480" className="h-auto w-full max-w-[520px]" role="img" aria-label="Ilustración de un quiz con respuestas y una estrella">
      {/* Fondo suave */}
      <circle cx="270" cy="240" r="215" fill="#FFF1C7" />
      {/* Tarjeta del quiz */}
      <g transform="rotate(-4 260 240)">
        <rect x="90" y="70" width="330" height="340" rx="28" fill="#FFFFFF" stroke="#E4E7EC" strokeWidth="2" />
        <rect x="90" y="70" width="330" height="62" rx="28" fill="#4338D8" />
        <rect x="90" y="104" width="330" height="28" fill="#4338D8" />
        <text x="118" y="110" fill="#FFFFFF" fontSize="20" fontWeight="700">Quiz de Historia</text>
        <text x="330" y="110" fill="#FFC933" fontSize="18" fontWeight="700">08:45</text>
        <text x="118" y="170" fill="#1B1740" fontSize="19" fontWeight="700">¿En qué año se firmó</text>
        <text x="118" y="196" fill="#1B1740" fontSize="19" fontWeight="700">la independencia?</text>
        {/* opciones */}
        <rect x="118" y="218" width="274" height="40" rx="12" fill="#F6F5FF" stroke="#C3BEFF" />
        <text x="136" y="244" fill="#382EB8" fontSize="16">A.  1809</text>
        <rect x="118" y="268" width="274" height="40" rx="12" fill="#E6F8F4" stroke="#2BC0A1" strokeWidth="2" />
        <text x="136" y="294" fill="#1B1740" fontSize="16" fontWeight="700">B.  1810</text>
        <circle cx="368" cy="288" r="11" fill="#2BC0A1" />
        <path d="M362 288 l5 5 l9 -10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="118" y="318" width="274" height="40" rx="12" fill="#F6F5FF" stroke="#C3BEFF" />
        <text x="136" y="344" fill="#382EB8" fontSize="16">C.  1819</text>
        {/* barra de progreso */}
        <rect x="118" y="378" width="274" height="10" rx="5" fill="#EDECFF" />
        <rect x="118" y="378" width="190" height="10" rx="5" fill="#FF5A5F" />
      </g>
      {/* Estrella grande */}
      <g transform="rotate(12 420 100)">
        <polygon points="420,40 436,80 479,84 446,112 456,154 420,132 384,154 394,112 361,84 404,80" fill="#FFC933" stroke="#FFC933" strokeWidth="10" strokeLinejoin="round" />
        <path d="M411 98 C411 88 429 88 429 98 C429 107 420 107 420 115" fill="none" stroke="#1B1740" strokeWidth="6" strokeLinecap="round" />
        <circle cx="420" cy="124" r="3.5" fill="#1B1740" />
      </g>
      {/* Insignias flotantes */}
      <g>
        <rect x="14" y="414" width="150" height="58" rx="16" fill="#FFFFFF" stroke="#E4E7EC" />
        <circle cx="42" cy="443" r="14" fill="#2BC0A1" />
        <text x="36" y="449" fill="#fff" fontSize="16" fontWeight="700">1</text>
        <text x="64" y="438" fill="#1B1740" fontSize="14" fontWeight="700">Ranking</text>
        <text x="64" y="458" fill="#667085" fontSize="13">Ana · 95 pts</text>
      </g>
      <g>
        <rect x="372" y="420" width="130" height="52" rx="16" fill="#FFFFFF" stroke="#E4E7EC" />
        <circle cx="398" cy="446" r="12" fill="#FF5A5F" />
        <text x="418" y="442" fill="#1B1740" fontSize="14" fontWeight="700">Nota</text>
        <text x="418" y="461" fill="#667085" fontSize="13">92 / 100</text>
      </g>
      <circle cx="60" cy="110" r="10" fill="#FF5A5F" />
      <circle cx="470" cy="260" r="8" fill="#2BC0A1" />
      <circle cx="40" cy="220" r="6" fill="#4338D8" />
    </svg>
  );
}

const PASOS = [
  { n: "1", t: "Crea tu quiz", d: "El profesor arma preguntas de selección múltiple con tiempo límite.", c: "bg-brand-500" },
  { n: "2", t: "Asígnalo a un grupo", d: "Solo los estudiantes matriculados lo ven y lo presentan.", c: "bg-[#FF5A5F]" },
  { n: "3", t: "Mira el resultado", d: "Calificación automática y ranking del grupo al terminar.", c: "bg-[#2BC0A1]" },
];

export default function Landing() {
  const { usuario } = useAuth();
  const { t } = useIdioma();

  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#1B1740]">
      {/* Menú */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" aria-label="QuizStar">
          <Image src="/images/logo/quizstar-logo-ancho-claro.svg" alt="QuizStar" width={150} height={34} priority className="h-9 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#como-funciona" className="hover:text-brand-500">{t("Cómo funciona")}</a>
          <a href="#roles" className="hover:text-brand-500">{t("Para quién")}</a>
        </nav>
        <div className="flex items-center gap-3">
          <SelectorIdioma />
          {usuario ? (
            <Link href="/panel" className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
              {t("Ir a mi panel")}
            </Link>
          ) : (
            <Link href="/signin" className="rounded-lg border border-[#1B1740] px-5 py-2 text-sm font-semibold hover:bg-[#1B1740] hover:text-white">
              {t("Iniciar sesión")}
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 pb-16 pt-6 md:grid-cols-2 md:pt-12">
        <div className="pointer-events-none absolute -right-40 -top-24 hidden h-[620px] w-[620px] rounded-full bg-[#FFF6DB] md:block" />
        <div className="relative">
          <p className="mb-4 text-sm font-bold uppercase tracking-wide text-[#FF5A5F]">{t("Evaluación para colegios y universidades")}</p>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            {t("Crea quices,")} <span className="relative inline-block text-brand-500">{t("aprende")}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 8 C50 2 120 2 198 7" stroke="#FF5A5F" strokeWidth="5" fill="none" strokeLinecap="round" />
              </svg>
            </span>{" "}
            {t("y compite en tu aula")}
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[#475467]">
            {t("QuizStar le permite al profesor crear y asignar quices por grupo, y al estudiante presentarlos con tiempo límite, ver su nota y su puesto en el ranking.")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link href={usuario ? "/panel" : "/signin"} className="rounded-lg bg-[#FFC933] px-7 py-3.5 text-sm font-bold text-[#1B1740] shadow-lg shadow-[#FFC933]/40 hover:brightness-95">
              {t(usuario ? "Ir a mi panel" : "Empezar ahora")}
            </Link>
            <a href="#como-funciona" className="flex items-center gap-3 text-sm font-semibold text-[#475467] hover:text-brand-500">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white" aria-hidden="true">▶</span>
              {t("Ver cómo funciona")}
            </a>
          </div>
        </div>
        <div className="relative flex justify-center">
          <Ilustracion />
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-center text-sm font-bold uppercase tracking-wide text-[#FF5A5F]">{t("Cómo funciona")}</p>
        <h2 className="mt-2 text-center text-3xl font-extrabold">{t("Tres pasos y listo")}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PASOS.map((p) => (
            <div key={p.n} className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white ${p.c}`}>{p.n}</span>
              <h3 className="mt-5 text-lg font-bold">{t(p.t)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#475467]">{t(p.d)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="bg-brand-25 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 md:grid-cols-3">
          {[
            ["Administrador", "Crea los usuarios de su institución y controla quién tiene acceso."],
            ["Profesor", "Crea grupos, matricula estudiantes, arma quices y revisa resultados."],
            ["Estudiante", "Presenta sus quices a tiempo, ve su nota y su lugar en el ranking."],
          ].map(([rol, d]) => (
            <div key={rol} className="rounded-3xl bg-white p-7">
              <h3 className="text-lg font-bold text-brand-500">{t(rol)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#475467]">{t(d)}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-5 py-8 text-center text-sm text-[#667085]">
        {t("QuizStar · Proyecto de Calidad de Software · CORHUILA")}
      </footer>
    </div>
  );
}
