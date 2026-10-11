import { expect, test } from "@playwright/test";

test("anonymous requests to each AI endpoint are denied", async ({
  request,
}) => {
  const routes = ["/api/ai/applicant-draft", "/api/ai/hr-summary"];

  for (const route of routes) {
    const response = await request.post(route, { data: {} });
    expect(response.status(), `${route} must deny anonymous callers`).toBe(401);
  }
});
