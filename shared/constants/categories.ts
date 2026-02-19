export const DEFAULT_CATEGORIES = [
  { emoji: '🛍️', key: 'shopping', type: 'expense' },
  { emoji: '🍔', key: 'food', type: 'expense' },
  { emoji: '🚗', key: 'transport', type: 'expense' },
  { emoji: '🎬', key: 'entertainment', type: 'expense' },
  { emoji: '☕', key: 'coffee', type: 'expense' },
  { emoji: '🏠', key: 'utilities', type: 'expense' }
] as const;

export const INCOME_CATEGORIES = [
  { emoji: '💰', key: 'salary', type: 'income' },
  { emoji: '🎁', key: 'gift', type: 'income' },
  { emoji: '💸', key: 'refund', type: 'income' },
  { emoji: '🏷️', key: 'sale', type: 'income' }
] as const;
