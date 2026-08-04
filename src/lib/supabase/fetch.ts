const SUPABASE_REQUEST_TIMEOUT_MS = 15_000;

/**
 * Supabase's default fetch can wait for the platform timeout when a network,
 * DNS, or firewall problem prevents a response. Authentication forms should
 * fail clearly instead of remaining in a permanent pending state.
 */
export async function fetchSupabase(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const controller = new AbortController();
  const upstreamSignal = init?.signal;

  const abortFromUpstream = () => controller.abort(upstreamSignal?.reason);
  if (upstreamSignal?.aborted) abortFromUpstream();
  else upstreamSignal?.addEventListener("abort", abortFromUpstream, { once: true });

  const timeout = setTimeout(
    () => controller.abort(new Error("Supabase request timed out")),
    SUPABASE_REQUEST_TIMEOUT_MS,
  );

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
    upstreamSignal?.removeEventListener("abort", abortFromUpstream);
  }
}
