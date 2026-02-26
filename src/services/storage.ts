import type { Stock, Theme, HistoryRecord, Profile } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * 本地存储服务，用于管理应用数据的持久化
 */
export const storageService = {
  /**
   * 获取所有配置文件
   */
  getProfiles(): Profile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('加载配置文件失败:', error);
    }
    // 默认返回一个主账户
    return [{ id: 'default', name: '主账户' }];
  },

  /**
   * 保存配置文件列表
   */
  saveProfiles(profiles: Profile[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    } catch (error) {
      console.error('保存配置文件失败:', error);
    }
  },

  /**
   * 获取当前激活的配置文件ID
   */
  getActiveProfileId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE) || 'default';
  },

  /**
   * 设置当前激活的配置文件ID
   */
  setActiveProfileId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, id);
  },

  /**
   * 获取特定配置文件的存储键
   */
  getProfileKey(baseKey: string, profileId: string): string {
    return profileId === 'default' ? baseKey : `${baseKey}_${profileId}`;
  },

  /**
   * 保存股票列表到本地存储
   * @param stocks 股票列表
   * @param profileId 配置文件ID
   */
  saveStocks(stocks: Stock[], profileId: string = 'default'): void {
    try {
      const key = this.getProfileKey(STORAGE_KEYS.STOCKS, profileId);
      localStorage.setItem(key, JSON.stringify(stocks));
    } catch (error) {
      console.error('保存股票数据失败:', error);
    }
  },

  /**
   * 从本地存储加载股票列表
   * @param profileId 配置文件ID
   * @returns 股票列表
   */
  loadStocks(profileId: string = 'default'): Stock[] {
    try {
      const key = this.getProfileKey(STORAGE_KEYS.STOCKS, profileId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('加载股票数据失败:', error);
      return [];
    }
  },

  /**
   * 保存主题设置到本地存储
   * @param theme 主题类型 (light/dark)
   */
  saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.error('保存主题设置失败:', error);
    }
  },

  /**
   * 从本地存储加载主题设置
   * @returns 主题类型
   */
  loadTheme(): Theme {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    return (theme as Theme) || 'light';
  },

  /**
   * 保存历史记录到本地存储
   * @param history 历史记录列表
   * @param profileId 配置文件ID
   */
  saveHistory(history: HistoryRecord[], profileId: string = 'default'): void {
    try {
      const key = this.getProfileKey(STORAGE_KEYS.HISTORY, profileId);
      localStorage.setItem(key, JSON.stringify(history));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  },

  /**
   * 从本地存储加载历史记录
   * @param profileId 配置文件ID
   * @returns 历史记录列表
   */
  loadHistory(profileId: string = 'default'): HistoryRecord[] {
    try {
      const key = this.getProfileKey(STORAGE_KEYS.HISTORY, profileId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('加载历史记录失败:', error);
      return [];
    }
  },

  /**
   * 删除特定配置文件的所有数据
   */
  deleteProfileData(profileId: string): void {
    if (profileId === 'default') return; // 不允许删除默认账户的数据键，或者可以清空
    localStorage.removeItem(this.getProfileKey(STORAGE_KEYS.STOCKS, profileId));
    localStorage.removeItem(this.getProfileKey(STORAGE_KEYS.HISTORY, profileId));
  },

  /**
   * 清除所有本地存储数据
   */
  clearAll(): void {
    // 清除所有相关的键
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith(STORAGE_KEYS.STOCKS) || 
        key.startsWith(STORAGE_KEYS.HISTORY) || 
        key === STORAGE_KEYS.THEME ||
        key === STORAGE_KEYS.PROFILES ||
        key === STORAGE_KEYS.ACTIVE_PROFILE
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },
};

/**
 * 导出股票数据为 JSON 文件
 * @param stocks 股票列表
 */
export function exportToJSON(stocks: Stock[]): void {
  const data = JSON.stringify(stocks, null, 2);
  downloadFile(data, `portfolio-${getDateString()}.json`, 'application/json');
}

/**
 * 导出股票数据为 CSV 文件
 * @param stocks 股票列表
 */
export function exportToCSV(stocks: Stock[]): void {
  const headers = ['代码', '名称', '市场', '买入价格', '持仓数量', '买入日期', '当前价格', '行业', '货币'];
  const rows = stocks.map(s => [
    s.code,
    s.name,
    s.market,
    s.buyPrice,
    s.quantity,
    s.buyDate,
    s.currentPrice,
    s.industry || '',
    s.currency || '',
  ]);
  
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `portfolio-${getDateString()}.csv`, 'text/csv');
}

function downloadFile(data: Blob | string, filename: string, mimeType: string): void {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getDateString(): string {
  return new Date().toISOString().split('T')[0].replace(/-/g, '');
}

/**
 * 解析导入的文件内容
 * @param content 文件内容
 * @param format 文件格式 (json/csv)
 * @returns 解析后的股票列表
 */
export function parseImportFile(content: string, format: 'json' | 'csv'): Stock[] {
  if (format === 'json') {
    return parseJSON(content);
  } else {
    return parseCSV(content);
  }
}

/**
 * 解析 JSON 格式的导入数据
 * @param content JSON 字符串
 * @returns 股票列表
 */
function parseJSON(content: string): Stock[] {
  const data = JSON.parse(content);
  if (!Array.isArray(data)) {
    throw new Error('JSON格式错误：数据必须是数组');
  }
  return data.filter(validateStock);
}

/**
 * 解析 CSV 格式的导入数据
 * @param content CSV 字符串
 * @returns 股票列表
 */
function parseCSV(content: string): Stock[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    return [];
  }
  
  const stocks: Stock[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 7) {
      const stock: Stock = {
        id: generateId(),
        code: parts[0].trim(),
        name: parts[1].trim(),
        market: (parts[2].trim() as 'CN' | 'HK' | 'US') || 'CN',
        buyPrice: parseFloat(parts[3]) || 0,
        quantity: parseInt(parts[4], 10) || 0,
        buyDate: parts[5].trim(),
        currentPrice: parseFloat(parts[6]) || 0,
        industry: parts[7]?.trim() || '',
        currency: parts[8]?.trim() || 'CNY',
        lastUpdated: new Date().toISOString(),
      };
      if (validateStock(stock)) {
        stocks.push(stock);
      }
    }
  }
  return stocks;
}

/**
 * 验证股票数据是否合法
 * @param stock 股票数据对象
 * @returns 是否合法
 */
function validateStock(stock: Partial<Stock>): boolean {
  if (!stock.code || !stock.market) return false;
  if (!stock.buyPrice || stock.buyPrice <= 0) return false;
  if (!stock.quantity || stock.quantity <= 0) return false;
  if (!stock.buyDate) return false;
  return true;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
