import type { Market } from '../types';

export const MARKET_CONFIG: Record<Market, { label: string; currency: string; symbol: string }> = {
  CN: { label: 'A股', currency: 'CNY', symbol: '¥' },
  HK: { label: '港股', currency: 'HKD', symbol: 'HK$' },
  US: { label: '美股', currency: 'USD', symbol: '$' },
};

export const CURRENCY_RATES: Record<string, number> = {
  CNY: 1,
  HKD: 0.92,
  USD: 7.24,
};

export const STORAGE_KEYS = {
  STOCKS: 'portfolio_stocks',
  THEME: 'portfolio_theme',
  HISTORY: 'portfolio_history',
  PROFILES: 'portfolio_profiles',
  ACTIVE_PROFILE: 'portfolio_active_profile',
};

export const INDUSTRY_LIST = [
  '科技',
  '金融',
  '医药',
  '消费',
  '能源',
  '房地产',
  '工业',
  '材料',
  '公用事业',
  '通信',
  '可选消费',
  '必需消费',
  '其他',
];
