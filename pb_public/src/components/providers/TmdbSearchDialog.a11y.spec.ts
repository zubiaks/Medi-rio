import { afterEach, describe, it, vi } from "vitest";
import {
  enableAutoUnmount,
  flushPromises,
  mount,
} from "@vue/test-utils";
import { expectNoA11yViolations } from "@/test/accessibility";
import TmdbSearchDialog from "./TmdbSearchDialog.vue";

vi.mock("@/domain/repositories", () => ({
  titleRepository: { list: vi.fn(async () => ({ items: [] })) },
}));
vi.mock("@/domain/providers/repository", () => ({
  externalSourceRepository: { create: vi.fn() },
}));
vi.mock("@/domain/providers/tmdbClient", () => ({
  searchTmdb: vi.fn(),
  loadTmdbDetails: vi.fn(),
}));

enableAutoUnmount(afterEach);

describe("TmdbSearchDialog", () => {
  it("não apresenta violações automáticas", async () => {
    const wrapper = mount(TmdbSearchDialog, {
      attachTo: document.body,
      props: { open: true, existing: [] },
      global: { stubs: { Teleport: true } },
    });
    await flushPromises();
    await expectNoA11yViolations(wrapper.element);
  });
});
