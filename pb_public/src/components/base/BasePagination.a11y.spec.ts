/**
 * Ficheiro: src/components/base/BasePagination.a11y.spec.ts
 * Tipo: Teste automatizado de acessibilidade.
 * Função: Valida a paginação ligada ao document.body para uso do axe-core.
 */
import { afterEach, describe, expect, it } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { expectNoA11yViolations } from "@/test/accessibility";
import BasePagination from "./BasePagination.vue";

enableAutoUnmount(afterEach);

describe("a11y: BasePagination", () => {
  it("não apresenta violações automáticas", async () => {
    const wrapper = mount(BasePagination, {
      attachTo: document.body,
      props: { page: 2, pages: 20, label: "Paginação dos canais" },
    });
    await expectNoA11yViolations(wrapper.element);
  });

  it("identifica a página atual", () => {
    const wrapper = mount(BasePagination, {
      attachTo: document.body,
      props: { page: 15, pages: 20, label: "Paginação dos canais" },
    });
    const current = wrapper.get('[aria-current="page"]');
    expect(current.text()).toBe("15");
    expect(current.attributes("aria-label")).toBe("Ir para a página 15");
  });

  it("desativa Anterior na primeira página", () => {
    const wrapper = mount(BasePagination, {
      attachTo: document.body,
      props: { page: 1, pages: 20, label: "Paginação dos canais" },
    });
    const previous = wrapper.findAll("button").find((button) => button.text().includes("Anterior"));
    expect(previous).toBeDefined();
    expect(previous?.attributes()).toHaveProperty("disabled");
  });
});
