# Security Guide & Go-Live Checklist

This document outlines the security measures and verification steps for the MySaldo application.

## 🛡️ Database Security (RLS)

The most critical aspect of Supabase security is **Row Level Security (RLS)**.

### Audit Status (as of analysis)
*   **Categories:** ✅ Users can only access their own categories.
*   **Months:** ✅ Users can insert/update/select their own months. (Note: Deletion is currently restricted for everyone).
*   **Profiles:** ✅ Users can only access their own profile.
*   **Transactions:** ✅ Users can only access their own transactions.

### How to Verify RLS
To verify RLS policies in the future, run the following SQL query in the Supabase SQL Editor:

```sql
SELECT
    t.tablename,
    t.rowsecurity AS rls_enabled,
    p.policyname,
    p.cmd AS operation,
    p.roles,
    p.qual AS using_expression,
    p.with_check AS with_check_expression
FROM
    pg_tables t
LEFT JOIN
    pg_policies p ON t.tablename = p.tablename
WHERE
    t.schemaname = 'public'
ORDER BY
    t.tablename, p.policyname;
```

**Checklist:**
1.  Ensure `rls_enabled` is `true` for all tables.
2.  Ensure every table has policies covering SELECT, INSERT, UPDATE, DELETE (or explicit omissions).
3.  Ensure `using_expression` and `with_check_expression` contain `auth.uid() = user_id` (or equivalent logic).

## 🔑 Environment Variables

*   **`SUPABASE_URL`**: Your project URL.
*   **`SUPABASE_KEY`**: This must be the **ANON** (public) key.
    *   ⚠️ **NEVER** use the `service_role` key in your client-side application or build process.
    *   The `service_role` key bypasses RLS and gives full admin access.

## 📦 Dependency Security

*   Regularly run `pnpm audit` to check for vulnerabilities.
*   Update dependencies using `pnpm update`.

## 🐳 Docker Security

*   The container runs as a non-root user (`node`) to minimize privilege escalation risks.
*   Ensure your host environment does not expose the container's ports unnecessarily (use a reverse proxy like Traefik, as configured).

## 🚀 Pre-Flight Checklist

- [ ] Run `pnpm audit` and resolve high-severity issues.
- [ ] Verify `SUPABASE_KEY` is the Anon key.
- [ ] Run the SQL RLS audit script to confirm policies are active.
- [ ] Ensure `docker-stack.yml` uses the latest secure image.
