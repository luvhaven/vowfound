import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { settleOrder } from "@/lib/orders.server";

function sameSecret(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Flutterwave webhook. The hash proves the sender; settleOrder then re-asks
 *  Flutterwave about the transaction, so the body itself is never trusted. */
export async function POST(request: Request) {
  const expected = process.env.FLUTTERWAVE_SECRET_HASH;
  const got = request.headers.get("verif-hash") ?? "";
  if (!expected || !sameSecret(got, expected)) return NextResponse.json({ ok: false }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { data?: { id?: number; tx_ref?: string } } | null;
  const id = body?.data?.id;
  const txRef = body?.data?.tx_ref;
  if (!id || !txRef) return NextResponse.json({ ok: true });

  try {
    await settleOrder(txRef, id);
  } catch (error) {
    console.error("[webhook] settle failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
