import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => {
 const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() }; query.select.mockReturnValue(query); query.eq.mockReturnValue(query);
 return { rpc: vi.fn(), query, from: vi.fn(() => query), revalidate: vi.fn(), redirect: vi.fn((path: string) => { throw new Error("REDIRECT:"+path); }) };
});
const id="50000000-0000-4000-8000-000000000101", actor="50000000-0000-4000-8000-000000000001";
vi.mock("@/lib/auth", () => ({ requireApplicant: async () => ({ user: { id: actor }, client: { rpc: mocks.rpc, from: mocks.from } }) }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
import { withdrawApplication } from "@/app/applications/actions";
function form(confirmed=true) { const f=new FormData(); f.set("applicationId", id); if(confirmed) f.set("confirmed", "true");return f; }
describe("confirmed withdrawal action", () => {
 beforeEach(() => {vi.clearAllMocks(); mocks.rpc.mockResolvedValue({data:id,error:null}); mocks.query.maybeSingle.mockResolvedValue({data:null,error:null});});
 it("does not withdraw without explicit confirmation", async () => { await withdrawApplication({message:null},form(false));expect(mocks.rpc).not.toHaveBeenCalled(); });
 it("withdraws only the selected application through the checked RPC", async () => {
  await expect(withdrawApplication({message:null},form())).rejects.toThrow("REDIRECT:/applications/"+id+"?notice=withdrawn");
  expect(mocks.rpc).toHaveBeenCalledWith("withdraw_application", {p_application_id:id});
  expect(mocks.revalidate).toHaveBeenCalledWith("/hr/applications");
 });
 it("reconciles a lost response only through the verified owner's terminal record", async () => {
  mocks.rpc.mockRejectedValueOnce(new Error("timeout"));
  mocks.query.maybeSingle.mockResolvedValueOnce({data:{id,submission_state:"submitted",withdrawn_by:actor,withdrawn_at:"2026-10-10T00:00:00+00:00"},error:null});
  await expect(withdrawApplication({message:null},form())).rejects.toThrow("?notice=withdrawn");
  expect(mocks.query.eq).toHaveBeenCalledWith("applicant_id",actor);
 });
 it("retains safe failure feedback when persistence cannot be confirmed", async () => {
  mocks.rpc.mockResolvedValueOnce({data:null,error:{message:"private error"}});
  const result=await withdrawApplication({message:null},form()); expect(result.message).toContain("could not confirm"); expect(result.message).not.toContain("private error");expect(mocks.redirect).not.toHaveBeenCalled();
 });
});
