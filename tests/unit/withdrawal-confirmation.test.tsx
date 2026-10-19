import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/applications/actions", () => ({
  withdrawApplication: vi.fn(),
}));

import { WithdrawalConfirmation } from "@/components/withdrawal-control";

describe("withdrawal confirmation copy", () => {
  it("explains that reapplying is possible while the role remains open", () => {
    const html = renderToStaticMarkup(
      createElement(WithdrawalConfirmation, {
        applicationId: "synthetic-application",
        action: () => {},
        pending: false,
        message: null,
        onCancel: () => {},
      }),
    );
    const visibleText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

    expect(visibleText).toContain("You cannot reopen this submission");
    expect(visibleText).toContain(
      "you can start a new application while the job is still published and open",
    );
  });
});
