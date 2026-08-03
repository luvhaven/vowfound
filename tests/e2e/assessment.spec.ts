import { test, expect, type Page } from "@playwright/test";

/** Answers whatever the current question is, then continues. */
async function answerCurrentQuestion(page: Page) {
  const radios = page.locator('input[type="radio"]');
  const checkboxes = page.locator('input[type="checkbox"]:not([disabled])');
  const textarea = page.locator("textarea");
  const textInput = page.locator('input[type="text"], input[type="email"]');

  if (await radios.count()) {
    await radios.first().click({ force: true });
  } else if (await checkboxes.count()) {
    const count = Math.min(3, await checkboxes.count());
    for (let i = 0; i < count; i += 1) {
      await checkboxes.nth(i).click({ force: true });
    }
  } else if (await textarea.count()) {
    await textarea.fill(
      "I kept choosing people who were not actually available, and I avoided asking myself why that felt comfortable.",
    );
  } else if (await textInput.count()) {
    const type = await textInput.first().getAttribute("type");
    await textInput.first().fill(type === "email" ? "e2e@example.com" : "Ada");
  }

  await page.getByRole("button", { name: /continue|readiness map/i }).click();
}

test("the save-the-date hero typesets a date and carries it into the assessment", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("radio", { name: "Within 6 months" })).toBeVisible();
  await page.getByRole("radio", { name: "Within 6 months" }).click();

  // The month typesets and the day count resolves.
  await expect(page.getByText(/days from today/i)).toBeVisible();

  const cta = page.locator('a[href="/assessment?timeline=6m"]');
  await expect(cta).toBeVisible();
  await cta.click();

  // The choice persists into the assessment, so question one is already done.
  await expect(page).toHaveURL(/\/assessment/);
  await expect(
    page.getByRole("heading", { name: "When do you want to be married?" }),
  ).toHaveCount(0);
});

test("a full assessment completes and produces a readiness map", async ({
  page,
}) => {
  test.slow();
  await page.goto("/assessment");

  // The final answer navigates, and the runner shows an interim state while
  // it does. Drive off the presence of the button rather than the URL, which
  // lags behind the click.
  for (let i = 0; i < 40; i += 1) {
    const advance = page.getByRole("button", {
      name: /continue|readiness map/i,
    });
    if (!(await advance.isVisible().catch(() => false))) break;
    await answerCurrentQuestion(page);
    await page.waitForTimeout(120);
  }

  await page.waitForURL(/\/assessment\/results/, { timeout: 20_000 });

  // Eight dimensions can be scanned, then opened without an aggregate score.
  await expect(page.getByRole("tab")).toHaveCount(8);
  await expect(page.getByRole("heading", { name: "Clarity of intent" })).toBeVisible();

  const opennessTab = page.getByRole("tab", {
    name: /Openness to feedback/i,
  });
  await opennessTab.click();
  await expect(opennessTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "Openness to feedback" })).toBeVisible();

  await page.getByRole("button", { name: /next dimension/i }).click();
  await expect(page.getByRole("heading", { name: "Clarity of intent" })).toBeVisible();
  await expect(page.getByText(/no single score/i)).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/\d+\s?%\s?(ready|match|compatible)/i);

  // A completed saved run must reopen its map, never render an empty page.
  await page.goto("/assessment");
  await expect(page).toHaveURL(/\/assessment\/results/);
  await expect(page.getByRole("heading", { name: /here is what we see/i })).toBeVisible();
});

test("the assessment resumes where it was left", async ({ page }) => {
  await page.goto("/assessment");
  await answerCurrentQuestion(page);
  await answerCurrentQuestion(page);

  const promptBeforeReload = await page.getByRole("heading").first().textContent();

  await page.reload();

  await expect(page.getByRole("heading").first()).toHaveText(
    promptBeforeReload ?? "",
  );
  await expect(page.getByText(/resumed where you left off/i)).toBeVisible();
});

test("hesitation is not penalised", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "I need help deciding" }).click();

  await expect(page.getByText(/a date we find together/i)).toBeVisible();
  await expect(page.getByText(/timeline deferred/i)).toBeVisible();

  await page.locator('a[href="/assessment?timeline=undecided"]').click();
  await expect(page).toHaveURL(/\/assessment/);
});
