import { serverSupabaseUser } from '#supabase/server';
import {
  fetchProfileLocale,
  generateVerificationLink,
  sendResendMail,
  normalizeLocale,
  type SupportedLocale
} from '../../utils/auth-mail';

const sanitizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const supabaseUrl = config.supabaseUrl as string;
  const supabaseServiceRoleKey = config.supabaseServiceRoleKey as string;
  const resendApiKey = (config.supabaseResendApiKey as string) || (config.resendApiKey as string);
  const verifyEmailFrom = (config.verifyEmailFrom as string) || 'MyBudget <notifications@zeitnode.com>';
  const verifyEmailReplyTo = (config.verifyEmailReplyTo as string) || null;

  const appBase = sanitizeBaseUrl(config.optionalVerifyAppUrl as string);
  const verifyRedirectUrl = (config.optionalVerifyRedirectUrl as string) || `${appBase}/confirm`;

  if (!supabaseUrl || !supabaseServiceRoleKey || !verifyRedirectUrl || !resendApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'Server auth/mail configuration is incomplete.' });
  }

  // Identify user from server-side session
  const user = await serverSupabaseUser(event);

  if (!user || !user.email) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized or missing email.' });
  }

  // If user is already verified, we don't need to resend
  if (user.email_confirmed_at) {
    return { ok: true, message: 'Email already verified.' };
  }

  try {
    const body = await readBody<{ language?: string }>(event);
    console.log('[Resend Debug] Starting resend for:', user.email, 'requested language:', body?.language);

    // 1. Get Locale (priority: passed language, user metadata, profile lookup)
    let locale: SupportedLocale = 'en';
    if (body?.language) {
      locale = normalizeLocale(body.language);
    } else if (user.user_metadata?.language) {
      locale = normalizeLocale(user.user_metadata.language);
    } else {
      locale = await fetchProfileLocale(supabaseUrl, supabaseServiceRoleKey, user.id);
    }

    console.log('[Resend Debug] Resolved locale:', locale);

    // 2. Generate Link
    const linkResult = await generateVerificationLink(
      supabaseUrl,
      supabaseServiceRoleKey,
      user.email,
      verifyRedirectUrl
    );

    if (!linkResult.actionLink) {
      console.error('[Resend Debug] Failed to generate link:', linkResult.error);
      throw new Error(linkResult.error || 'Failed to generate verification link.');
    }

    // 3. Send Email
    const mailResult = await sendResendMail(
      resendApiKey,
      verifyEmailFrom,
      verifyEmailReplyTo,
      user.email,
      linkResult.actionLink,
      locale
    );

    if (mailResult.error) {
      console.error('[Resend Debug] Resend failed:', mailResult.error);
      throw new Error(mailResult.error);
    }

    console.log('[Resend Debug] Custom verification email sent successfully.');
    return { ok: true, message: 'Verification email resent.' };
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Internal server error during resend.'
    });
  }
});
