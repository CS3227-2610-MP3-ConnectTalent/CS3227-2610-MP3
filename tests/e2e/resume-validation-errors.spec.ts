import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import {
  cleanupResumeFirstFixture,
  createResumeFirstFixture,
  seedResumeFirstFixture,
} from "./support/resume-first-profile-fixture";

const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(!key, "Requires local synthetic admin fixtures.");

async function choose(page: Page, name: string) {
  await page.getByLabel("Choose PDF résumé").setInputFiles({
    name,
    mimeType: "application/pdf",
    buffer: await readFile(`tests/fixtures/pdf/${name}`),
  });
}

async function verifyEncryptionMessages(page: Page) {
  await page.goto("/profile");
  await page
    .getByLabel("Full name", { exact: true })
    .fill("Unsaved name retained");
  await choose(page, "aes-256-open.pdf");
  await page
    .getByRole("button", { name: "Upload résumé", exact: true })
    .click();
  const download = page.getByRole("link", {
    name: "Download résumé: aes-256-open.pdf",
  });
  await expect(download).toBeVisible();
  expect(await (await page.request.get("/api/profile/resume")).body()).toEqual(
    await readFile("tests/fixtures/pdf/aes-256-open.pdf"),
  );
  await choose(page, "aes-256-password.pdf");
  const response = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/profile/resume") &&
      r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Upload résumé", exact: true })
    .click();
  expect((await response).status()).toBe(422);
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "This PDF requires a password to open." }),
  ).toBeVisible();
  await expect(download).toBeVisible();
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Unsaved name retained",
  );
}

async function verifyOutageFeedback(page: Page) {
  await choose(page, "aes-128-open.pdf");
  await page.route(
    "**/api/profile/resume",
    (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          code: "RESUME_VALIDATOR_UNAVAILABLE",
          error:
            "PDF checking is temporarily unavailable. Your file has not been saved. Try again later.",
        }),
      }),
    { times: 1 },
  );
  await page
    .getByRole("button", { name: "Upload résumé", exact: true })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "PDF checking is temporarily unavailable." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Download résumé: aes-256-open.pdf" }),
  ).toBeVisible();
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Unsaved name retained",
  );
  await page
    .getByRole("button", { name: "Upload résumé", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Download résumé: aes-128-open.pdf" }),
  ).toBeVisible();
}

test("encrypted upload, password error and simulated outage retain attachment and fields", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const admin = createClient("http://127.0.0.1:54321", key!, {
    auth: { persistSession: false },
  });
  const fixture = await createResumeFirstFixture();
  try {
    await seedResumeFirstFixture(admin, fixture, key!);
    await page.goto("/auth/sign-in");
    await page.getByLabel("Email").fill(fixture.emails[0]);
    await page.getByLabel("Password", { exact: true }).fill(fixture.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/applications$/);
    await verifyEncryptionMessages(page);
    await verifyOutageFeedback(page);
  } finally {
    await cleanupResumeFirstFixture(admin, fixture);
  }
});
