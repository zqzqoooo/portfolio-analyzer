import type { Stock, StockWithCalculated, PortfolioSummary, HistoryRecord, IndustryDistribution } from '../types';
import { convertToCNY } from './format';
import { MARKET_CONFIG } from './constants';

/**
 * 计算单只股票的成本、市值、盈亏和盈亏率
 * @param stock 原始股票数据
 * @returns 包含计算结果的股票数据
 */
export function calculateStockData(stock: Stock): StockWithCalculated {
  const costValue = stock.buyPrice * stock.quantity;
  const marketValue = stock.currentPrice * stock.quantity;
  const profit = marketValue - costValue;
  const profitRate = costValue > 0 ? (profit / costValue) * 100 : 0;

  return {
    ...stock,
    costValue,
    marketValue,
    profit,
    profitRate,
  };
}

/**
 * 计算整个投资组合的汇总数据
 * @param stocks 包含计算结果的股票列表
 * @returns 投资组合汇总数据
 */
export function calculatePortfolioSummary(stocks: StockWithCalculated[]): PortfolioSummary {
  if (stocks.length === 0) {
    return {
      totalCost: 0,
      totalMarketValue: 0,
      totalProfit: 0,
      totalProfitRate: 0,
      stockCount: 0,
      profitStocks: 0,
      lossStocks: 0,
    };
  }

  let totalCost = 0;
  let totalMarketValue = 0;
  let profitStocks = 0;
  let lossStocks = 0;

  stocks.forEach(stock => {
    const costInCNY = convertToCNY(stock.costValue, MARKET_CONFIG[stock.market].currency);
    const marketValueInCNY = convertToCNY(stock.marketValue, MARKET_CONFIG[stock.market].currency);
    
    totalCost += costInCNY;
    totalMarketValue += marketValueInCNY;
    
    if (stock.profit >= 0) {
      profitStocks++;
    } else {
      lossStocks++;
    }
  });

  const totalProfit = totalMarketValue - totalCost;
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  return {
    totalCost,
    totalMarketValue,
    totalProfit,
    totalProfitRate,
    stockCount: stocks.length,
    profitStocks,
    lossStocks,
  };
}

/**
 * 获取饼图数据（按市值占比）
 * @param stocks 包含计算结果的股票列表
 * @returns 饼图所需的数据格式
 */
export function getPieChartData(stocks: StockWithCalculated[]): Array<{ name: string; value: number; percentage: number }> {
  const totalMarketValue = stocks.reduce((sum, stock) => {
    return sum + convertToCNY(stock.marketValue, MARKET_CONFIG[stock.market].currency);
  }, 0);

  return stocks.map(stock => {
    const valueInCNY = convertToCNY(stock.marketValue, MARKET_CONFIG[stock.market].currency);
    return {
      name: stock.name || stock.code,
      value: valueInCNY,
      percentage: totalMarketValue > 0 ? (valueInCNY / totalMarketValue) * 100 : 0,
    };
  }).sort((a, b) => b.value - a.value);
}

/**
 * 获取柱状图数据（按盈亏金额）
 * @param stocks 包含计算结果的股票列表
 * @returns 柱状图所需的数据格式
 */
export function getBarChartData(stocks: StockWithCalculated[]): Array<{ name: string; profit: number; profitRate: number }> {
  return stocks.map(stock => ({
    name: stock.name || stock.code,
    profit: convertToCNY(stock.profit, MARKET_CONFIG[stock.market].currency),
    profitRate: stock.profitRate,
  })).sort((a, b) => b.profit - a.profit);
}

/**
 * 获取行业分布数据
 * @param stocks 包含计算结果的股票列表
 * @returns 行业分布数据
 */
export function getIndustryDistribution(stocks: StockWithCalculated[]): IndustryDistribution[] {
  const industryMap = new Map<string, number>();

  stocks.forEach(stock => {
    const industry = stock.industry || '其他';
    const valueInCNY = convertToCNY(stock.marketValue, MARKET_CONFIG[stock.market].currency);
    const currentValue = industryMap.get(industry) || 0;
    industryMap.set(industry, currentValue + valueInCNY);
  });

  return Array.from(industryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * 生成历史记录数据点
 * @param stocks 包含计算结果的股票列表
 * @returns 历史记录数据点
 */
export function generateHistoryRecord(stocks: StockWithCalculated[]): HistoryRecord {
  const totalMarketValue = stocks.reduce((sum, stock) => {
    return sum + convertToCNY(stock.marketValue, MARKET_CONFIG[stock.market].currency);
  }, 0);

  return {
    date: new Date().toISOString().split('T')[0],
    totalMarketValue,
  };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
