create extension if not exists pg_net;

create table if not exists public.optional_verification_dispatches (
  user_id uuid primary key,
  requested_at timestamptz not null default now()
);

create table if not exists public.internal_runtime_secrets (
  name text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.optional_verification_dispatches enable row level security;
alter table public.internal_runtime_secrets enable row level security;

-- Keep this table private to the backend only.
revoke all on table public.optional_verification_dispatches from anon, authenticated;
revoke all on table public.internal_runtime_secrets from anon, authenticated;

create or replace function public.enqueue_optional_email_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  project_url text := current_setting('app.settings.supabase_url', true);
  internal_secret text := current_setting('app.settings.optional_verify_internal_secret', true);
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

  -- Deduplicate event replays/retries.
  if inserted_user_id is null then
    return new;
  end if;

  -- Optional fallback for environments that provide Supabase Vault.
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

  -- Default fallback for hosted environments without Vault/GUC privileges.
  if internal_secret is null then
    select value
      into internal_secret
    from public.internal_runtime_secrets
    where name = 'OPTIONAL_VERIFY_INTERNAL_SECRET'
    limit 1;
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

drop trigger if exists trg_enqueue_optional_email_verification on auth.users;

create trigger trg_enqueue_optional_email_verification
after insert on auth.users
for each row
execute function public.enqueue_optional_email_verification();
