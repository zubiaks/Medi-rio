/** Ficheiro: src/components/iptv/StreamLinkEditDialog.a11y.spec.ts | Testa acessibilidade do formulário de fontes. */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  enableAutoUnmount,
  flushPromises,
  mount,
} from "@vue/test-utils";

import { expectNoA11yViolations } from "@/test/accessibility";
import StreamLinkEditDialog from "./StreamLinkEditDialog.vue";

enableAutoUnmount(afterEach);

vi.mock("@/domain/repositories", () => ({
  streamLinkRepository: {
    list: vi.fn(async () => ({ items: [] })),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

const channel = {
  id: "c1",
  created: "",
  updated: "",
  nome: "Canal",
  url_stream: "https://example.com/live.m3u8",
};

function mountDialog() {
  return mount(StreamLinkEditDialog, {
    attachTo: document.body,
    props: {
      channel,
      link: null,
      open: true,
    },
    global: {
      stubs: {
        Teleport: true,
      },
    },
  });
}

describe("a11y: StreamLinkEditDialog", () => {
  it("não tem violações automáticas", async () => {
    const wrapper = mountDialog();
    await flushPromises();
    await expectNoA11yViolations(wrapper.element);
  });

  it("associa erro à URL", async () => {
    const wrapper = mountDialog();
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    expect(
      wrapper.get("#stream-link-url").attributes("aria-invalid"),
    ).toBe("true");
  });
});
