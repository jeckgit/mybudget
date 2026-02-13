create table if not exists public.internal_runtime_secrets (
  name text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.internal_runtime_secrets enable row level security;
revoke all on table public.internal_runtime_secrets from anon, authenticated;

create or replace function public.enqueue_optional_email_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  project_url text;
  internal_secret text;
  request_id bigint;
  inserted_user_id uuid;
begin
  if new.email is null then
    return new;
  end if;

  insert into public.optional_verification_dispatches (user_id)
  values (new.id)
  on conflict (user_id) do nothing
  returning user_id into inserted_user_id;

  if inserted_user_id is null then
    return new;
  end if;

  -- Primary source (works in hosted projects): internal private table
  select value into project_url
  from public.internal_runtime_secrets
  where name = 'OPTIONAL_VERIFY_PROJECT_URL'
  limit 1;

  select value into internal_secret
  from public.internal_runtime_secrets
  where name = 'OPTIONAL_VERIFY_INTERNAL_SECRET'
  limit 1;

  -- Optional fallback: custom DB settings (if available)
  if project_url is null then
    project_url := current_setting('app.settings.supabase_url', true);
  end if;

  if internal_secret is null then
    internal_secret := current_setting('app.settings.optional_verify_internal_secret', true);
  end if;

  -- Optional fallback: vault (if available)
  if internal_secret is null and to_regclass('vault.decrypted_secrets') is not null then
    begin
      execute $sql$
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'OPTIONAL_VERIFY_INTERNAL_SECRET'
        order by created_at desc
        limit 1
      $sql$
      into internal_secret;
    exception
      when others then
        raise warning '[enqueue_optional_email_verification] vault lookup failed: %', sqlerrm;
    end;
  end if;

  if project_url is null or internal_secret is null then
    raise warning '[enqueue_optional_email_verification] missing config project_url=% internal_secret_set=%',
      project_url,
      (internal_secret is not null);
    return new;
  end if;

  select net.http_post(
    url := project_url || '/functions/v1/send-optional-verification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-secret', internal_secret
    ),
    body := jsonb_build_object(
      'user_id', new.id::text,
      'email', new.email
    )
  ) into request_id;

  return new;
exception
  when others then
    raise warning '[enqueue_optional_email_verification] failed for user %: %', new.id, sqlerrm;
    return new;
end;
$$;
