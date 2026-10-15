import { expect, test } from "@playwright/test";

test("shared cursor styles cover native choice/file and button-like controls", async ({
  page,
}) => {
  await page.goto("/auth/sign-in");
  // Exercise the global stylesheet with isolated native controls, without
  // changing application data or submitting an actual form.
  await page.evaluate(() => {
    const fixture = document.createElement("div");
    fixture.id = "cursor-fixture";
    fixture.innerHTML = `
      <select id="choice"><option>Choice</option></select>
      <input id="checkbox" type="checkbox">
      <input id="radio" type="radio">
      <input id="file" type="file">
      <input id="submit" type="submit">
      <div id="action" role="button" tabindex="0">Action</div>
      <a id="disabled-link" href="/" aria-disabled="true">Disabled link</a>
      <button id="aria-disabled" aria-disabled="true">Disabled action</button>
      <button id="data-disabled" data-disabled>Disabled primitive</button>`;
    document.body.append(fixture);
  });
  for (const id of ["choice", "checkbox", "radio", "submit", "action"])
    await expect(page.locator(`#${id}`)).toHaveCSS("cursor", "pointer");
  expect(
    await page
      .locator("#file")
      .evaluate(
        (input) => getComputedStyle(input, "::file-selector-button").cursor,
      ),
  ).toBe("pointer");
  for (const id of ["disabled-link", "aria-disabled", "data-disabled"])
    await expect(page.locator(`#${id}`)).toHaveCSS("cursor", "not-allowed");
});

test("job details have one top return link with keyboard access", async ({
  page,
}) => {
  await page.goto("/jobs/00000000-0000-4000-8000-000000000101");
  const main = page.getByRole("main");
  const back = main.getByRole("link", { name: "Back to open roles" });
  await expect(back).toHaveCount(1);
  await expect(back).toHaveAttribute("href", "/");
  await expect(
    main.getByRole("link", { name: "All roles", exact: true }),
  ).toHaveCount(0);
  expect(await back.evaluate((link) => !link.previousElementSibling)).toBe(
    true,
  );
  await back.focus();
  await expect(back).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/$/);
});

test("enabled actions have hand cursors while text and disabled controls do not", async ({
  page,
}) => {
  await page.goto("/auth/sign-in");
  const signIn = page.getByRole("button", { name: "Sign in", exact: true });
  await expect(signIn).toHaveCSS("cursor", "pointer");
  await expect(
    page.getByRole("link", { name: "Create account", exact: true }).first(),
  ).toHaveCSS("cursor", "pointer");
  await expect(page.getByLabel("Email", { exact: true })).toHaveCSS(
    "cursor",
    "text",
  );
  await signIn.evaluate((button) => {
    (button as HTMLButtonElement).disabled = true;
  });
  await expect(signIn).toHaveCSS("cursor", "not-allowed");
  await page.evaluate(() => {
    const fieldset = document.createElement("fieldset");
    fieldset.disabled = true;
    fieldset.innerHTML =
      '<button id="fieldset-action">Disabled fieldset action</button>';
    document.body.append(fieldset);
  });
  await expect(page.locator("#fieldset-action")).toHaveCSS(
    "cursor",
    "not-allowed",
  );
});
