/**
 * Projeto: Mediário
 * Ficheiro: src/components/iptv/M3uImportDialog.spec.ts
 * Versão do ficheiro: 1.1.1
 * Tipo: Testes Vitest do importador M3U IPTV
 * Autor: Zubiaks
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  enableAutoUnmount,
  flushPromises,
  mount,
} from "@vue/test-utils";

import { expectNoA11yViolations } from "@/test/accessibility";
import M3uImportDialog from "./M3uImportDialog.vue";

const mocks = vi.hoisted(() => ({
  channelCreate: vi.fn(),
  channelDelete: vi.fn(),
  sourceCreate: vi.fn(),
  categoryList: vi.fn(),
  categoryCreate: vi.fn(),
}));

vi.mock("@/domain/repositories", () => ({
  iptvChannelRepository: {
    create: mocks.channelCreate,
    delete: mocks.channelDelete,
  },
  iptvSourceRepository: {
    create: mocks.sourceCreate,
  },
  iptvCategoryRepository: {
    list: mocks.categoryList,
    create: mocks.categoryCreate,
  },
}));

vi.mock("@/domain/iptv/m3uDuplicate", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("@/domain/iptv/m3uDuplicate")
  >();

  return {
    ...actual,
    findM3uDuplicate: vi.fn(() => ({ kind: null })),
  };
});

enableAutoUnmount(afterEach);

function item(
  name: string,
  url: string,
  groupTitle = "Notícias",
  tvgId = name,
) {
  return {
    name,
    url,
    tvgId,
    tvgName: name,
    tvgLogo: "",
    groupTitle,
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
    props: {
      open: true,
      existing: [],
    },
  });
}

beforeEach(() => {
  Object.values(mocks).forEach((mock) => mock.mockReset());

  mocks.categoryList.mockResolvedValue({
    items: [],
    totalItems: 0,
    totalPages: 1,
    page: 1,
    perPage: 500,
  });

  mocks.categoryCreate.mockImplementation(async (data) => ({
    id: "cat-new",
    ...data,
  }));
});

describe("M3uImportDialog", () => {
  it("não apresenta violações automáticas", async () => {
    const wrapper = mountDialog();

    await flushPromises();
    await expectNoA11yViolations(wrapper.element);
  });

  it("cria categoria a partir de group-title e associa ao canal", async () => {
    mocks.categoryCreate.mockResolvedValue({
      id: "cat1",
      nome: "Notícias",
    });
    mocks.channelCreate.mockResolvedValue({ id: "c1" });
    mocks.sourceCreate.mockResolvedValue({ id: "s1" });

    const wrapper = mountDialog();
    (wrapper.vm as any).items = [
      item("Canal 1", "https://x/1.m3u8"),
    ];

    await (wrapper.vm as any).run();
    await flushPromises();

    expect(mocks.categoryCreate).toHaveBeenCalledWith({
      nome: "Notícias",
      ativo: true,
      ordem: 0,
    });
    expect(mocks.channelCreate).toHaveBeenCalledWith(
      expect.objectContaining({ categoria: "cat1" }),
    );
  });

  it("reutiliza categoria existente ignorando acentos e maiúsculas", async () => {
    mocks.categoryList.mockResolvedValue({
      items: [{ id: "cat1", nome: "Noticias" }],
      totalItems: 1,
      totalPages: 1,
      page: 1,
      perPage: 500,
    });
    mocks.channelCreate.mockResolvedValue({ id: "c1" });
    mocks.sourceCreate.mockResolvedValue({ id: "s1" });

    const wrapper = mountDialog();
    (wrapper.vm as any).items = [
      item("Canal 1", "https://x/1.m3u8", "NOTÍCIAS"),
    ];

    await (wrapper.vm as any).run();

    expect(mocks.categoryCreate).not.toHaveBeenCalled();
    expect(mocks.channelCreate).toHaveBeenCalledWith(
      expect.objectContaining({ categoria: "cat1" }),
    );
  });

  it("ignora duplicados internos e continua o lote", async () => {
    mocks.channelCreate.mockResolvedValue({ id: "c1" });
    mocks.sourceCreate.mockResolvedValue({ id: "s1" });

    const wrapper = mountDialog();
    (wrapper.vm as any).items = [
      item("A", "https://x/a", "Grupo", "a"),
      item("A2", "https://x/a", "Grupo", "b"),
    ];

    await (wrapper.vm as any).run();
    await flushPromises();

    expect(mocks.categoryCreate).toHaveBeenCalledTimes(1);
    expect(mocks.channelCreate).toHaveBeenCalledTimes(1);
    expect(mocks.sourceCreate).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain("1 ignoradas");
    expect(wrapper.text()).toContain("1 duplicados internos");
  });
});
