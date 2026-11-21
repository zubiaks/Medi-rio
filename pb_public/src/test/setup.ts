/**
 * Ficheiro: src/test/setup.ts
 * Tipo: Configuração global do Vitest.
 * Função: Prepara jsdom para Vue, axe-core, matchMedia e Canvas.
 */
import { config } from "@vue/test-utils";
config.global.stubs = { Teleport: true };
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false, media: query, onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
if (typeof HTMLCanvasElement !== "undefined") {
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: () => null,
  });
}
