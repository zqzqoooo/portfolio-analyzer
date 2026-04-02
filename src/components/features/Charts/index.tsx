import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart as PieChartIcon, BarChart as BarChartIcon, TrendingUp, Grid3X3 } from 'lucide-react';
import { Card, EmptyState } from '@/components/common';
import { PieChart } from './PieChart';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { TreeMap } from './TreeMap';
import type { ChartsProps, ChartType } from '@/types';

const tabs: { id: ChartType; labelKey: string; icon: React.ReactNode }[] = [
  { id: 'pie', labelKey: 'charts.pie', icon: <PieChartIcon className="w-4 h-4" /> },
  { id: 'bar', labelKey: 'charts.bar', icon: <BarChartIcon className="w-4 h-4" /> },
  { id: 'line', labelKey: 'charts.line', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'treemap', labelKey: 'charts.treemap', icon: <Grid3X3 className="w-4 h-4" /> },
];

export function Charts({ stocks, summary, history }: ChartsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ChartType>('pie');

  if (stocks.length === 0) {
    return (
      <Card title={t('charts.title')}>
        <EmptyState
          title={t('charts.noData')}
          description={t('charts.noDataDescription')}
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('charts.title')}</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t('charts.totalMarketValue')}: ¥{summary.totalMarketValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          <span className={`ml-2 ${summary.totalProfit >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
            ({summary.totalProfit >= 0 ? '+' : ''}{summary.totalProfit.toLocaleString('zh-CN', { minimumFractionDigits: 2 })})
          </span>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {tab.icon}
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'pie' && <PieChart data={getPieData(stocks)} />}
        {activeTab === 'bar' && <BarChart data={getBarData(stocks)} />}
        {activeTab === 'line' && <LineChart data={history} />}
        {activeTab === 'treemap' && <TreeMap data={getTreeMapData(stocks)} />}
      </div>
    </Card>
  );
}

import { getPieChartData, getBarChartData, getIndustryDistribution } from '@/utils/calculator';
import type { PieChartProps, BarChartProps, TreeMapProps } from '@/types';

function getPieData(stocks: ChartsProps['stocks']): PieChartProps['data'] {
  return getPieChartData(stocks);
}

function getBarData(stocks: ChartsProps['stocks']): BarChartProps['data'] {
  return getBarChartData(stocks);
}

function getTreeMapData(stocks: ChartsProps['stocks']): TreeMapProps['data'] {
  return getIndustryDistribution(stocks);
}
