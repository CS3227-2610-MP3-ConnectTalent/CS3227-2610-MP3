import { expect, test, type Page } from "@playwright/test";

const presentationPages = [
  ["careers", "/"],
  ["job", "/jobs/00000000-0000-4000-8000-000000000101"],
  ["signup", "/auth/sign-up"],
  ["signin", "/auth/sign-in"],
] as const;

for (const width of [390, 1440]) {
  test(`public and account layouts remain usable at ${width}px`, async ({
    page,
  }) => checkPresentationAtWidth(page, width));
}

async function checkPresentationAtWidth(page: Page, width: number) {
  await page.setViewportSize({ width, height: 1000 });
  for (const [name, path] of presentationPages)
    await inspectPresentationPage(page, name, path, width);
  await checkCategoryKeyboardAccess(page);
}

async function inspectPresentationPage(
  page: Page,
  name: string,
  path: string,
  width: number,
) {
  await page.goto(path);
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Account" })).toBeVisible();
  await expectNoHorizontalOverflow(page, width);
  if (name === "careers") await checkLongTextWrapping(page, width);
  await capturePage(page, name, width);
}

async function checkLongTextWrapping(page: Page, width: number) {
  await page
    .locator(".job-card-panel")
    .first()
    .evaluate((card) => {
      card.querySelector("h3")!.textContent = "LongTitle".repeat(20);
      card.querySelector("p")!.textContent = "LongTeam".repeat(15);
    });
  await expectNoHorizontalOverflow(page, width);
  await page.reload();
  await expect(page.getByRole("navigation", { name: "Account" })).toBeVisible();
}

async function expectNoHorizontalOverflow(page: Page, width: number) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(width);
}

async function capturePage(page: Page, name: string, width: number) {
  const phase = process.env.UI_CAPTURE_PHASE === "before" ? "before" : "after";
  await page.screenshot({
    path: `test-results/ui-${phase}/${name}-${width}.png`,
    fullPage: true,
  });
}

async function checkCategoryKeyboardAccess(page: Page) {
  await page.goto("/");
  const category = page
    .getByRole("navigation", { name: "Filter jobs by category" })
    .getByRole("link", { name: "Engineering" });
  await category.focus();
  await expect(category).toBeFocused();
  expect(
    await category.evaluate((link) => {
      const style = getComputedStyle(link);
      return (
        style.outlineStyle !== "none" &&
        Number.parseFloat(style.outlineWidth) > 0
      );
    }),
  ).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/category=engineering/);
}
