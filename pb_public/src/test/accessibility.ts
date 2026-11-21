/** Ficheiro: src/test/accessibility.ts | Executa axe-core em elementos ligados ao documento. */
import axe from "axe-core";
import { expect } from "vitest";
export async function expectNoA11yViolations(element: Element): Promise<void> {
  if (!element.isConnected) throw new Error("O elemento testado não está ligado ao document.body. Usa attachTo.");
  const result = await axe.run(element, { rules: { region: { enabled: false }, "color-contrast": { enabled: false } } });
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
}
