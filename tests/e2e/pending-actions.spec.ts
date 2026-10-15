import { expect, test } from "@playwright/test";

test("sign-in reports a delayed submission and permits retry after failure", async ({
  page,
}) => {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email", { exact: true }).fill("not-an-email");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in$/);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeEnabled();
  await page.getByLabel("Email", { exact: true }).fill("missing@example.test");

  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requests = 0;
  await page.route("**/auth/sign-in*", async (route) => {
    if (route.request().method() === "POST") {
      requests += 1;
      await gate;
    }
    await route.continue();
  });

  try {
    const submit = page.getByRole("button", { name: "Sign in", exact: true });
    await submit.click({ noWaitAfter: true });
    const pending = page.getByRole("button", { name: "Signing in…" });
    await expect(pending).toBeDisabled();
    await expect(page.getByRole("status")).toContainText("Signing in");
    await pending.evaluate((button) => (button as HTMLButtonElement).click());
    expect(requests).toBe(1);
  } finally {
    release();
  }

  await expect(page).toHaveURL(/\/auth\/sign-in\?error=credentials$/);
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeEnabled();
});

test("sign-in retains native submission without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  try {
    const page = await context.newPage();
    await page.goto("/auth/sign-in");
    await page
      .getByLabel("Email", { exact: true })
      .fill("missing@example.test");
    await page.getByLabel("Password", { exact: true }).fill("wrong-password");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/auth\/sign-in\?error=credentials$/);
    await expect(page.getByRole("button", { name: "Sign in" })).toBeEnabled();
  } finally {
    await context.close();
  }
});
