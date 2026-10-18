import { expect, it } from "vitest";
import { jobSearchUrl, parseJobSearch } from "@/lib/job-search";

it("normalizes whitespace and counts Unicode characters after normalization", () => {
  expect(parseJobSearch(" \tDigital\n Products \r ")).toEqual({
    query: "Digital Products",
    invalid: false,
  });
  expect(parseJobSearch("界".repeat(100)).invalid).toBe(false);
  expect(parseJobSearch("😀".repeat(100)).invalid).toBe(false);
  expect(parseJobSearch("😀".repeat(101)).invalid).toBe(true);
  expect(parseJobSearch(" ".repeat(200))).toEqual({
    query: "",
    invalid: false,
  });
});

it.each([null, 5, ["one", "two"], "a\u0000b", "a\u007fb", "a\u0085b"])(
  "rejects malformed input %j",
  (value) => {
    expect(parseJobSearch(value).invalid).toBe(true);
  },
);

it("encodes literal punctuation into a local URL and retains category", () => {
  const href = jobSearchUrl(" javascript:alert(1) %_&q=other ", "engineering");
  const url = new URL(href, "https://example.test");
  expect(url.pathname).toBe("/");
  expect(url.searchParams.getAll("q")).toEqual([
    "javascript:alert(1) %_&q=other",
  ]);
  expect(url.searchParams.get("category")).toBe("engineering");
  expect(jobSearchUrl(" ")).toBe("/");
});
