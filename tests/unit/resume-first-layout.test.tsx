import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
vi.mock("@/app/applications/actions", () => ({ updateApplication: vi.fn() }));
vi.mock("@/app/profile/actions", () => ({ saveProfile: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
import { ApplicationForm } from "@/components/application-form";
import { ProfileForm } from "@/components/profile-form";
it("offers resume inside a fresh application after experience and before AI", () => {
 const html=renderToStaticMarkup(<ApplicationForm jobId="synthetic" value="" revision={null} submitted={false} email="synthetic@example.test" details={{full_name:null,phone:null,portfolio_url:null,submitted_email:null}} />);
 expect(html).toContain("Choose PDF résumé");
 expect(html.indexOf("Work experience")).toBeLessThan(html.indexOf("Choose PDF résumé"));
 expect(html.indexOf("Choose PDF résumé")).toBeLessThan(html.indexOf("Draft with AI"));
 expect(html).not.toContain("Save your draft to enable");
});
it("offers optional resume on profile", () => {
 const html=renderToStaticMarkup(<ProfileForm email="synthetic@example.test" profile={{full_name:null,phone:null,portfolio_url:null,education:null,work_experience:null}} />);
 expect(html).toContain("Choose PDF résumé");
});
