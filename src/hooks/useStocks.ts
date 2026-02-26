import { useState, useCallback, useEffect } from 'react';
import type { Stock, HistoryRecord, Profile } from '../types';
import { storageService } from '../services/storage';
import { calculateStockData, calculatePortfolioSummary, generateHistoryRecord, generateId } from '../utils/calculator';

/**
 * 自定义 Hook，用于管理股票数据和历史记录状态
 * 提供增删改查及数据计算等功能
 */
export function useStocks() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('default');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // 初始化时从本地存储加载配置文件
  useEffect(() => {
    const loadedProfiles = storageService.getProfiles();
    const loadedActiveId = storageService.getActiveProfileId();
    setProfiles(loadedProfiles);
    setActiveProfileId(loadedActiveId);
  }, []);

  // 当激活的配置文件改变时，加载对应的数据
  useEffect(() => {
    if (activeProfileId) {
      const loadedStocks = storageService.loadStocks(activeProfileId);
      const loadedHistory = storageService.loadHistory(activeProfileId);
      setStocks(loadedStocks);
      setHistory(loadedHistory);
    }
  }, [activeProfileId]);

  // 股票数据变化时自动保存到本地存储
  useEffect(() => {
    if (activeProfileId) {
      storageService.saveStocks(stocks, activeProfileId);
    }
  }, [stocks, activeProfileId]);

  // 历史记录变化时自动保存到本地存储
  useEffect(() => {
    if (activeProfileId) {
      storageService.saveHistory(history, activeProfileId);
    }
  }, [history, activeProfileId]);

  // 配置文件变化时自动保存
  useEffect(() => {
    if (profiles.length > 0) {
      storageService.saveProfiles(profiles);
    }
  }, [profiles]);

  // 激活的配置文件ID变化时自动保存
  useEffect(() => {
    if (activeProfileId) {
      storageService.setActiveProfileId(activeProfileId);
    }
  }, [activeProfileId]);

  /**
   * 切换配置文件
   */
  const switchProfile = useCallback((id: string) => {
    if (profiles.some(p => p.id === id)) {
      setActiveProfileId(id);
    }
  }, [profiles]);

  /**
   * 添加新配置文件
   */
  const addProfile = useCallback((name: string) => {
    const newProfile: Profile = {
      id: generateId(),
      name,
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
    return newProfile;
  }, []);

  /**
   * 删除配置文件
   */
  const deleteProfile = useCallback((id: string) => {
    if (id === 'default') return; // 不允许删除默认账户
    
    setProfiles(prev => {
      const newProfiles = prev.filter(p => p.id !== id);
      if (activeProfileId === id) {
        setActiveProfileId('default');
      }
      return newProfiles;
    });
    
    storageService.deleteProfileData(id);
  }, [activeProfileId]);

  /**
   * 添加新股票
   * @param stockData 股票数据（不包含 id 和 lastUpdated）
   * @returns 新添加的股票对象
   */
  const addStock = useCallback((stockData: Omit<Stock, 'id' | 'lastUpdated'>) => {
    const newStock: Stock = {
      ...stockData,
      id: generateId(),
      lastUpdated: new Date().toISOString(),
    };
    setStocks(prev => [...prev, newStock]);
    return newStock;
  }, []);

  /**
   * 更新股票信息
   * @param stock 更新后的股票对象
   */
  const updateStock = useCallback((stock: Stock) => {
    setStocks(prev => prev.map(s => s.id === stock.id ? { ...stock, lastUpdated: new Date().toISOString() } : s));
  }, []);

  /**
   * 删除股票
   * @param id 股票 ID
   */
  const deleteStock = useCallback((id: string) => {
    setStocks(prev => prev.filter(s => s.id !== id));
  }, []);

  /**
   * 刷新单只股票价格
   * @param id 股票 ID
   * @param newPrice 新价格
   */
  const refreshStockPrice = useCallback((id: string, newPrice: number) => {
    setStocks(prev => prev.map(s => 
      s.id === id 
        ? { ...s, currentPrice: newPrice, lastUpdated: new Date().toISOString() }
        : s
    ));
  }, []);

  /**
   * 导入股票列表
   * @param newStocks 导入的股票列表
   */
  const importStocks = useCallback((newStocks: Stock[]) => {
    setStocks(newStocks);
  }, []);

  /**
   * 保存当前状态为历史记录
   * 每天只保留一条记录，最多保留最近30天的记录
   */
  const saveHistoryRecord = useCallback(() => {
    const stocksCalculated = stocks.map(calculateStockData);
    const record = generateHistoryRecord(stocksCalculated);
    setHistory(prev => {
      const today = record.date;
      const filtered = prev.filter(h => h.date !== today);
      return [...filtered, record].sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
    });
  }, [stocks]);

  // 计算所有股票的衍生数据（市值、盈亏等）
  const stocksCalculated = stocks.map(calculateStockData);
  // 计算整个投资组合的汇总数据
  const summary = calculatePortfolioSummary(stocksCalculated);

  return {
    profiles,
    activeProfileId,
    switchProfile,
    addProfile,
    deleteProfile,
    stocks,
    stocksCalculated,
    summary,
    history,
    addStock,
    updateStock,
    deleteStock,
    refreshStockPrice,
    importStocks,
    saveHistoryRecord,
  };
}
