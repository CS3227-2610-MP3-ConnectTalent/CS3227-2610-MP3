import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/app/applications/actions", () => ({ updateApplication: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
import { ApplicationForm } from "@/components/application-form";
import { ResumePanel } from "@/components/resume-panel";

describe("application form composition", () => {
  it("keeps AI in the one application form without a nested or separate AI form", () => {
    const html = renderToStaticMarkup(<ApplicationForm jobId="synthetic" value="" revision={1} submitted={false} email="synthetic@example.test" details={{ full_name: null, phone: null, portfolio_url: null, submitted_email: null }} />);
    expect((html.match(/<form\b/g) ?? []).length).toBe(1);
    expect(html.indexOf("Draft with AI")).toBeLessThan(html.indexOf("</form>"));
    expect(html).toMatch(/type="button"[^>]*>Generate draft/);
  });
  it("has a styled fresh-form file control without manual-save gating or permanent cancellation", () => {
    const html = renderToStaticMarkup(<ResumePanel jobId="synthetic" applicationId={null} revision={null} editable resume={null} />);
    expect(html).not.toContain("Cancel interrupted upload");
    expect(html).not.toContain("Save your draft to enable résumé upload");
    expect(html).toContain("file:bg-primary");
  });
});
