import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button, Input, Select } from '@/components/common';
import { validateStockForm } from './validation';
import { fetchStockPrice } from '@/services/stockApi';
import { MARKET_CONFIG, INDUSTRY_LIST } from '@/utils/constants';
import type { Stock, StockFormProps, FormState, FormErrors, Market } from '@/types';

const marketOptions = [
  { value: 'CN', label: 'A股' },
  { value: 'HK', label: '港股' },
  { value: 'US', label: '美股' },
];

const industryOptions = [
  { value: '', label: '请选择行业' },
  ...INDUSTRY_LIST.map(i => ({ value: i, label: i })),
];

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
  const [formData, setFormData] = useState<FormState>(() => getInitialState(initialData));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isFetching, setIsFetching] = useState(false);

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
      setErrors(prev => ({ ...prev, code: '请先输入股票代码' }));
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
        currentPrice: error instanceof Error ? error.message : '获取股价失败' 
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
      case 'CN': return '如：600519';
      case 'HK': return '如：00700';
      case 'US': return '如：AAPL';
    }
  };

  const getCodeHint = () => {
    switch (formData.market) {
      case 'CN': return '6位数字代码';
      case 'HK': return '4-5位数字代码';
      case 'US': return '1-5位字母代码';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="市场"
          options={marketOptions}
          value={formData.market}
          onChange={(e) => handleMarketChange(e.target.value)}
          required
        />
        
        <Input
          label="股票代码"
          value={formData.code}
          onChange={(e) => handleChange('code', e.target.value)}
          placeholder={getCodePlaceholder()}
          hint={getCodeHint()}
          error={errors.code}
          required
        />
        
        <Input
          label="股票名称"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="可选，自动获取"
          error={errors.name}
        />
        
        <Input
          label="买入价格"
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
          label="持仓数量"
          type="number"
          min="1"
          step="1"
          value={formData.quantity}
          onChange={(e) => handleChange('quantity', e.target.value)}
          placeholder="整数"
          error={errors.quantity}
          required
        />
        
        <Input
          label="买入日期"
          type="date"
          value={formData.buyDate}
          onChange={(e) => handleChange('buyDate', e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          error={errors.buyDate}
          required
        />
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            当前价格
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
              自动获取
            </Button>
          </div>
        </div>
        
        <Select
          label="所属行业"
          options={industryOptions}
          value={formData.industry}
          onChange={(e) => handleChange('industry', e.target.value)}
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        {isEditing && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button type="submit">
          {isEditing ? '保存修改' : '添加持仓'}
        </Button>
      </div>
    </form>
  );
}
