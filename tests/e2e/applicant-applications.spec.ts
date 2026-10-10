import { expect, test } from "@playwright/test";

test("signup rejects different passwords before creating an account", async ({ page }) => {
  await page.goto("/auth/sign-up");
  await expect(page.getByText(/not sent to Gmail/)).toBeVisible();
  const email = `mismatch-${Date.now()}@example.test`;
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("CorrectHorseBattery9!");
  await page.getByLabel("Confirm password", { exact: true }).fill("DifferentHorseBattery9!");
  await page.getByRole("button", { name: "Show password", exact: true }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Hide password", exact: true }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator("p[role=alert]")).toContainText("Passwords do not match");
  await expect(page.getByLabel("Email")).toHaveValue(email);
  await expect(page).toHaveURL(/\/auth\/sign-up$/);
});

test("signup retains the email after a server-side mismatch without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const email = `server-mismatch-${Date.now()}@example.test`;

  await page.goto("http://localhost:3000/auth/sign-up");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("CorrectHorseBattery9!");
  await page.getByLabel("Confirm password", { exact: true }).fill("DifferentHorseBattery9!");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.locator("p[role=alert]")).toContainText("Passwords do not match");
  await expect(page.getByLabel("Email")).toHaveValue(email);
  await context.close();
});

test("verified Applicant saves and submits one frozen application", async ({ page, request }) => {
  test.setTimeout(60_000);
  const email = `applicant-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
  const password = "CorrectHorseBattery9!";

  async function completeRequiredProfile(fullName: string) {
    await expect(page).toHaveURL(/\/profile$/);
    await page.getByLabel("Full name", { exact: true }).fill(fullName);
    await page.getByLabel("Country code", { exact: true }).selectOption("SG");
    await page.getByLabel("Phone number", { exact: true }).fill("91234567");
    await page.getByRole("button", { name: "Save profile", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto("/applications");
    await expect(page.getByRole("heading", { name: "My applications" })).toBeVisible();
  }

  await page.goto("/auth/sign-up");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  await expect(page.getByRole("link", { name: "local mail viewer" })).toHaveAttribute("href", "http://127.0.0.1:54324");

  await page.goto("/auth/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
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
  await completeRequiredProfile("Synthetic Applicant");

  await page.goto("/jobs/00000000-0000-4000-8000-000000000101");
  await page.getByRole("link", { name: "Apply for this role" }).click();
  await page.route("**/api/ai/applicant-draft", async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      jobId: "00000000-0000-4000-8000-000000000101",
      notes: "Completed a synthetic TypeScript project.",
    });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ draft: "AI generated synthetic draft." }) });
  });
  await page.getByLabel("Experience notes").fill("Completed a synthetic TypeScript project.");
  await page.getByRole("button", { name: "Generate draft" }).click();
  await expect(page.getByLabel("Cover letter")).toHaveValue("AI generated synthetic draft.");
  await expect(page.getByRole("status")).toContainText("Check every date, skill, and achievement");
  await expect(page.getByText("Submitted application")).toHaveCount(0);
  await page.unroute("**/api/ai/applicant-draft");
  await page.reload();
  await expect(page.getByLabel("Cover letter")).toHaveValue("");

  await page.getByLabel("Cover letter").fill("First saved draft");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByText("Saved draft", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Cover letter")).toHaveValue("First saved draft");

  await page.getByLabel("Cover letter").fill("Original submitted letter");
  await page.getByLabel("Full name").fill("Synthetic Applicant");
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByText("Submitted application", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Original submission" }).locator("..").getByText("Original submitted letter")).toBeVisible();
  await expect(page.getByText("Original submitted letter", { exact: true })).toHaveCount(1);
  await expect(page.getByLabel("Cover letter")).toHaveCount(0);
  await expect(page.getByText(/Submitted applications are locked\. Contact HR/)).toBeVisible();

  await page.goto("/jobs/00000000-0000-4000-8000-000000000101/apply");
  await expect(page.getByRole("heading", { name: "Application submitted" })).toBeVisible();
  await expect(page.getByLabel("Cover letter")).toHaveCount(0);
  await expect(page.getByText(/Submitted applications are locked\. Contact HR/)).toBeVisible();
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
  await page.getByLabel("Confirm password", { exact: true }).fill(password);
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
  await completeRequiredProfile("Synthetic Applicant Two");
  const deniedResponse = await page.goto(ownApplicationUrl!);
  expect(deniedResponse?.status()).toBe(404);
  await expect(page.getByText("Original submitted letter")).toHaveCount(0);
});
