const { chromium } = require("playwright");

const scenarios = [
  { name: "home-dark-desktop", path: "/", width: 1440, height: 1000, dark: true },
  { name: "home-light-desktop", path: "/", width: 1440, height: 1000, dark: false },
  { name: "home-mobile-menu-dark", path: "/", width: 390, height: 844, dark: true, menu: true },
  { name: "home-mobile-demo-editor-dark", path: "/", width: 390, height: 844, dark: true, demoEditor: true },
  { name: "docs-dark-desktop", path: "/docs", width: 1440, height: 1000, dark: true },
  { name: "docs-light-mobile", path: "/docs", width: 390, height: 844, dark: false },
  { name: "blog-list-dark-desktop", path: "/blog", width: 1440, height: 1000, dark: true },
  { name: "blog-post-light-desktop", path: "/blog", width: 1440, height: 1000, dark: false, blogPost: true },
  { name: "privacy-dark-desktop", path: "/legal/privacy", width: 1440, height: 1000, dark: true },
  { name: "terms-light-desktop", path: "/legal/terms", width: 1440, height: 1000, dark: false },
];

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/ms-playwright/chromium-1208/chrome-linux64/chrome",
    args: ["--no-sandbox"],
  });

  const results = [];

  for (const scenario of scenarios) {
    const context = await browser.newContext({
      viewport: { width: scenario.width, height: scenario.height },
      colorScheme: scenario.dark ? "dark" : "light",
    });
    const page = await context.newPage();

    await page.goto(`http://lander:8000${scenario.path}`, { waitUntil: "networkidle" });

    if (scenario.dark) {
      await page.evaluate(() => document.documentElement.classList.add("dark"));
    } else {
      await page.evaluate(() => document.documentElement.classList.remove("dark"));
    }

    if (scenario.menu) {
      await page.getByRole("button", { name: /open main menu/i }).click();
    }

    if (scenario.demoEditor) {
      await page.locator("#demo").scrollIntoViewIfNeeded();
      await page.getByRole("button", { name: /editor/i }).click();
    }

    if (scenario.blogPost) {
      await page.locator("article").first().click();
    }

    await page.waitForTimeout(500);

    const bodyText = (await page.locator("body").innerText()).slice(0, 240).replace(/\s+/g, " ");
    const h1 = await page.locator("h1").first().textContent().catch(() => "");
    const title = await page.title();
    const url = page.url();

    await page.screenshot({ path: `/out/${scenario.name}.png`, fullPage: true });
    results.push({ name: scenario.name, title, h1, url, bodyText });
    await context.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
