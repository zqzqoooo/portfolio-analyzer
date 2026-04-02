import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Trash2, RefreshCw } from 'lucide-react';
import { Card, EmptyState, ConfirmModal, Button } from '@/components/common';
import { formatCurrency, formatPrice, formatPercent, getCurrencySymbol } from '@/utils/format';
import type { StockWithCalculated, StockListProps, Stock } from '@/types';

interface ExtendedStockListProps extends StockListProps {
  onRefreshAll?: () => Promise<void>;
}

export function StockList({ stocks, onEdit, onDelete, onRefreshPrice, onRefreshAll }: ExtendedStockListProps) {
  const { t } = useTranslation();
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
          title={t('stockList.noData')}
          description={t('stockList.noDataDescription')}
        />
      </Card>
    );
  }

  const sortedStocks = [...stocks].sort((a, b) => b.marketValue - a.marketValue);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {t('stockList.totalStocks', { count: stocks.length })}
        </span>
        {onRefreshAll && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRefreshAll}
            loading={isRefreshingAll}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            {t('stockList.refreshAll')}
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">{t('stockList.code')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">{t('stockList.name')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">{t('stockList.market')}</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">{t('stockList.buyPrice')}</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">{t('stockList.quantity')}</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">{t('stockList.currentPrice')}</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 hidden lg:table-cell">{t('stockList.marketValue')}</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">{t('stockList.profitLoss')}</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">{t('stockList.actions')}</th>
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
        title={t('stockList.confirmDelete')}
        message={t('stockList.confirmDeleteMessage', { name: deleteConfirm.stock?.name || deleteConfirm.stock?.code })}
        confirmText={t('stockList.delete')}
        cancelText={t('stockList.cancel')}
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
  const { t } = useTranslation();
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
          {t(`market.${stock.market}`)}
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
            title={t('stockList.edit')}
          >
            <Edit2 className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => onDelete(stock)}
            className="p-1.5 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded transition-colors"
            title={t('stockList.delete')}
          >
            <Trash2 className="w-4 h-4 text-danger-500" />
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
            title={t('stockList.refreshPrice')}
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </td>
    </tr>
  );
}
