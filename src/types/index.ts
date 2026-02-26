export type Market = 'CN' | 'HK' | 'US';

export interface Stock {
  id: string;
  code: string;
  name: string;
  market: Market;
  buyPrice: number;
  quantity: number;
  buyDate: string;
  currentPrice: number;
  lastUpdated: string;
  industry?: string;
  currency?: string;
}

export interface StockWithCalculated extends Stock {
  marketValue: number;
  profit: number;
  profitRate: number;
  costValue: number;
}

export interface PortfolioSummary {
  totalCost: number;
  totalMarketValue: number;
  totalProfit: number;
  totalProfitRate: number;
  stockCount: number;
  profitStocks: number;
  lossStocks: number;
}

export interface HistoryRecord {
  date: string;
  totalMarketValue: number;
}

export interface IndustryDistribution {
  name: string;
  value: number;
  children?: IndustryDistribution[];
}

export type Theme = 'light' | 'dark';

export type ChartType = 'pie' | 'bar' | 'line' | 'treemap';

export type ExportFormat = 'json' | 'csv';

export interface Profile {
  id: string;
  name: string;
}

export interface StockFormProps {
  onSubmit: (stock: Omit<Stock, 'id' | 'lastUpdated'>) => void;
  onCancel?: () => void;
  initialData?: Stock;
  isEditing?: boolean;
}

export interface StockListProps {
  stocks: StockWithCalculated[];
  onEdit: (stock: Stock) => void;
  onDelete: (id: string) => void;
  onRefreshPrice: (id: string) => void;
}

export interface ChartsProps {
  stocks: StockWithCalculated[];
  summary: PortfolioSummary;
  history: HistoryRecord[];
}

export interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
}

export interface BarChartProps {
  data: Array<{
    name: string;
    profit: number;
    profitRate: number;
  }>;
}

export interface LineChartProps {
  data: HistoryRecord[];
}

export interface TreeMapProps {
  data: IndustryDistribution[];
}

export interface FormState {
  code: string;
  name: string;
  market: Market;
  buyPrice: string;
  quantity: string;
  buyDate: string;
  currentPrice: string;
  industry: string;
}

export interface FormErrors {
  code?: string;
  name?: string;
  market?: string;
  buyPrice?: string;
  quantity?: string;
  buyDate?: string;
  currentPrice?: string;
  industry?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface StockPriceInfo {
  price: number;
  name: string;
  change: number;
  changePercent: number;
  currency: string;
}
