/**
 * Projeto: Mediário
 * Ficheiro: src/components/iptv/M3uImportDialog.spec.ts
 * Tipo: Testes Vitest do importador M3U IPTV
 * Autor: Zubiaks
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { expectNoA11yViolations } from "@/test/accessibility";
import M3uImportDialog from "./M3uImportDialog.vue";

const create = vi.fn();
const createSource = vi.fn();
const remove = vi.fn();
vi.mock("@/domain/repositories", () => ({
  iptvChannelRepository: { create, delete: remove },
  iptvSourceRepository: { create: createSource },
}));
vi.mock("@/domain/iptv/m3uDuplicate", () => ({
  findM3uDuplicate: vi.fn(() => ({ kind: null })),
}));

enableAutoUnmount(afterEach);
const item = (name: string, url: string) => ({ name, url, tvgId: name, tvgName: name,
  tvgLogo: "", groupTitle: "Testes", language: "", country: "", adult: false,
  selected: true, errors: [] });

function mountDialog() {
  return mount(M3uImportDialog, { attachTo: document.body, props: { open: true, existing: [] } });
}

beforeEach(() => { vi.clearAllMocks(); });

describe("M3uImportDialog", () => {
  it("não apresenta violações automáticas", async () => {
    const wrapper = mountDialog();
    await flushPromises();
    await expectNoA11yViolations(wrapper.element);
  });

  it("faz rollback e continua depois de uma fonte falhar", async () => {
    create.mockResolvedValueOnce({ id: "c1" }).mockResolvedValueOnce({ id: "c2" });
    createSource.mockRejectedValueOnce(new Error("fonte falhou")).mockResolvedValueOnce({ id: "s2" });
    remove.mockResolvedValue({});
    const wrapper = mountDialog();
    (wrapper.vm as any).items = [item("Canal 1", "https://x/1.m3u8"), item("Canal 2", "https://x/2.m3u8")];
    await (wrapper.vm as any).run();
    await flushPromises();
    expect(remove).toHaveBeenCalledWith("c1");
    expect(create).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain("1 importadas");
    expect(wrapper.text()).toContain("1 falhadas");
  });

  it("regista falha de rollback sem parar o lote", async () => {
    create.mockResolvedValueOnce({ id: "c1" }).mockResolvedValueOnce({ id: "c2" });
    createSource.mockRejectedValueOnce(new Error("fonte falhou")).mockResolvedValueOnce({ id: "s2" });
    remove.mockRejectedValueOnce(new Error("rollback falhou"));
    const wrapper = mountDialog();
    (wrapper.vm as any).items = [item("Canal 1", "https://x/1.m3u8"), item("Canal 2", "https://x/2.m3u8")];
    await (wrapper.vm as any).run();
    await flushPromises();
    expect(wrapper.text()).toContain("rollback falhou");
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("reinicia o estado para importar outra playlist", async () => {
    const wrapper = mountDialog();
    (wrapper.vm as any).summary = { imported: 1, skipped: 0, failed: 0, failures: [] };
    await wrapper.get("button.button-secondary").trigger("click");
    expect((wrapper.vm as any).summary).toBeNull();
  });
});
