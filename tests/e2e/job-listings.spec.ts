import { expect, test } from "@playwright/test";

test("visitors browse published jobs and filter by category", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Software Engineer" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "People Operations Associate" }),
  ).toBeVisible();
  await expect(page.getByText("Legal Counsel")).toHaveCount(0);
  await expect(page.getByText("Product Designer")).toHaveCount(0);

  await page
    .getByRole("navigation", { name: "Filter jobs by category" })
    .getByRole("link", { name: "Engineering" })
    .click();
  await expect(page).toHaveURL(/\?category=engineering$/);
  await expect(
    page.getByRole("heading", { name: "Software Engineer" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "People Operations Associate" }),
  ).toHaveCount(0);

  await page.getByRole("link", { name: /Software Engineer/ }).click();
  await expect(
    page.getByRole("heading", { name: "Software Engineer" }),
  ).toBeVisible();
  await expect(
    page.getByText("Digital Products", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "About the role" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Requirements" }),
  ).toBeVisible();
});

test("draft and closed job IDs do not reveal their details", async ({
  page,
}) => {
  for (const id of [
    "00000000-0000-4000-8000-000000000104",
    "00000000-0000-4000-8000-000000000105",
  ]) {
    await page.goto(`/jobs/${id}`);
    await expect(
      page.getByRole("heading", { name: "Role not available" }),
    ).toBeVisible();
    await expect(page.getByText("Sample draft posting")).toHaveCount(0);
    await expect(page.getByText("Sample closed posting")).toHaveCount(0);
  }
});

test("invalid category values expose no jobs", async ({ page }) => {
  await page.goto("/?category=unknown");
  await expect(
    page.getByRole("heading", { name: "Unknown category" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Software Engineer" }),
  ).toHaveCount(0);
});
