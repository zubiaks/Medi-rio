import { afterEach, describe, it, vi } from "vitest";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { expectNoA11yViolations } from "@/test/accessibility";
import LibraryCopyDialog from "./LibraryCopyDialog.vue";
vi.mock("@/domain/repositories", () => ({ titleRepository: { list: vi.fn(async () => ({ items: [] })) } }));
vi.mock("@/domain/library/repository", () => ({
  libraryCopyRepository: { create: vi.fn(), update: vi.fn() },
  physicalFormatRepository: { list: vi.fn(async () => ({ items: [] })) },
  editionTypeRepository: { list: vi.fn(async () => ({ items: [] })) },
}));
vi.mock("@/infrastructure/pocketbase/repository", () => ({
  PocketBaseRepository: class { list = vi.fn(async () => ({ items: [] })); },
}));
enableAutoUnmount(afterEach);
describe("LibraryCopyDialog", () => {
  it("não apresenta violações automáticas", async () => {
    const wrapper = mount(LibraryCopyDialog, { attachTo: document.body, props: { open: true, copy: null }, global: { stubs: { Teleport: true } } });
    await flushPromises();
    await expectNoA11yViolations(wrapper.element);
  });
});
