const INTERNAL_SECRET = Deno.env.get('OPTIONAL_VERIFY_INTERNAL_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const APP_URL_RAW = Deno.env.get('OPTIONAL_VERIFY_APP_URL') || Deno.env.get('SITE_URL');
const APP_URL = APP_URL_RAW?.replace(/\/+$/, '');
const VERIFY_REDIRECT_URL = Deno.env.get('OPTIONAL_VERIFY_REDIRECT_URL') || `${APP_URL}/confirm?verify=1`;

const RECENT_REQUESTS = new Map<string, number>();
const DEDUPE_WINDOW_MS = 60_000;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });

const pruneRecent = () => {
  const now = Date.now();
  for (const [key, ts] of RECENT_REQUESTS.entries()) {
    if (now - ts > DEDUPE_WINDOW_MS) {
      RECENT_REQUESTS.delete(key);
    }
  }
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  if (!INTERNAL_SECRET || !SUPABASE_URL || !SERVICE_ROLE_KEY || !APP_URL) {
    console.error('[send-optional-verification] missing required environment variables');
    return json(500, { error: 'Server misconfigured' });
  }

  const providedSecret = req.headers.get('x-internal-secret');
  if (providedSecret !== INTERNAL_SECRET) {
    return json(403, { error: 'Forbidden' });
  }

  let payload: { user_id?: string; email?: string };
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: 'Invalid JSON payload' });
  }

  const userId = payload.user_id?.trim();
  const email = payload.email?.trim();
  if (!userId || !email) {
    return json(400, { error: 'Missing user_id or email' });
  }

  pruneRecent();
  const now = Date.now();
  const seenAt = RECENT_REQUESTS.get(userId);
  if (seenAt && now - seenAt < DEDUPE_WINDOW_MS) {
    return json(202, { status: 'deduped' });
  }
  RECENT_REQUESTS.set(userId, now);

  const otpResponse = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      email,
      create_user: false,
      data: {},
      gotrue_meta_security: {},
      redirect_to: VERIFY_REDIRECT_URL
    })
  });

  if (!otpResponse.ok) {
    const body = await otpResponse.text();
    console.error('[send-optional-verification] auth otp failed', {
      status: otpResponse.status,
      body,
      userId,
      email
    });
    return json(502, { error: 'OTP send failed' });
  }

  return json(200, { status: 'sent', redirect: VERIFY_REDIRECT_URL });
});
