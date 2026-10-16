import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

// Run with the built documentation site served at localhost:3002.
const base = new URL("http://localhost:3002/CS3227-2610-MP3/");
const routes = [
  "",
  "docs/UserGuide/",
  "docs/DeveloperGuide/",
  "docs/Reflections/",
  "docs/PaulReflections/",
  "docs/JohnReflections/",
];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));
const internalLinks = new Set();

async function checkRenderedDocuments() {
  for (const route of routes) {
    const response = await page.goto(new URL(route, base).href);
    assert.equal(response.status(), 200, route);
    await page.locator("main h1").first().waitFor();
    if (route === "docs/DeveloperGuide/") {
      await page
        .locator(".docusaurus-mermaid-container svg")
        .waitFor({ state: "attached" });
    }
    const links = await page
      .locator("a[href]")
      .evaluateAll((anchors) => anchors.map((anchor) => anchor.href));
    for (const link of links) {
      const url = new URL(link);
      if (url.origin === base.origin) {
        assert.ok(url.pathname.startsWith(base.pathname), link);
        assert.ok(!url.pathname.endsWith(".md"), link);
        internalLinks.add(link);
      }
    }
  }
}

async function checkInternalTargets() {
  const documents = new Map();
  for (const href of internalLinks) {
    const url = new URL(href);
    const documentUrl = `${url.origin}${url.pathname}`;
    if (!documents.has(documentUrl)) {
      const response = await page.request.get(documentUrl);
      assert.equal(response.status(), 200, documentUrl);
      documents.set(documentUrl, await response.text());
    }
    if (url.hash) {
      const exists = await page.evaluate(
        ({ html, id }) => {
          const parsed = new DOMParser().parseFromString(html, "text/html");
          return Boolean(parsed.getElementById(id));
        },
        {
          html: documents.get(documentUrl),
          id: decodeURIComponent(url.hash.slice(1)),
        },
      );
      assert.ok(exists, `Missing anchor: ${href}`);
    }
  }
}

async function checkLayoutsAndNavigation() {
  await mkdir("test-results/docs92", { recursive: true });
  await page.goto(new URL("docs/UserGuide/", base).href);
  await page
    .getByRole("link", { name: "Developer Guide", exact: true })
    .first()
    .click();
  await page.waitForURL("**/docs/DeveloperGuide/");
  await page.screenshot({
    path: "test-results/docs92/desktop.png",
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  await page.locator(".navbar__toggle").click();
  await page
    .locator(".navbar-sidebar")
    .getByRole("link", { name: "User Guide", exact: true })
    // The docs menu is the second pane; the primary navbar pane is offscreen.
    .last()
    .click();
  await page.waitForURL("**/docs/UserGuide/");
  await page.waitForFunction(
    () => !document.querySelector(".navbar--sidebar-show"),
  );
  await page.screenshot({
    path: "test-results/docs92/mobile.png",
    animations: "disabled",
  });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
}

try {
  await checkRenderedDocuments();
  await checkInternalTargets();
  await checkLayoutsAndNavigation();
  assert.deepEqual(pageErrors, []);
  console.log(
    `${routes.length} rendered documents; ${internalLinks.size} internal links/anchors; desktop/mobile navigation passed.`,
  );
} finally {
  await browser.close();
}
