import { afterEach, describe, it } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { expectNoA11yViolations } from "@/test/accessibility";
import TmdbDialogProgress from "./TmdbDialogProgress.vue";

enableAutoUnmount(afterEach);

describe("TmdbDialogProgress", () => {
  it("não apresenta violações automáticas", async () => {
    const wrapper = mount(TmdbDialogProgress, {
      props: {
        current: "catalogue",
        completed: ["search", "result"],
      },
    });
    await expectNoA11yViolations(wrapper.element);
  });
});
