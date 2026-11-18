"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";
import TopNav from "@/layout/TopNav";
import React, { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  // Ruta protegida (SWR-AUTH-007): sin sesión se vuelve al login.
  useEffect(() => {
    if (!cargando && !usuario) {
      router.replace("/signin");
    }
  }, [cargando, usuario, router]);

  if (cargando || !usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F3F4F9] dark:bg-gray-950">
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 pb-12 md:px-6">{children}</main>
    </div>
  );
}
