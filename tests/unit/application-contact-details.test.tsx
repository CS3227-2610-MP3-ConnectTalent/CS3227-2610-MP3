import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ApplicationContactDetails } from "../../src/components/application-contact-details";
describe("frozen contact display", () => {
  it("labels missing legacy fields without fabricating contact data", () => {
    const html = renderToStaticMarkup(createElement(ApplicationContactDetails, { full_name: null, submitted_email: null, phone: null, portfolio_url: null }));
    expect(html.match(/Not provided/g)).toHaveLength(4);
  });
  it("escapes untrusted names and only links safe portfolio schemes", () => {
    const html = renderToStaticMarkup(createElement(ApplicationContactDetails, { full_name: "<script>attack()</script>", submitted_email: "synthetic@example.test", phone: null, portfolio_url: "javascript:alert(1)" }));
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("href=");
  });
});
