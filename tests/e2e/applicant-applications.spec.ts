import { expect, test } from "@playwright/test";

test("signup rejects different passwords before creating an account", async ({ page }) => {
  await page.goto("/auth/sign-up");
  await expect(page.getByText(/not sent to Gmail/)).toBeVisible();
  await page.getByLabel("Email").fill(`mismatch-${Date.now()}@example.test`);
  await page.getByLabel("Password", { exact: true }).fill("CorrectHorseBattery9!");
  await page.getByLabel("Confirm password").fill("DifferentHorseBattery9!");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator("p[role=alert]")).toContainText("Passwords do not match");
  await expect(page).toHaveURL(/\/auth\/sign-up\?error=password-mismatch$/);
});

test("verified Applicant saves, submits, and edits one application", async ({ page, request }) => {
  const email = `applicant-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
  const password = "CorrectHorseBattery9!";

  await page.goto("/auth/sign-up");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  await expect(page.getByRole("link", { name: "local mail viewer" })).toHaveAttribute("href", "http://127.0.0.1:54324");

  await page.goto("/auth/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in\?error=credentials$/);
  await expect(page.locator("p[role=alert]")).toContainText("verify your email");

  let messageId: string | undefined;
  await expect.poll(async () => {
    const response = await request.get("http://127.0.0.1:54324/api/v1/messages");
    const body = await response.json() as { messages: Array<{ ID: string; To: Array<{ Address: string }> }> };
    messageId = body.messages.find((message) => message.To.some((to) => to.Address === email))?.ID;
    return messageId;
  }, { timeout: 15_000 }).toBeTruthy();

  const messageResponse = await request.get(`http://127.0.0.1:54324/api/v1/message/${messageId}`);
  const message = await messageResponse.json() as { Text?: string; HTML?: string };
  const text = `${message.Text ?? ""}\n${message.HTML ?? ""}`.replaceAll("&amp;", "&");
  const confirmationUrl = text.match(/https?:\/\/[^\s<>"']+\/auth\/v1\/verify\?[^\s<>"']+/)?.[0];
  expect(confirmationUrl).toBeTruthy();
  await page.goto(confirmationUrl!);
  await expect(page.getByRole("heading", { name: "My applications" })).toBeVisible();

  await page.goto("/jobs/00000000-0000-4000-8000-000000000101");
  await page.getByRole("link", { name: "Apply for this role" }).click();
  await page.getByLabel("Cover letter").fill("First saved draft");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByText("Saved draft")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Cover letter")).toHaveValue("First saved draft");

  await page.getByLabel("Cover letter").fill("Original submitted letter");
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByText("Submitted application")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Original submission" }).locator("..").getByText("Original submitted letter")).toBeVisible();

  await page.getByLabel("Cover letter").fill("Revised submitted letter");
  await page.getByRole("button", { name: "Save letter changes" }).click();
  await expect(page.getByLabel("Cover letter")).toHaveValue("Revised submitted letter");
  await expect(page.getByRole("heading", { name: "Original submission" }).locator("..").getByText("Original submitted letter")).toBeVisible();
  await page.goto("/applications");
  const ownApplication = page.getByRole("link", { name: /Software Engineer.*Submitted/ });
  await expect(ownApplication).toHaveCount(1);
  const ownApplicationUrl = await ownApplication.getAttribute("href");
  expect(ownApplicationUrl).toBeTruthy();

  await page.getByRole("button", { name: "Sign out" }).click();
  const secondEmail = `applicant-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
  await page.goto("/auth/sign-up");
  await page.getByLabel("Email").fill(secondEmail);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  let secondMessageId: string | undefined;
  await expect.poll(async () => {
    const response = await request.get("http://127.0.0.1:54324/api/v1/messages");
    const body = await response.json() as { messages: Array<{ ID: string; To: Array<{ Address: string }> }> };
    secondMessageId = body.messages.find((message) => message.To.some((to) => to.Address === secondEmail))?.ID;
    return secondMessageId;
  }, { timeout: 15_000 }).toBeTruthy();
  const secondResponse = await request.get(`http://127.0.0.1:54324/api/v1/message/${secondMessageId}`);
  const secondMessage = await secondResponse.json() as { Text?: string; HTML?: string };
  const secondText = `${secondMessage.Text ?? ""}\n${secondMessage.HTML ?? ""}`.replaceAll("&amp;", "&");
  const secondConfirmationUrl = secondText.match(/https?:\/\/[^\s<>"']+\/auth\/v1\/verify\?[^\s<>"']+/)?.[0];
  expect(secondConfirmationUrl).toBeTruthy();
  await page.goto(secondConfirmationUrl!);
  await expect(page.getByRole("heading", { name: "My applications" })).toBeVisible();
  const deniedResponse = await page.goto(ownApplicationUrl!);
  expect(deniedResponse?.status()).toBe(404);
  await expect(page.getByText("Original submitted letter")).toHaveCount(0);
});
