import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Limpia el DOM entre pruebas para que no se mezclen.
afterEach(() => {
  cleanup();
});
