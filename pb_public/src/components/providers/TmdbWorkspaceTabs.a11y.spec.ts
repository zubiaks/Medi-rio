import { afterEach, describe, expect, it } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { expectNoA11yViolations } from "@/test/accessibility";
import TmdbWorkspaceTabs from "./TmdbWorkspaceTabs.vue";

enableAutoUnmount(afterEach);

describe("TmdbWorkspaceTabs", () => {
  it("não apresenta violações automáticas", async () => {
    const wrapper = mount(TmdbWorkspaceTabs, {
      props: { mediaType: "movie", modelValue: "metadata" },
      slots: {
        metadata: "<p>Metadados do título</p>",
        relations: "<p>Relações do título</p>",
      },
    });

    await expectNoA11yViolations(wrapper.element);
  });

  it("navega com setas e atualiza o separador ativo", async () => {
    const wrapper = mount(TmdbWorkspaceTabs, {
      props: { mediaType: "movie", modelValue: "metadata" },
    });

    const first = wrapper.get('[role="tab"]');
    await first.trigger("keydown", { key: "ArrowRight" });

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["relations"]);
  });

  it("não apresenta temporadas para filmes", () => {
    const wrapper = mount(TmdbWorkspaceTabs, {
      props: { mediaType: "movie", modelValue: "metadata" },
    });

    expect(wrapper.text()).not.toContain("Temporadas");
  });
});
