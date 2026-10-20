import { expect, it } from "vitest";
import { parseHRApplicationFilterParams } from "@/lib/hr-application-search";

it.each(["2junk", "2.9", "1e2", "-1", "0", "9007199254740993", ["2", "3"]])(
  "uses page one for malformed or unsafe page %j",
  (page) => expect(parseHRApplicationFilterParams({ page }).page).toBe(1),
);
it.each(["1", "2", "19"])("preserves valid page %s", (page) => {
  expect(parseHRApplicationFilterParams({ page }).page).toBe(Number(page));
});
