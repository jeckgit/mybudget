export type SupportedLocale = 'en' | 'de' | 'fr' | 'es';

export const normalizeLocale = (input: string | null | undefined): SupportedLocale => {
  if (!input) return 'en';
  const firstPart = input.split('-')[0].toLowerCase();
  if (['en', 'de', 'fr', 'es'].includes(firstPart)) {
    return firstPart as SupportedLocale;
  }
  return 'en';
};

export const sanitizeBaseUrl = (url: string): string => {
  return url.replace(/\/+$/, '');
};
