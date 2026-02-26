import type { Market, StockPriceInfo } from '../types';

const isDev = import.meta.env.DEV;
const API_BASE = isDev ? '/api/qt' : 'https://qt.gtimg.cn';

/**
 * 获取股票实时价格信息
 * @param code 股票代码
 * @param market 市场类型 (CN/HK/US)
 * @returns 股票价格信息
 */
export async function fetchStockPrice(code: string, market: Market): Promise<StockPriceInfo> {
  switch (market) {
    case 'CN':
      return fetchCNStockPrice(code);
    case 'HK':
      return fetchHKStockPrice(code);
    case 'US':
      return fetchUSStockPrice(code);
    default:
      throw new Error('不支持的市场类型');
  }
}

/**
 * 使用 GBK 编码获取数据（腾讯接口返回的是 GBK 编码）
 * @param url 请求地址
 * @returns 解码后的字符串
 */
async function fetchWithGBK(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const decoder = new TextDecoder('gbk');
  return decoder.decode(buffer);
}

/**
 * 获取 A股 股票价格
 * @param code 股票代码
 * @returns 股票价格信息
 */
async function fetchCNStockPrice(code: string): Promise<StockPriceInfo> {
  const market = code.startsWith('6') ? 'sh' : 'sz';
  const url = `${API_BASE}/q=${market}${code}`;
  
  try {
    const text = await fetchWithGBK(url);
    return parseTencentStockData(text, 'CNY');
  } catch (error) {
    throw new Error(`获取A股价格失败: ${error instanceof Error ? error.message : '网络错误'}`);
  }
}

/**
 * 获取 港股 股票价格
 * @param code 股票代码
 * @returns 股票价格信息
 */
async function fetchHKStockPrice(code: string): Promise<StockPriceInfo> {
  const paddedCode = code.padStart(5, '0');
  const url = `${API_BASE}/q=hk${paddedCode}`;
  
  try {
    const text = await fetchWithGBK(url);
    return parseTencentStockData(text, 'HKD');
  } catch (error) {
    throw new Error(`获取港股价格失败: ${error instanceof Error ? error.message : '网络错误'}`);
  }
}

/**
 * 获取 美股 股票价格
 * @param code 股票代码
 * @returns 股票价格信息
 */
async function fetchUSStockPrice(code: string): Promise<StockPriceInfo> {
  const upperCode = code.toUpperCase();
  const url = `${API_BASE}/q=us${upperCode}`;
  
  try {
    const text = await fetchWithGBK(url);
    return parseTencentUSStockData(text);
  } catch (error) {
    throw new Error(`获取美股价格失败: ${error instanceof Error ? error.message : '网络错误'}`);
  }
}

/**
 * 解析腾讯A股/港股接口返回的数据
 * @param text 接口返回的原始文本
 * @param currency 货币类型
 * @returns 解析后的股票价格信息
 */
function parseTencentStockData(text: string, currency: string): StockPriceInfo {
  const match = text.match(/="([^"]*)"/);
  if (!match || !match[1]) {
    throw new Error('无法解析股票数据');
  }
  
  const parts = match[1].split('~');
  if (parts.length < 5) {
    throw new Error('数据格式错误');
  }
  
  const name = parts[1];
  const currentPrice = parseFloat(parts[3]);
  const yesterdayPrice = parseFloat(parts[4]);
  const change = currentPrice - yesterdayPrice;
  const changePercent = yesterdayPrice > 0 ? (change / yesterdayPrice) * 100 : 0;
  
  return {
    name,
    price: currentPrice,
    change,
    changePercent,
    currency,
  };
}

/**
 * 解析腾讯美股接口返回的数据
 * @param text 接口返回的原始文本
 * @returns 解析后的股票价格信息
 */
function parseTencentUSStockData(text: string): StockPriceInfo {
  const match = text.match(/="([^"]*)"/);
  if (!match || !match[1]) {
    throw new Error('无法解析美股数据');
  }
  
  const parts = match[1].split('~');
  if (parts.length < 5) {
    throw new Error('美股数据格式错误');
  }
  
  const name = parts[1];
  const currentPrice = parseFloat(parts[3]);
  const change = parseFloat(parts[4]);
  const changePercent = currentPrice > 0 ? (change / currentPrice) * 100 : 0;
  
  return {
    name,
    price: currentPrice,
    change,
    changePercent,
    currency: 'USD',
  };
}

export function getMarketFromCode(code: string): Market {
  if (/^\d{6}$/.test(code)) {
    return 'CN';
  } else if (/^\d{4,5}$/.test(code)) {
    return 'HK';
  } else if (/^[A-Z]{1,5}$/i.test(code)) {
    return 'US';
  }
  return 'CN';
}
