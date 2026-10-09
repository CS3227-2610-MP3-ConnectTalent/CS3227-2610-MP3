import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { HrAiSummarySections } from "@/components/hr-ai-summary";

describe("HR AI summary text rendering", () => {
  it("renders script-like model strings as escaped text", () => {
    const markup = "<script>window.compromised=true</script>";
    const html = renderToStaticMarkup(<HrAiSummarySections summary={{
      evidence_mentioned: [markup],
      requirements_not_addressed: [],
      follow_up_questions: [],
    }} />);

    expect(html).toContain("&lt;script&gt;window.compromised=true&lt;/script&gt;");
    expect(html).not.toContain("<script>");
  });
});
