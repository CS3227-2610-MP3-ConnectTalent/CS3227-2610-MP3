import { expect, test } from "@playwright/test";

test("text search combines with category and clear keeps the category", async ({
  page,
}) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Search open roles" });
  await search.fill("software");
  await expect(page).toHaveURL(/q=software/);
  await expect(
    page.getByRole("heading", { name: "Software Engineer", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "People Operations Associate" }),
  ).toHaveCount(0);
  await expect(search).toBeFocused();
  await page
    .getByRole("navigation", { name: "Filter jobs by category" })
    .getByRole("link", { name: "Sales", exact: true })
    .click();
  await expect(page).toHaveURL(/category=sales&q=software/);
  await expect(
    page.getByRole("heading", { name: "No matching roles" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Clear search", exact: true }).click();
  await expect(page).toHaveURL(/\?category=sales$/);
  await expect(search).toHaveValue("");
  await expect(
    page.getByRole("heading", {
      name: "Sales Operations Analyst",
      exact: true,
    }),
  ).toBeVisible();
});

test("explicit Search, All roles, refresh and back/forward restore filters", async ({
  page,
}) => {
  await page.goto("/?category=engineering");
  const search = page.getByRole("searchbox", { name: "Search open roles" });
  await search.fill("typescript");
  await search.press("Enter");
  await expect(page).toHaveURL(/category=engineering&q=typescript/);
  await page.getByRole("link", { name: "All roles", exact: true }).click();
  await expect(page).toHaveURL(/\?q=typescript$/);
  await expect(search).toHaveValue("typescript");
  await page.goBack();
  await expect(page).toHaveURL(/category=engineering&q=typescript/);
  await expect(search).toHaveValue("typescript");
  await page.goBack();
  await expect(page).toHaveURL(/\?category=engineering$/);
  await expect(search).toHaveValue("");
  await page.goForward();
  await expect(search).toHaveValue("typescript");
  await page.reload();
  await expect(search).toHaveValue("typescript");
  await expect(
    page.getByRole("heading", { name: "Software Engineer", exact: true }),
  ).toBeVisible();
});

test("debounce replaces history and composition waits until completed", async ({
  page,
}) => {
  await page.goto("/?category=engineering");
  const search = page.getByRole("searchbox", { name: "Search open roles" });
  const before = await page.evaluate(() => history.length);
  await search.dispatchEvent("compositionstart");
  await search.fill("software");
  await page.waitForTimeout(450);
  await expect(page).toHaveURL(/\?category=engineering$/);
  await search.dispatchEvent("compositionend");
  await expect(page).toHaveURL(/q=software/);
  expect(await page.evaluate(() => history.length)).toBe(before);
  await search.fill("typescript");
  await expect(page).toHaveURL(/q=typescript/);
  expect(await page.evaluate(() => history.length)).toBe(before);
  await expect(search).toBeFocused();
});

test("a delayed older response cannot replace a newer Search", async ({
  page,
}) => {
  await page.goto("/");
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (
      url.searchParams.get("q") === "software" &&
      url.searchParams.has("_rsc")
    )
      await gate;
    await route.continue();
  });
  const oldRequest = page.waitForRequest(
    (request) => new URL(request.url()).searchParams.get("q") === "software",
  );
  const search = page.getByRole("searchbox", { name: "Search open roles" });
  await search.fill("software");
  await oldRequest;
  await search.fill("recruitment");
  await search.press("Enter");
  await expect(page).toHaveURL(/q=recruitment/);
  release();
  await page.waitForTimeout(500);
  await expect(search).toHaveValue("recruitment");
  await expect(page).toHaveURL(/q=recruitment/);
  await expect(
    page.getByRole("heading", { name: "People Operations Associate" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Software Engineer", exact: true }),
  ).toHaveCount(0);
});

test("invalid and literal queries expose no jobs and Clear repairs the URL", async ({
  page,
}) => {
  await page.goto("/?q=software&q=people");
  await expect(page.getByRole("alert")).toContainText("Use one search phrase");
  await expect(page.locator("a.job-card")).toHaveCount(0);
  await page.getByRole("link", { name: "Clear search", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("a.job-card").first()).toBeVisible();
  await page.goto("/?q=%25");
  await expect(
    page.getByRole("heading", { name: "No matching roles" }),
  ).toBeVisible();
  await page.goto("/?q=Legal%20Counsel");
  await expect(page.locator("a.job-card")).toHaveCount(0);
  await page.goto("/?q=Product%20Designer");
  await expect(page.locator("a.job-card")).toHaveCount(0);
});

test("mobile keyboard search keeps controls visible and announces results", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Search open roles" });
  await search.fill("accessible");
  await search.press("Enter");
  await expect(
    page.getByRole("status").filter({ hasText: "role available" }),
  ).toBeVisible();
  await expect(search).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Search", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("native GET Search works without JavaScript and preserves category", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  try {
    const page = await context.newPage();
    await page.goto("/?category=engineering");
    await page
      .getByRole("searchbox", { name: "Search open roles" })
      .fill("typescript");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    const url = new URL(page.url());
    expect(url.searchParams.get("q")).toBe("typescript");
    expect(url.searchParams.get("category")).toBe("engineering");
    await expect(
      page.getByRole("heading", { name: "Software Engineer", exact: true }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});
