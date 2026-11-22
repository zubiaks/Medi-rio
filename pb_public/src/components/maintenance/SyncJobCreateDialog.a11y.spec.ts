import { afterEach, describe, it, vi } from "vitest";
import {
  enableAutoUnmount,
  flushPromises,
  mount,
} from "@vue/test-utils";
import { expectNoA11yViolations } from "@/test/accessibility";
import SyncJobCreateDialog from "./SyncJobCreateDialog.vue";

vi.mock("@/domain/providers/jobWorkflow", () => ({ createSyncJob: vi.fn() }));
vi.mock("@/domain/providers/audit", () => ({ writeAuditLog: vi.fn() }));
enableAutoUnmount(afterEach);

describe("SyncJobCreateDialog", () => {
  it("não apresenta violações automáticas", async () => {
    const wrapper = mount(SyncJobCreateDialog, {
      attachTo: document.body,
      props: { open: true, jobs: [] },
      global: { stubs: { Teleport: true } },
    });
    await flushPromises();
    await expectNoA11yViolations(wrapper.element);
  });
});
