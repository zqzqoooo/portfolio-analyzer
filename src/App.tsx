import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common';
import { ToastContainer } from '@/components/common/Toast';
import { StockForm } from '@/components/features/StockForm';
import { StockList } from '@/components/features/StockList';
import { Charts } from '@/components/features/Charts';
import { DataIO } from '@/components/features/DataIO';
import { useStocks } from '@/hooks/useStocks';
import { useToast } from '@/hooks/useToast';
import { fetchStockPrice } from '@/services/stockApi';
import type { Stock } from '@/types';

function App() {
  const { t } = useTranslation();
  const { 
    profiles, activeProfileId, switchProfile, addProfile, deleteProfile,
    stocks, stocksCalculated, summary, history, 
    addStock, updateStock, deleteStock, refreshStockPrice, importStocks, saveHistoryRecord 
  } = useStocks();
  const { toasts, showToast, removeToast } = useToast();
  const [editingStock, setEditingStock] = useState<Stock | null>(null);

  const handleSubmit = (stockData: Omit<Stock, 'id' | 'lastUpdated'>) => {
    if (editingStock) {
      updateStock({ ...stockData, id: editingStock.id, lastUpdated: new Date().toISOString() });
      showToast(t('toast.updateSuccess'), 'success');
      setEditingStock(null);
    } else {
      addStock(stockData);
      showToast(t('toast.addSuccess'), 'success');
    }
    saveHistoryRecord();
  };

  const handleEdit = (stock: Stock) => {
    setEditingStock(stock);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    deleteStock(id);
    showToast(t('toast.deleteSuccess'), 'success');
  };

  const handleRefreshPrice = async (id: string) => {
    const stock = stocks.find(s => s.id === id);
    if (!stock) return;

    try {
      const result = await fetchStockPrice(stock.code, stock.market);
      refreshStockPrice(id, result.price);
      showToast(t('toast.priceUpdated'), 'success');
    } catch {
      showToast(t('toast.priceUpdateFailed'), 'error');
    }
  };

  const handleRefreshAllPrices = async () => {
    if (stocks.length === 0) {
      showToast(t('toast.noPositionData'), 'warning');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const stock of stocks) {
      try {
        const result = await fetchStockPrice(stock.code, stock.market);
        refreshStockPrice(stock.id, result.price);
        successCount++;
      } catch {
        failCount++;
      }
    }

    if (successCount > 0 && failCount === 0) {
      showToast(t('toast.refreshSuccess', { count: successCount }), 'success');
    } else if (successCount > 0 && failCount > 0) {
      showToast(t('toast.refreshPartialSuccess', { success: successCount, fail: failCount }), 'warning');
    } else {
      showToast(t('toast.refreshFailed'), 'error');
    }
    
    saveHistoryRecord();
  };

  const handleCancelEdit = () => {
    setEditingStock(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header 
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSwitchProfile={switchProfile}
        onAddProfile={addProfile}
        onDeleteProfile={deleteProfile}
      />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card title={editingStock ? t('form.editPosition') : t('form.addPositionTitle')}>
              <StockForm
                onSubmit={handleSubmit}
                onCancel={handleCancelEdit}
                initialData={editingStock || undefined}
                isEditing={!!editingStock}
              />
            </Card>

            <DataIO
              stocks={stocks}
              onImport={importStocks}
              showToast={showToast}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Charts
              stocks={stocksCalculated}
              summary={summary}
              history={history}
            />

            <Card title={`持仓列表`}>
              <StockList
                stocks={stocksCalculated}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRefreshPrice={handleRefreshPrice}
                onRefreshAll={handleRefreshAllPrices}
              />
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
