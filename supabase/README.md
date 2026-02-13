# Supabase setup for optional email verification after signup

This project uses a server-side Supabase flow to send email verification links after signup while keeping login optional.

## What is included

- Edge Function: `send-optional-verification`
- SQL migration: `20260213130000_optional_signup_verification_trigger.sql`

Flow:

1. Frontend calls `signUp(...)` only.
2. DB trigger on `auth.users` calls the Edge Function.
3. Edge Function calls Supabase Auth `POST /auth/v1/otp` with `create_user: false` and redirect to `/confirm?verify=1`.

## Required Auth setting

In Supabase Auth settings, keep **Confirm email = OFF**.

- `ON` would enforce verification before password login.
- `OFF` keeps verification optional.

## Required secrets

Set these for the Edge Function runtime:

- `OPTIONAL_VERIFY_INTERNAL_SECRET`: shared secret between DB trigger and function
- `OPTIONAL_VERIFY_APP_URL`: app base URL (e.g. `https://your-app.com`)
- `OPTIONAL_VERIFY_REDIRECT_URL` (optional): full redirect URL, e.g. `https://your-app.com/confirm?verify=1`
- `SUPABASE_SERVICE_ROLE_KEY`: provided automatically by Supabase runtime

Example:

```bash
supabase secrets set \
  OPTIONAL_VERIFY_INTERNAL_SECRET="<long-random-secret>" \
  OPTIONAL_VERIFY_APP_URL="https://your-app.com" \
  OPTIONAL_VERIFY_REDIRECT_URL="https://your-app.com/confirm?verify=1"
```

Configure the same secret for Postgres trigger execution.
For hosted projects (recommended path), store it in the internal table:

```sql
insert into public.internal_runtime_secrets (name, value)
values ('OPTIONAL_VERIFY_INTERNAL_SECRET', '<long-random-secret>')
on conflict (name)
do update set value = excluded.value, updated_at = now();

insert into public.internal_runtime_secrets (name, value)
values ('OPTIONAL_VERIFY_PROJECT_URL', 'https://<project-ref>.supabase.co')
on conflict (name)
do update set value = excluded.value, updated_at = now();
```

Optional alternatives:

- If your environment supports Supabase Vault, the trigger can read from `vault.decrypted_secrets`.
- If your environment allows custom DB settings, it can read from `app.settings.optional_verify_internal_secret`.

## Deploy

```bash
supabase db push
supabase functions deploy send-optional-verification --no-verify-jwt
```

## Notes

- Trigger failures are non-blocking: signup remains successful.
- The function validates `x-internal-secret` and rejects unauthorized requests.
- Duplicate trigger events are deduplicated in DB by `optional_verification_dispatches`.
