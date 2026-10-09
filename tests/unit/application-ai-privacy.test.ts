import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn() }));
import { getSubmittedApplication } from "../../src/lib/ai/application-data";
const id = "39000000-0000-4000-8000-000000000001";
describe("structured contact data stays outside AI reads", () => {
  it("projects only the selected frozen letter and requirements", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id, job_id: id, cover_letter: "Synthetic letter" }, error: null });
    const query = { select: vi.fn(), eq: vi.fn(), maybeSingle }; query.select.mockReturnValue(query); query.eq.mockReturnValue(query);
    const client = { from: vi.fn(() => query), rpc: vi.fn().mockResolvedValue({ data: "Synthetic requirements", error: null }) };
    // Adapter accepts the same RLS-scoped query interface as the production SDK.
    const result = await getSubmittedApplication(client as never, id);
    expect(query.select).toHaveBeenCalledWith("id,job_id,cover_letter");
    expect(query.eq).toHaveBeenCalledWith("submission_state", "submitted");
    expect(result).toEqual({ id, coverLetter: "Synthetic letter", requirements: "Synthetic requirements" });
  });
});
