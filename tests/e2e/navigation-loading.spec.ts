import { expect, test } from "@playwright/test";

test("a delayed Search marks only its button busy and newer filters still win", async ({
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
      url.pathname === "/" &&
      url.searchParams.get("q") === "software" &&
      !url.searchParams.has("category") &&
      url.searchParams.has("_rsc")
    )
      await gate;
    await route.continue();
  });
  try {
    const request = page.waitForRequest((item) => {
      const url = new URL(item.url());
      return (
        url.searchParams.get("q") === "software" && url.searchParams.has("_rsc")
      );
    });
    const search = page.getByRole("searchbox", { name: "Search open roles" });
    await search.fill("software");
    await search.press("Enter");
    await request;
    await expect(
      page.getByRole("button", { name: "Searching…" }),
    ).toBeDisabled();
    await expect(search).toBeEnabled();
    await expect(
      page.getByRole("status").filter({ hasText: "Updating roles" }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Filter jobs by category" })
      .getByRole("link", { name: "Sales", exact: true })
      .click();
    await expect(page).toHaveURL(/category=sales&q=software/);
    await expect(
      page.getByRole("heading", { name: "No matching roles" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Search" })).toBeEnabled();
  } finally {
    release();
  }
});

test("a delayed Apply link announces its navigation and preserves its destination", async ({
  page,
}) => {
  await page.goto("/");
  const jobHref = await page.locator("a.job-card").first().getAttribute("href");
  expect(jobHref).toBeTruthy();
  await page.goto(jobHref!);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/apply") && url.searchParams.has("_rsc"))
      await gate;
    await route.continue();
  });
  try {
    const apply = page.getByRole("link", { name: /Apply for this role/ });
    await expect(apply).toHaveAttribute("href", /\/jobs\/[^/]+\/apply$/);
    const request = page.waitForRequest((item) => {
      const url = new URL(item.url());
      return url.pathname.endsWith("/apply") && url.searchParams.has("_rsc");
    });
    await apply.click();
    await request;
    await expect(apply.getByRole("status")).toHaveText("Opening application…");
  } finally {
    release();
  }
  await expect(page).toHaveURL(/\/auth\/sign-in/);
});

test("a delayed Back to open roles link announces its navigation", async ({
  page,
}) => {
  await page.goto("/");
  const jobHref = await page.locator("a.job-card").first().getAttribute("href");
  expect(jobHref).toBeTruthy();
  await page.goto(jobHref!);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/" && url.searchParams.has("_rsc")) await gate;
    await route.continue();
  });
  try {
    const back = page.getByRole("link", { name: /Back to open roles/ });
    await expect(back).toHaveAttribute("href", "/");
    await back.click();
    await expect(back.getByRole("status")).toHaveText("Opening roles…");
  } finally {
    release();
  }
  await expect(page).toHaveURL(/\/$/);
});

test("a failed return RSC request falls back to document navigation", async ({
  page,
}) => {
  await page.goto("/");
  const jobHref = await page.locator("a.job-card").first().getAttribute("href");
  expect(jobHref).toBeTruthy();
  await page.goto(jobHref!);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/" && url.searchParams.has("_rsc")) {
      await gate;
      await route.abort("failed");
      return;
    }
    await route.continue();
  });
  const back = page.getByRole("link", { name: /Back to open roles/ });
  try {
    await back.click();
    await expect(back.getByRole("status")).toHaveText("Opening roles…");
  } finally {
    release();
  }
  await expect(page).toHaveURL(/\/$/);
  await expect(back).toHaveCount(0);
});
