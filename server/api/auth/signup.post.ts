import { createClient } from '@supabase/supabase-js';
import { runSignupFlow } from '../../utils/signupFlow';
import {
  normalizeLocale,
  fetchProfileLocale,
  generateVerificationLink,
  sendResendMail,
  type SupportedLocale
} from '../../utils/auth-mail';

const sanitizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string; options?: { data?: any } }>(event);
  const email = body?.email ?? '';
  const password = body?.password ?? '';
  const options = body?.options;

  const config = useRuntimeConfig(event);
  const supabaseUrl = config.supabaseUrl as string;
  const supabaseAnonKey = config.supabaseAnonKey as string;
  const supabaseServiceRoleKey = config.supabaseServiceRoleKey as string;
  const resendApiKey = config.supabaseResendApiKey as string;
  const verifyEmailFrom = (config.verifyEmailFrom as string) || 'MyBudget <notifications@zeitnode.com>';
  const verifyEmailReplyTo = (config.verifyEmailReplyTo as string) || null;

  const appBase = sanitizeBaseUrl(config.optionalVerifyAppUrl as string);
  const verifyRedirectUrl = (config.optionalVerifyRedirectUrl as string) || `${appBase}/confirm`;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !verifyRedirectUrl || !resendApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'Server auth/mail configuration is incomplete.' });
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });

  const result = await runSignupFlow(
    { email, password, options },
    {
      signUp: async (targetEmail, targetPassword, signupOptions) => {
        const { data, error } = await authClient.auth.signUp({
          email: targetEmail,
          password: targetPassword,
          options: signupOptions
        });

        return {
          error,
          userId: data.user?.id || null
        };
      },
      sendVerificationEmail: async (targetEmail, userId, language) => {
        console.log('[Signup Debug] Starting sendVerificationEmail for:', targetEmail);

        let locale: SupportedLocale = 'en';
        if (language) {
          locale = normalizeLocale(language);
        } else {
          locale = await fetchProfileLocale(supabaseUrl, supabaseServiceRoleKey, userId);
        }

        const linkResult = await generateVerificationLink(
          supabaseUrl,
          supabaseServiceRoleKey,
          targetEmail,
          verifyRedirectUrl
        );

        if (!linkResult.actionLink) {
          console.error('[Signup Debug] Failed to generate link:', linkResult.error);
          return { error: linkResult.error || 'Missing action link' };
        }

        const mailResult = await sendResendMail(
          resendApiKey,
          verifyEmailFrom,
          verifyEmailReplyTo,
          targetEmail,
          linkResult.actionLink,
          locale
        );

        if (mailResult.error) {
          console.error('[Signup Debug] Resend failed:', mailResult.error);
        }
        return mailResult;
      },
      logger: console
    }
  );

  if (!result.ok) {
    setResponseStatus(event, 400);
  }

  return result;
});
