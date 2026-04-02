import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { Button, Input, Select } from '@/components/common';
import { validateStockForm } from './validation';
import { fetchStockPrice } from '@/services/stockApi';
import { MARKET_CONFIG, INDUSTRY_LIST } from '@/utils/constants';
import type { Stock, StockFormProps, FormState, FormErrors, Market } from '@/types';

function getInitialState(initialData?: Stock): FormState {
  return {
    code: initialData?.code || '',
    name: initialData?.name || '',
    market: initialData?.market || 'CN',
    buyPrice: initialData?.buyPrice?.toString() || '',
    quantity: initialData?.quantity?.toString() || '',
    buyDate: initialData?.buyDate || new Date().toISOString().split('T')[0],
    currentPrice: initialData?.currentPrice?.toString() || '',
    industry: initialData?.industry || '',
  };
}

export function StockForm({ onSubmit, onCancel, initialData, isEditing }: StockFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormState>(() => getInitialState(initialData));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isFetching, setIsFetching] = useState(false);

  const marketOptions = useMemo(() => [
    { value: 'CN', label: t('market.CN') },
    { value: 'HK', label: t('market.HK') },
    { value: 'US', label: t('market.US') },
  ], [t]);

  const industryOptions = useMemo(() => [
    { value: '', label: t('form.selectIndustry') },
    ...INDUSTRY_LIST.map(i => ({ value: i, label: t(`industry.${i}`) })),
  ], [t]);

  const handleChange = (field: keyof FormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleMarketChange = (market: string) => {
    setFormData(prev => ({ 
      ...prev, 
      market: market as Market,
      code: '',
      name: '',
      currentPrice: '',
    }));
    setErrors({});
  };

  const handleAutoFetchPrice = async () => {
    if (!formData.code) {
      setErrors(prev => ({ ...prev, code: t('form.enterCodeFirst') }));
      return;
    }

    setIsFetching(true);
    try {
      const result = await fetchStockPrice(formData.code, formData.market as Market);
      setFormData(prev => ({
        ...prev,
        currentPrice: result.price.toString(),
        name: result.name || prev.name,
      }));
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        currentPrice: error instanceof Error ? error.message : t('form.fetchPriceFailed') 
      }));
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateStockForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({
      code: formData.code.trim(),
      name: formData.name.trim() || formData.code,
      market: formData.market as Market,
      buyPrice: parseFloat(formData.buyPrice),
      quantity: parseInt(formData.quantity, 10),
      buyDate: formData.buyDate,
      currentPrice: parseFloat(formData.currentPrice) || parseFloat(formData.buyPrice),
      industry: formData.industry.trim(),
      currency: MARKET_CONFIG[formData.market as Market].currency,
    });
    
    if (!isEditing) {
      setFormData(getInitialState());
    }
  };

  const getCodePlaceholder = () => {
    switch (formData.market) {
      case 'CN': return t('form.enterStockCode');
      case 'HK': return t('form.enterStockCodeHK');
      case 'US': return t('form.enterStockCodeUS');
    }
  };

  const getCodeHint = () => {
    switch (formData.market) {
      case 'CN': return t('form.codeHintCN');
      case 'HK': return t('form.codeHintHK');
      case 'US': return t('form.codeHintUS');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label={t('form.market')}
          options={marketOptions}
          value={formData.market}
          onChange={(e) => handleMarketChange(e.target.value)}
          required
        />
        
        <Input
          label={t('form.stockCode')}
          value={formData.code}
          onChange={(e) => handleChange('code', e.target.value)}
          placeholder={getCodePlaceholder()}
          hint={getCodeHint()}
          error={errors.code}
          required
        />
        
        <Input
          label={t('form.stockName')}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder={t('form.placeholderOptional')}
          error={errors.name}
        />
        
        <Input
          label={t('form.buyPrice')}
          type="number"
          step="0.001"
          min="0"
          value={formData.buyPrice}
          onChange={(e) => handleChange('buyPrice', e.target.value)}
          placeholder="0.000"
          error={errors.buyPrice}
          required
        />
        
        <Input
          label={t('form.quantity')}
          type="number"
          min="1"
          step="1"
          value={formData.quantity}
          onChange={(e) => handleChange('quantity', e.target.value)}
          placeholder={t('form.integer')}
          error={errors.quantity}
          required
        />
        
        <Input
          label={t('form.buyDate')}
          type="date"
          value={formData.buyDate}
          onChange={(e) => handleChange('buyDate', e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          error={errors.buyDate}
          required
        />
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('form.currentPrice')}
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.001"
              min="0"
              value={formData.currentPrice}
              onChange={(e) => handleChange('currentPrice', e.target.value)}
              placeholder="0.000"
              error={errors.currentPrice}
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAutoFetchPrice}
              loading={isFetching}
              className="whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              {t('form.autoFetch')}
            </Button>
          </div>
        </div>
        
        <Select
          label={t('form.industry')}
          options={industryOptions}
          value={formData.industry}
          onChange={(e) => handleChange('industry', e.target.value)}
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        {isEditing && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('form.cancel')}
          </Button>
        )}
        <Button type="submit">
          {isEditing ? t('form.save') : t('form.add')}
        </Button>
      </div>
    </form>
  );
}