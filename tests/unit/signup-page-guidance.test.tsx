import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/auth/sign-up/sign-up-form", () => ({
  SignUpForm: () => <form aria-label="Signup form" />,
}));
import SignUp from "@/app/auth/sign-up/page";

afterEach(() => vi.unstubAllEnvs());
describe("signup verification guidance", () => {
  it.each(["http://127.0.0.1:54321", "https://synthetic.supabase.co"])(
    "keeps user guidance free of local testing details: %s",
    async (url) => {
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
      const html = renderToStaticMarkup(
        await SignUp({ searchParams: Promise.resolve({}) }),
      );
      expect(html).toContain("Create an Applicant account");
      expect(html).toContain("verification link before you can sign in");
      expect(html).toContain("Signup form");
      expect(html).not.toContain("Local testing");
      expect(html).not.toContain("54324");
      expect(html).not.toContain("Gmail");
    },
  );
});
