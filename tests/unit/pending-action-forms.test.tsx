import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  formStatus: vi.fn(() => ({
    pending: true,
    data: null,
    method: "post",
    action: null,
  })),
}));

vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  useFormStatus: mocks.formStatus,
}));
vi.mock("@/app/auth/actions", () => ({ signIn: vi.fn() }));
vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...props }: Record<string, unknown>) =>
      React.createElement("a", { href, ...props }, children as React.ReactNode),
  };
});
vi.mock("@/components/password-input", async () => {
  const React = await import("react");
  return {
    PasswordInput: (props: React.InputHTMLAttributes<HTMLInputElement>) =>
      React.createElement("input", props),
  };
});

import SignIn from "@/app/auth/sign-in/page";
import { JobEditor } from "@/app/hr/jobs/job-editor";
import { HRApplicationActions } from "@/components/hr-application-actions";

beforeEach(() => {
  mocks.formStatus.mockReturnValue({
    pending: true,
    data: null,
    method: "post",
    action: null,
  });
});

it("shows and disables the sign-in action while its form is pending", async () => {
  const html = renderToStaticMarkup(
    await SignIn({ searchParams: Promise.resolve({}) }),
  );
  expect(html).toContain("Signing in…");
  expect(html).toMatch(/<button[^>]*\sdisabled=""/);
  expect(html).toContain('role="status"');
});

it("keeps the sign-in button usable and quiet when idle", async () => {
  mocks.formStatus.mockReturnValue({
    pending: false,
    data: null,
    method: "post",
    action: null,
  });
  const html = renderToStaticMarkup(
    await SignIn({ searchParams: Promise.resolve({}) }),
  );
  expect(html).toContain(">Sign in</button>");
  expect(html).not.toMatch(/<button[^>]*\sdisabled=""/);
  expect(html).toMatch(/<span[^>]*role="status"[^>]*><\/span>/);
});

it("marks separate HR action forms with their own pending labels", () => {
  const edit = renderToStaticMarkup(<JobEditor action={async () => {}} />);
  expect(edit).toContain("Saving draft…");
  expect(edit).toMatch(/<button[^>]*\sdisabled=""/);

  const review = renderToStaticMarkup(
    <HRApplicationActions
      application={
        {
          id: "synthetic-application",
          review_revision: 1,
        } as React.ComponentProps<typeof HRApplicationActions>["application"]
      }
      notes={[]}
      events={[]}
      editable
    />,
  );
  expect(review).toContain("Adding note…");
  expect(review).toContain("Updating status…");
  expect((review.match(/<button[^>]*\sdisabled=""/g) ?? []).length).toBe(2);
});
