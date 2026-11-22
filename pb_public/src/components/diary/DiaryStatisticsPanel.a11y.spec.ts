import { afterEach, describe, it } from "vitest";
import {
  enableAutoUnmount,
  flushPromises,
  mount,
} from "@vue/test-utils";

import { expectNoA11yViolations } from "@/test/accessibility";
import DiaryStatisticsPanel from "./DiaryStatisticsPanel.vue";

enableAutoUnmount(afterEach);

describe("DiaryStatisticsPanel", () => {
  it("não apresenta violações automáticas", async () => {
    const wrapper = mount(DiaryStatisticsPanel, {
      attachTo: document.body,
      props: { entries: [], reviews: [] },
      global: {
        stubs: {
          BaseMetricCard: {
            props: ["label", "value", "detail"],
            template: "<div><strong>{{ label }}</strong><span>{{ value }}</span><small>{{ detail }}</small></div>",
          },
        },
      },
    });

    await flushPromises();
    await expectNoA11yViolations(wrapper.element);
  });
});
