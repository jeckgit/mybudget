export interface Category {
  id: string;
  emoji: string;
  name: string;
  key?: string; // Translation key for default categories (e.g., 'shopping', 'food')
  type?: 'income' | 'expense';
  user_id?: string;
}
export interface FixedCostItem {
  id: string;
  label: string;
  amount: number;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string; // ISO date string
  note?: string;
  category: string; // Category ID
}

export interface BudgetConfig {
  monthlyLimit: number;
  currency: string;
  onboardingComplete: boolean;
  language?: string;
  theme?: string;
  income?: number;
  fixedCosts?: number;
  fixedCostDetails?: FixedCostItem[];
}

export interface DailyStats {
  date: string;
  spent: number;
  dailyLimit: number; // The calculated limit for this specific day
  isUnderBudget: boolean;
}

export interface MonthData {
  budget?: number | null;
  income?: number | null;
  data?: any; // JSONB data
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  months?: Record<string, MonthData>;
  config: BudgetConfig;
}

// ViewState removed as we use Nuxt routing now
