import { afterEach, describe, it, vi } from "vitest";
import {
  enableAutoUnmount,
  flushPromises,
  mount,
} from "@vue/test-utils";

import { expectNoA11yViolations } from "@/test/accessibility";
import InventoryCreateDialog from "./InventoryCreateDialog.vue";

vi.mock("@/domain/library/inventoryWorkflow", () => ({
  createInventory: vi.fn(),
}));

enableAutoUnmount(afterEach);

describe("InventoryCreateDialog", () => {
  it("não apresenta violações automáticas", async () => {
    const wrapper = mount(InventoryCreateDialog, {
      attachTo: document.body,
      props: { open: true },
      global: { stubs: { Teleport: true } },
    });

    await flushPromises();
    await expectNoA11yViolations(wrapper.element);
  });
});
