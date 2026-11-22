import { afterEach, describe, expect, it, vi } from "vitest";
import {
  enableAutoUnmount,
  flushPromises,
  mount,
} from "@vue/test-utils";

import { expectNoA11yViolations } from "@/test/accessibility";
import ChannelDetailDialog from "./ChannelDetailDialog.vue";

vi.mock("@/infrastructure/pocketbase/client", () => ({
  pb: {
    files: {
      getURL: vi.fn(() => ""),
    },
  },
}));

enableAutoUnmount(afterEach);

describe("ChannelDetailDialog EPG", () => {
  it("mantém acessibilidade com guia EPG", async () => {
    const wrapper = mount(ChannelDetailDialog, {
      attachTo: document.body,
      props: {
        channel: {
          id: "c1",
          created: "",
          updated: "",
          nome: "Canal",
          url_stream: "",
          tvg_id: "c1",
        },
        links: [],
        loading: false,
      },
      global: {
        stubs: {
          Teleport: true,
          StreamLinkManager: true,
          StreamPlayerDialog: true,
        },
      },
    });

    await flushPromises();
    await expectNoA11yViolations(wrapper.element);
    expect(wrapper.text()).toContain("Programação");
  });
});
