import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * The parts of this integration that can lose money if they are wrong:
 * signature handling, and the refusal to trust the webhook body for anything
 * financial.
 */

const ORIGINAL = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  process.env.FLUTTERWAVE_SECRET_KEY = "FLWSECK_TEST-fake";
  process.env.FLUTTERWAVE_SECRET_HASH = "a-shared-secret";
});

afterEach(() => {
  process.env = { ...ORIGINAL };
  vi.restoreAllMocks();
});

async function provider() {
  return (await import("@/lib/payments/flutterwave")).flutterwaveProvider;
}

/** A successful /transactions/:id/verify response. */
function verifyResponse(overrides: Record<string, unknown> = {}) {
  return {
    ok: true,
    json: async () => ({
      status: "success",
      data: {
        id: 99,
        tx_ref: "vf-match-abc-123456",
        status: "successful",
        amount: 4500,
        currency: "NGN",
        customer: { email: "member@example.com" },
        ...overrides,
      },
    }),
  } as unknown as Response;
}

const BODY = JSON.stringify({
  event: "charge.completed",
  data: { id: 99, tx_ref: "vf-match-abc-123456", status: "successful" },
});

describe("flutterwave webhook signature", () => {
  it("rejects a missing signature", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    expect(await (await provider()).verifyWebhook(BODY, null)).toBeNull();
    // Nothing should be looked up for an unsigned request.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects a wrong signature", async () => {
    expect(
      await (await provider()).verifyWebhook(BODY, "not-the-secret"),
    ).toBeNull();
  });

  it("rejects everything when no secret hash is configured", async () => {
    delete process.env.FLUTTERWAVE_SECRET_HASH;
    expect(
      await (await provider()).verifyWebhook(BODY, "a-shared-secret"),
    ).toBeNull();
  });

  it("does not throw when the signature length differs from the secret", async () => {
    // timingSafeEqual throws on unequal lengths; hashing both sides first is
    // what stops a length probe from crashing the endpoint.
    await expect(
      (await provider()).verifyWebhook(BODY, "x"),
    ).resolves.toBeNull();
    await expect(
      (await provider()).verifyWebhook(BODY, "x".repeat(500)),
    ).resolves.toBeNull();
  });
});

describe("flutterwave never trusts the webhook body", () => {
  it("re-reads the transaction from the API before reporting success", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(verifyResponse());

    const event = await (await provider()).verifyWebhook(BODY, "a-shared-secret");

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(String(fetchSpy.mock.calls[0][0])).toContain(
      "/transactions/99/verify",
    );
    expect(event?.status).toBe("succeeded");
  });

  it("reports the amount the API states, not the amount in the body", async () => {
    // The body claims nothing about amount; a tampered one would. Either way
    // the figure comes from the verify call.
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      verifyResponse({ amount: 4500 }),
    );

    const event = await (await provider()).verifyWebhook(BODY, "a-shared-secret");
    // Flutterwave quotes major units; we store minor.
    expect(event?.amountMinor).toBe(450000);
    expect(event?.currency).toBe("NGN");
  });

  it("refuses when the verified reference belongs to another transaction", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      verifyResponse({ tx_ref: "vf-someone-else-000000" }),
    );

    expect(
      await (await provider()).verifyWebhook(BODY, "a-shared-secret"),
    ).toBeNull();
  });

  it("marks failed when the API says the charge did not succeed", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      verifyResponse({ status: "failed" }),
    );

    const event = await (await provider()).verifyWebhook(BODY, "a-shared-secret");
    expect(event?.status).toBe("failed");
  });

  it("refuses when the verify call itself fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    expect(
      await (await provider()).verifyWebhook(BODY, "a-shared-secret"),
    ).toBeNull();
  });

  it("survives a network error rather than throwing into the route", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      (await provider()).verifyWebhook(BODY, "a-shared-secret"),
    ).resolves.toBeNull();
  });
});

describe("flutterwave checkout", () => {
  it("sends major units and offers bank transfer first for naira", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ status: "success", data: { link: "https://pay" } }),
    } as unknown as Response);

    const session = await (await provider()).createCheckout({
      productSlug: "match",
      productName: "VowFound Match",
      amountMinor: 120_000_000, // ₦1,200,000
      currency: "NGN",
      email: "member@example.com",
      successUrl: "https://www.vowfound.com/ok",
      cancelUrl: "https://www.vowfound.com/cancel",
    });

    const body = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));
    expect(body.amount).toBe(1_200_000);
    expect(body.currency).toBe("NGN");
    // Card limits are the usual reason a payment this size fails.
    expect(body.payment_options.split(",")[0]).toBe("banktransfer");
    expect(session.url).toBe("https://pay");
    expect(session.reference).toMatch(/^vf-match-/);
  });

  it("issues a distinct reference per attempt", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ status: "success", data: { link: "https://pay" } }),
    } as unknown as Response);

    const p = await provider();
    const request = {
      productSlug: "clarity-audit",
      productName: "The Clarity Audit",
      amountMinor: 6_000_000,
      currency: "NGN" as const,
      email: "a@example.com",
      successUrl: "https://www.vowfound.com/ok",
      cancelUrl: "https://www.vowfound.com/cancel",
    };

    const first = await p.createCheckout(request);
    const second = await p.createCheckout(request);
    expect(first.reference).not.toBe(second.reference);
  });
});

describe("currency routing", () => {
  it("sends both currencies to Flutterwave by default", async () => {
    const { providerFor } = await import("@/lib/payments");
    expect(providerFor("NGN").name).toBe("flutterwave");
    expect(providerFor("USD").name).toBe("flutterwave");
  });

  it("honours a per-currency override", async () => {
    process.env.PAYMENT_PROVIDER_USD = "stripe";
    const { providerFor } = await import("@/lib/payments");
    expect(providerFor("USD").name).toBe("stripe");
    expect(providerFor("NGN").name).toBe("flutterwave");
  });

  it("falls back rather than taking checkout offline on a typo", async () => {
    process.env.PAYMENT_PROVIDER_NGN = "paystakc";
    const { providerFor } = await import("@/lib/payments");
    expect(providerFor("NGN").name).toBe("flutterwave");
  });
});
