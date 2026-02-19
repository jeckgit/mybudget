import { createClient } from '@supabase/supabase-js';

export type SupportedLocale = 'de' | 'en' | 'fr' | 'es';

export const SUBJECTS: Record<SupportedLocale, string> = {
  de: 'Bitte bestaetigen Sie Ihre E-Mail',
  en: 'Please verify your email',
  fr: 'Veuillez verifier votre e-mail',
  es: 'Por favor verifica tu correo'
};

export const COPY: Record<SupportedLocale, { intro: string; cta: string; fallback: string; ignore: string }> = {
  de: {
    intro: 'Willkommen bei MyBudget. Bitte bestätigen Sie Ihre E-Mail-Adresse.',
    cta: 'E-Mail bestätigen',
    fallback: 'Falls der Button nicht funktioniert, verwenden Sie diesen Link:',
    ignore: 'Wenn Sie das nicht angefordert haben, ignorieren Sie diese E-Mail.'
  },
  en: {
    intro: 'Welcome to MyBudget. Please verify your email address.',
    cta: 'Verify email',
    fallback: 'If the button does not work, use this link:',
    ignore: 'If you did not request this, you can ignore this email.'
  },
  fr: {
    intro: 'Bienvenue sur MyBudget. Veuillez verifier votre adresse e-mail.',
    cta: "Verifier l'e-mail",
    fallback: 'Si le bouton ne fonctionne pas, utilisez ce lien :',
    ignore: "Si vous n'etes pas a l'origine de cette demande, ignorez cet e-mail."
  },
  es: {
    intro: 'Bienvenido a MyBudget. Verifica tu direccion de correo electronico.',
    cta: 'Verificar correo',
    fallback: 'Si el boton no funciona, usa este enlace:',
    ignore: 'Si no solicitaste esto, puedes ignorar este correo.'
  }
};

export const normalizeLocale = (raw: string | null | undefined): SupportedLocale => {
  console.log('[AuthMail] Normalizing locale for:', raw);
  if (!raw) return 'en';
  const lower = raw.toLowerCase();
  if (lower.startsWith('de')) return 'de';
  if (lower.startsWith('fr')) return 'fr';
  if (lower.startsWith('es')) return 'es';
  return 'en';
};

export const fetchProfileLocale = async (
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string
): Promise<SupportedLocale> => {
  const url = new URL('/rest/v1/profiles', supabaseUrl);
  url.searchParams.set('select', 'language');
  url.searchParams.set('user_id', `eq.${userId}`);
  url.searchParams.set('limit', '1');

  const response = await fetch(url.toString(), {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    console.error('[AuthMail] fetchProfileLocale failed:', response.status, await response.text());
    return 'en';
  }

  const rows = (await response.json()) as Array<{ language?: string | null }>;
  return normalizeLocale(rows?.[0]?.language ?? null);
};

export const generateVerificationLink = async (
  supabaseUrl: string,
  serviceRoleKey: string,
  email: string,
  redirectTo: string
): Promise<{ actionLink: string | null; error: string | null }> => {
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      type: 'magiclink',
      email,
      redirect_to: redirectTo
    })
  });

  const payload = await response.json().catch(() => ({}) as any);
  const actionLink = payload?.action_link || payload?.properties?.action_link || null;

  if (!response.ok || !actionLink) {
    return {
      actionLink: null,
      error: `generate_link failed (status ${response.status}) ${JSON.stringify(payload)}`
    };
  }

  return { actionLink, error: null };
};

export const sendResendMail = async (
  resendApiKey: string,
  from: string,
  replyTo: string | null,
  email: string,
  actionLink: string,
  locale: SupportedLocale
): Promise<{ error: string | null }> => {
  const copy = COPY[locale] ?? COPY.en;
  const subject = SUBJECTS[locale] ?? SUBJECTS.en;

  const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;max-width:560px;margin:0 auto;padding:24px;">
    <h2 style="margin:0 0 12px;">MyBudget</h2>
    <p style="margin:0 0 16px;">${copy.intro}</p>
    <p style="margin:0 0 20px; text-align: center;">
      <a style="background-color: #3b82f6; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5);" href="${actionLink}" target="_blank" rel="noopener noreferrer">${copy.cta}</a>
    </p>
    <p style="margin:0 0 8px;">${copy.fallback}</p>
    <p style="word-break:break-all;margin:0 0 16px;">${actionLink}</p>
    <p style="margin:0;color:#64748b;font-size:13px;">${copy.ignore}</p>
  </div>`;

  const text = [copy.intro, '', `${copy.cta}: ${actionLink}`, '', copy.ignore].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [email],
      reply_to: replyTo || undefined,
      subject,
      html,
      text
    })
  });

  if (!response.ok) {
    return { error: `resend failed (status ${response.status}) ${await response.text()}` };
  }

  return { error: null };
};
