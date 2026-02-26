import { useState } from 'react';
import { Edit2, Trash2, RefreshCw } from 'lucide-react';
import { Card, EmptyState, ConfirmModal, Button } from '@/components/common';
import { formatCurrency, formatPrice, formatPercent, getMarketLabel, getCurrencySymbol } from '@/utils/format';
import type { StockWithCalculated, StockListProps, Stock } from '@/types';

interface ExtendedStockListProps extends StockListProps {
  onRefreshAll?: () => Promise<void>;
}

export function StockList({ stocks, onEdit, onDelete, onRefreshPrice, onRefreshAll }: ExtendedStockListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; stock: Stock | null }>({
    isOpen: false,
    stock: null,
  });
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  const handleDeleteClick = (stock: Stock) => {
    setDeleteConfirm({ isOpen: true, stock });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.stock) {
      onDelete(deleteConfirm.stock.id);
    }
    setDeleteConfirm({ isOpen: false, stock: null });
  };

  const handleRefreshAll = async () => {
    if (!onRefreshAll) return;
    setIsRefreshingAll(true);
    try {
      await onRefreshAll();
    } finally {
      setIsRefreshingAll(false);
    }
  };

  if (stocks.length === 0) {
    return (
      <Card>
        <EmptyState
          title="暂无持仓数据"
          description="请添加您的股票持仓，开始分析您的投资组合"
        />
      </Card>
    );
  }

  const sortedStocks = [...stocks].sort((a, b) => b.marketValue - a.marketValue);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          共 {stocks.length} 只股票
        </span>
        {onRefreshAll && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRefreshAll}
            loading={isRefreshingAll}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            一键刷新
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">代码</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">名称</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">市场</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">买入价</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">数量</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">现价</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 hidden lg:table-cell">市值</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">盈亏</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedStocks.map((stock) => (
              <StockRow
                key={stock.id}
                stock={stock}
                onEdit={onEdit}
                onDelete={handleDeleteClick}
                onRefreshPrice={onRefreshPrice}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, stock: null })}
        onConfirm={handleDeleteConfirm}
        title="确认删除"
        message={`确定要删除 ${deleteConfirm.stock?.name || deleteConfirm.stock?.code} 吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        variant="danger"
      />
    </>
  );
}

interface StockRowProps {
  stock: StockWithCalculated;
  onEdit: (stock: Stock) => void;
  onDelete: (stock: Stock) => void;
  onRefreshPrice: (id: string) => void;
}

function StockRow({ stock, onEdit, onDelete, onRefreshPrice }: StockRowProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onRefreshPrice(stock.id);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const profitColor = stock.profit >= 0 ? 'text-success-500' : 'text-danger-500';

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="px-4 py-3">
        <span className="font-mono text-sm">{stock.code}</span>
      </td>
      <td className="px-4 py-3">
        <span className="font-medium text-gray-900 dark:text-gray-100">{stock.name}</span>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          {getMarketLabel(stock.market)}
        </span>
      </td>
      <td className="px-4 py-3 text-right font-mono text-sm">
        {getCurrencySymbol(stock.market)}{formatPrice(stock.buyPrice, stock.market)}
      </td>
      <td className="px-4 py-3 text-right font-mono text-sm hidden md:table-cell">
        {stock.quantity.toLocaleString()}
      </td>
      <td className="px-4 py-3 text-right font-mono text-sm">
        {getCurrencySymbol(stock.market)}{formatPrice(stock.currentPrice, stock.market)}
      </td>
      <td className="px-4 py-3 text-right font-mono text-sm hidden lg:table-cell">
        {formatCurrency(stock.marketValue, stock.market)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className={`font-mono text-sm ${profitColor}`}>
          <div>{formatCurrency(Math.abs(stock.profit), stock.market)}</div>
          <div className="text-xs">{formatPercent(stock.profitRate)}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onEdit(stock)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="编辑"
          >
            <Edit2 className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => onDelete(stock)}
            className="p-1.5 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded transition-colors"
            title="删除"
          >
            <Trash2 className="w-4 h-4 text-danger-500" />
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
            title="刷新价格"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </td>
    </tr>
  );
}
