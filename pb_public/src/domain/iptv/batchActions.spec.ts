import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyChannelBatch } from "./batchActions";
const mocks = vi.hoisted(() => ({ update: vi.fn() }));
vi.mock("@/domain/repositories", () => ({ iptvChannelRepository: { update: mocks.update } }));
beforeEach(() => mocks.update.mockReset());
describe("applyChannelBatch", () => {
  it("continua depois de falhas individuais", async () => {
    mocks.update.mockResolvedValueOnce({ id: "1" }).mockRejectedValueOnce(new Error("falhou"));
    const result = await applyChannelBatch([{ id: "1" }, { id: "2" }] as any, "activate");
    expect(result.updated).toHaveLength(1);
    expect(result.failed).toHaveLength(1);
  });
});
