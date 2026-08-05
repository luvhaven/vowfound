import { test, expect } from "@playwright/test";

test.describe("currency", () => {
  test("outside Nigeria there is no naira price and no way to reach one", async ({
    page,
  }) => {
    await page.goto("/checkout/clarity-audit");

    const body = page.locator("body");
    await expect(body).toContainText("$79");
    await expect(body).not.toContainText("₦");

    // Local pricing is not an option anyone may opt into.
    await expect(
      page.getByRole("button", { name: /switch to naira/i }),
    ).toHaveCount(0);
  });

  test("a forged currency cookie does not buy local pricing", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "vf_currency",
        value: "NGN",
        url: "http://127.0.0.1:3100",
      },
    ]);

    await page.goto("/checkout/clarity-audit");
    await expect(page.locator("body")).toContainText("$79");
    await expect(page.locator("body")).not.toContainText("₦");
  });

  test("inside Nigeria naira is offered, and only one currency shows", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      extraHTTPHeaders: { "x-debug-country": "NG" },
    });
    const page = await context.newPage();

    await page.goto("/checkout/clarity-audit");
    const body = page.locator("body");
    await expect(body).toContainText("₦60,000");
    await expect(body).not.toContainText("$79");

    await page.getByRole("button", { name: /switch to dollars/i }).click();
    await expect(body).toContainText("$79");
    await expect(body).not.toContainText("₦");

    await context.close();
  });
});

test.describe("pricing discipline", () => {
  test("the site never opens with a price", async ({ page }) => {
    // The rule is that price does not lead — not that it is hidden. Someone
    // who has decided should be able to find and pay a fee.
    await page.goto("/");
    const hero = page.locator("section").first();
    await expect(hero).not.toContainText(/[₦$]\s?\d/);
    await expect(page.locator("header")).not.toContainText(/[₦$]\s?\d/);
  });

  test("every page that shows a price also offers a way to pay it", async ({
    page,
  }) => {
    // /plans once quoted ₦60,000 above a button that went to the assessment.
    // The buyer saw a price and could not pay it.
    for (const path of ["/plans"]) {
      await page.goto(path);
      const body = await page.locator("body").innerText();
      const priced = /[₦$]\s?[\d,]{2,}/.test(body);

      if (priced) {
        const checkoutLinks = page.locator('a[href^="/checkout/"]');
        expect(
          await checkoutLinks.count(),
          `${path} shows a price but links to no checkout`,
        ).toBeGreaterThan(0);
      }
    }
  });

  test("a buyer who already knows what they want can reach checkout", async ({
    page,
  }) => {
    await page.goto("/plans");
    const buy = page.locator('a[href="/checkout/clarity-audit"]').first();
    await expect(buy).toBeVisible();
    await buy.click();

    await expect(page).toHaveURL(/\/checkout\/clarity-audit/);
    // The checkout must state what is being bought, for how much.
    await expect(page.locator("body")).toContainText(/clarity audit/i);
    await expect(page.locator("body")).toContainText(/[₦$]\s?[\d,]{2,}/);
  });

  test("service pages give a convinced reader somewhere to go", async ({
    page,
  }) => {
    for (const path of ["/coaching", "/matchmaking"]) {
      await page.goto(path);
      const toFees = page.locator('a[href^="/plans#"]');
      expect(
        await toFees.count(),
        `${path} offers no route to the fee`,
      ).toBeGreaterThan(0);
    }
  });
});

test.describe("the guarantee", () => {
  test("states the work, never the outcome", async ({ page }) => {
    await page.goto("/plans");
    const guarantee = page.getByText(/complete every milestone/i);
    await expect(guarantee).toBeVisible();
    await expect(page.locator("body")).toContainText(
      /we guarantee the work, not the outcome/i,
    );
  });
});

test.describe("private routes", () => {
  test("send a signed-out visitor to sign in and are never indexed", async ({
    page,
    request,
  }) => {
    // The noindex header rides on the redirect itself, so it has to be read
    // without following it — page.goto() would report the sign-in response.
    const raw = await request.get("/account", { maxRedirects: 0 });
    expect(raw.status()).toBe(307);
    expect(raw.headers()["x-robots-tag"]).toContain("noindex");

    await page.goto("/account");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("robots.txt excludes every private area", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    for (const path of ["/account", "/admin", "/checkout", "/assessment/results"]) {
      expect(body).toContain(path);
    }
  });

  test("the sitemap contains no private route", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    for (const path of ["/account", "/admin", "/checkout", "/results"]) {
      expect(body).not.toContain(path);
    }
  });
});

test.describe("no fabricated proof", () => {
  test("the stories page publishes nothing it cannot stand behind", async ({
    page,
  }) => {
    await page.goto("/stories");
    await expect(page.locator("body")).toContainText(
      /we have not published any yet/i,
    );
    // No invented success rate, member count, or time-to-engagement.
    await expect(page.locator("body")).not.toContainText(
      /\d+%\s+(success|of our clients|married)/i,
    );
  });
});

test.describe("keyboard and reduced motion", () => {
  test("the hero timeline is reachable and operable by keyboard alone", async ({
    page,
  }) => {
    await page.goto("/");
    const firstOption = page.getByRole("radio", { name: "Within 3 months" });
    await firstOption.focus();
    await page.keyboard.press("Space");
    await expect(firstOption).toBeChecked();

    await page.keyboard.press("ArrowRight");
    await expect(
      page.getByRole("radio", { name: "Within 6 months" }),
    ).toBeChecked();
    await expect(page.getByText(/days from today/i)).toBeVisible();
  });

  test("reduced motion still conveys the same information", async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await page.getByRole("radio", { name: "Within 12 months" }).click();
    await expect(page.getByText(/days from today/i)).toBeVisible();
    await expect(
      page.locator('a[href="/assessment?timeline=12m"]'),
    ).toBeVisible();
    await context.close();
  });
});

test.describe("the confirmation page tells the truth", () => {
  test("does not announce success to anyone who guesses the URL", async ({
    page,
  }) => {
    await page.goto("/checkout/ready-in-90/confirmation");
    const body = page.locator("body");
    await expect(body).not.toContainText(/is yours/i);
    await expect(body).not.toContainText(/your place is recorded/i);
    await expect(body).toContainText(/still confirming/i);
  });

  test("cannot be talked into success by a query parameter", async ({
    page,
  }) => {
    // A provider redirect carries status=successful. Trusting it would let
    // anyone confirm their own payment by editing the address bar.
    await page.goto(
      "/checkout/ready-in-90/confirmation?status=successful&tx_ref=made-up&transaction_id=1",
    );
    await expect(page.locator("body")).not.toContainText(/is yours/i);
  });

  test("says plainly when a payment was cancelled, and offers a way through", async ({
    page,
  }) => {
    await page.goto(
      "/checkout/ready-in-90/confirmation?status=cancelled&tx_ref=vf-x&transaction_id=1",
    );
    const body = page.locator("body");
    await expect(body).toContainText(/did not go through/i);
    await expect(body).toContainText(/no money has left your account/i);
    // A failed card at this amount is usually a limit, so transfer is offered.
    await expect(page.locator('a[href^="/contact"]')).toHaveCount(1);
  });

  test("an application confirms without claiming a payment", async ({ page }) => {
    await page.goto("/checkout/private-concierge/confirmation");
    const body = page.locator("body");
    await expect(body).toContainText(/no payment has been taken/i);
    await expect(body).not.toContainText(/still confirming/i);
  });
});

test.describe("checkout is not a dead end", () => {
  test("offers a way back to compare programmes", async ({ page }) => {
    await page.goto("/checkout/ready-in-90");
    await expect(page.locator('a[href="/plans"]').first()).toBeVisible();
  });
});
