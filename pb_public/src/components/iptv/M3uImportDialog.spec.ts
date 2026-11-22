/**
 * Projeto: Mediário
 * Ficheiro: src/components/iptv/M3uImportDialog.spec.ts
 * Versão do ficheiro: 1.0.3
 * Tipo: Testes Vitest do importador M3U IPTV
 * Autor: Zubiaks
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";

import { expectNoA11yViolations } from "@/test/accessibility";
import M3uImportDialog from "./M3uImportDialog.vue";

const repositoryMocks = vi.hoisted(() => ({
  createChannel: vi.fn(),
  createSource: vi.fn(),
  deleteChannel: vi.fn(),
}));

vi.mock("@/domain/repositories", () => ({
  iptvChannelRepository: {
    create: repositoryMocks.createChannel,
    delete: repositoryMocks.deleteChannel,
  },
  iptvSourceRepository: {
    create: repositoryMocks.createSource,
  },
}));

vi.mock("@/domain/iptv/m3uDuplicate", () => ({
  findM3uDuplicate: vi.fn(() => ({ kind: null })),
}));

enableAutoUnmount(afterEach);

function item(name: string, url: string) {
  return {
    name,
    url,
    tvgId: name,
    tvgName: name,
    tvgLogo: "",
    groupTitle: "Testes",
    language: "",
    country: "",
    adult: false,
    selected: true,
    errors: [],
  };
}

function mountDialog() {
  return mount(M3uImportDialog, {
    attachTo: document.body,
    props: { open: true, existing: [] },
  });
}

beforeEach(() => {
  repositoryMocks.createChannel.mockReset();
  repositoryMocks.createSource.mockReset();
  repositoryMocks.deleteChannel.mockReset();
});

describe("M3uImportDialog", () => {
  it("não apresenta violações automáticas", async () => {
    const wrapper = mountDialog();
    await flushPromises();
    await expectNoA11yViolations(wrapper.element);
  });

  it("faz rollback e continua depois de uma fonte falhar", async () => {
    repositoryMocks.createChannel
      .mockResolvedValueOnce({ id: "c1" })
      .mockResolvedValueOnce({ id: "c2" });
    repositoryMocks.createSource
      .mockRejectedValueOnce(new Error("fonte falhou"))
      .mockResolvedValueOnce({ id: "s2" });
    repositoryMocks.deleteChannel.mockResolvedValue({});

    const wrapper = mountDialog();
    (wrapper.vm as any).items = [
      item("Canal 1", "https://x/1.m3u8"),
      item("Canal 2", "https://x/2.m3u8"),
    ];

    await (wrapper.vm as any).run();
    await flushPromises();

    expect(repositoryMocks.deleteChannel).toHaveBeenCalledWith("c1");
    expect(repositoryMocks.createChannel).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain("1 importadas");
    expect(wrapper.text()).toContain("1 falhadas");
  });

  it("regista falha de rollback sem parar o lote", async () => {
    repositoryMocks.createChannel
      .mockResolvedValueOnce({ id: "c1" })
      .mockResolvedValueOnce({ id: "c2" });
    repositoryMocks.createSource
      .mockRejectedValueOnce(new Error("fonte falhou"))
      .mockResolvedValueOnce({ id: "s2" });
    repositoryMocks.deleteChannel.mockRejectedValueOnce(
      new Error("rollback falhou"),
    );

    const wrapper = mountDialog();
    (wrapper.vm as any).items = [
      item("Canal 1", "https://x/1.m3u8"),
      item("Canal 2", "https://x/2.m3u8"),
    ];

    await (wrapper.vm as any).run();
    await flushPromises();

    expect(wrapper.text()).toContain("rollback falhou");
    expect(repositoryMocks.createChannel).toHaveBeenCalledTimes(2);
  });

  it("permite iniciar outra importação depois do resumo", async () => {
    repositoryMocks.createChannel.mockResolvedValueOnce({ id: "c1" });
    repositoryMocks.createSource.mockResolvedValueOnce({ id: "s1" });

    const wrapper = mountDialog();
    (wrapper.vm as any).items = [
      item("Canal 1", "https://x/1.m3u8"),
    ];

    await (wrapper.vm as any).run();
    await flushPromises();

    const importAgainButton = wrapper
      .findAll("button")
      .find((button) => button.text().trim() === "Importar outra playlist");

    expect(importAgainButton).toBeDefined();
    await importAgainButton!.trigger("click");
    await flushPromises();

    expect(wrapper.text()).not.toContain("Resultado da importação");
    expect((wrapper.vm as any).items).toEqual([]);
  });
});
