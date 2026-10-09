import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`public and account layouts remain usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const [name, path] of [["careers", "/"], ["job", "/jobs/00000000-0000-4000-8000-000000000101"], ["signup", "/auth/sign-up"], ["signin", "/auth/sign-in"]]) {
      await page.goto(path);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Account" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      if (name === "careers") {
        // Synthetic DOM-only text probes wrapping without changing stored job data.
        await page.locator(".job-card-panel").first().evaluate((card) => {
          card.querySelector("h3")!.textContent = "LongTitle".repeat(20);
          card.querySelector("p")!.textContent = "LongTeam".repeat(15);
        });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        await page.reload();
        await expect(page.getByRole("navigation", { name: "Account" })).toBeVisible();
      }
      const phase = process.env.UI_CAPTURE_PHASE === "before" ? "before" : "after";
      await page.screenshot({ path: `test-results/ui-${phase}/${name}-${width}.png`, fullPage: true });
    }
    await page.goto("/");
    await page.getByRole("navigation", { name: "Filter jobs by category" }).getByRole("link", { name: "Engineering" }).focus();
    await expect(page.getByRole("navigation", { name: "Filter jobs by category" }).getByRole("link", { name: "Engineering" })).toBeFocused();
    expect(await page.getByRole("navigation", { name: "Filter jobs by category" }).getByRole("link", { name: "Engineering" }).evaluate((link) => {
      const style = getComputedStyle(link);
      return style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) > 0;
    })).toBe(true);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/category=engineering/);
  });
}
