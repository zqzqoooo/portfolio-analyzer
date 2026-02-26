import { CURRENCY_RATES, MARKET_CONFIG } from './constants';
import type { Market } from '../types';

/**
 * 格式化货币显示
 * @param value 金额
 * @param market 市场类型，默认为 A股(CN)
 * @returns 带有货币符号的格式化字符串
 */
export function formatCurrency(value: number, market: Market = 'CN'): string {
  const symbol = MARKET_CONFIG[market].symbol;
  return `${symbol}${Math.abs(value).toLocaleString('zh-CN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })}`;
}

/**
 * 格式化价格
 * @param value 价格
 * @param _market 市场类型
 * @returns 保留3位小数的价格字符串
 */
export function formatPrice(value: number, _market: Market = 'CN'): string {
  return value.toFixed(3);
}

/**
 * 格式化数字
 * @param value 数字
 * @param decimals 小数位数，默认为3
 * @returns 格式化后的数字字符串
 */
export function formatNumber(value: number, decimals: number = 3): string {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 格式化百分比
 * @param value 百分比数值
 * @returns 带有正负号和%的字符串
 */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(3)}%`;
}

/**
 * 格式化日期
 * @param dateStr 日期字符串
 * @returns YYYY/MM/DD 格式的日期字符串
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * 格式化日期和时间
 * @param dateStr 日期时间字符串
 * @returns YYYY/MM/DD HH:mm 格式的日期时间字符串
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 转换为人民币
 * @param value 金额
 * @param fromCurrency 源货币代码
 * @returns 转换后的人民币金额
 */
export function convertToCNY(value: number, fromCurrency: string): number {
  const rate = CURRENCY_RATES[fromCurrency] || 1;
  return value * rate;
}

/**
 * 获取货币符号
 * @param market 市场类型
 * @returns 货币符号
 */
export function getCurrencySymbol(market: Market): string {
  return MARKET_CONFIG[market].symbol;
}

/**
 * 获取市场标签
 * @param market 市场类型
 * @returns 市场显示名称
 */
export function getMarketLabel(market: Market): string {
  return MARKET_CONFIG[market].label;
}
