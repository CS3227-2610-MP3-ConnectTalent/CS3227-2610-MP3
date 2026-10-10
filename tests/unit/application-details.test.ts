import { describe, expect, it } from "vitest";
import { parseApplicationDetails } from "../../src/lib/application-details";
const valid = { full_name: "Synthetic Applicant", phone: "+6591234567", portfolio_url: null };
describe("application identity and contact validation", () => {
  it("allows incomplete drafts but requires a name when submitting", () => {
    expect(parseApplicationDetails({ ...valid, full_name: "" }, "draft").success).toBe(true);
    expect(parseApplicationDetails({ ...valid, full_name: " " }, "submit").success).toBe(false);
    expect(parseApplicationDetails({ ...valid, full_name: "\u00a0\u2003" }, "submit").success).toBe(false);
  });
  it("normalizes whitespace and absent optional values", () => {
    expect(parseApplicationDetails({ full_name: "  Synthetic Applicant  ", phone: "+6591234567", portfolio_url: " " }, "submit").data)
      .toEqual(valid);
  });
  it.each([
    { full_name: "x".repeat(121) }, { full_name: "Name\nInjected" },
    { phone: "x".repeat(41) }, { phone: "123\t456" },
    { portfolio_url: "https://999.999.999.999." }, { portfolio_url: "https://0x999999999." },
    { portfolio_url: "https://%" }, { portfolio_url: "https://999.999.999.999" },
    { portfolio_url: "http://@example.test" }, { portfolio_url: "https://0x999999999" },
    { portfolio_url: "javascript:alert(1)" }, { portfolio_url: "https://user:secret@example.test" },
    { portfolio_url: "http://" }, { portfolio_url: "https://example.test/" + "x".repeat(2048) },
    { portfolio_url: "https://example.test/\npath" }, { portfolio_url: "//example.test" },
  ])("rejects invalid contact fields %j", (change) => {
    expect(parseApplicationDetails({ ...valid, ...change }, "draft").success).toBe(false);
  });
  it("accepts a safe empty port consistently with the database", () => {
    expect(parseApplicationDetails({ ...valid, portfolio_url: "https://example.test:" }, "submit").success).toBe(true);
  });
  it("allows normalized international phone and bounded HTTP(S) URLs", () => {
    expect(parseApplicationDetails({ ...valid, phone: "+6591234567", portfolio_url: "https://example.test/projects?a=1" }, "submit").success).toBe(true);
  });
});
