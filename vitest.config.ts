import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/lib/**",
        "src/context/AuthContext.tsx",
        "src/components/quizstar/**",
        "src/components/auth/SignInForm.tsx",
        "src/layout/TopNav.tsx",
      ],
      // Quality Gate básico: si la cobertura baja de estos valores, falla.
      thresholds: { statements: 60, branches: 50, functions: 60, lines: 60 },
    },
  },
});
