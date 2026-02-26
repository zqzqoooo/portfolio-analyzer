import { useState } from 'react';
import { PieChart as PieChartIcon, BarChart as BarChartIcon, TrendingUp, Grid3X3 } from 'lucide-react';
import { Card, EmptyState } from '@/components/common';
import { PieChart } from './PieChart';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { TreeMap } from './TreeMap';
import type { ChartsProps, ChartType } from '@/types';

const tabs: { id: ChartType; label: string; icon: React.ReactNode }[] = [
  { id: 'pie', label: '饼图', icon: <PieChartIcon className="w-4 h-4" /> },
  { id: 'bar', label: '柱状图', icon: <BarChartIcon className="w-4 h-4" /> },
  { id: 'line', label: '折线图', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'treemap', label: '树形图', icon: <Grid3X3 className="w-4 h-4" /> },
];

export function Charts({ stocks, summary, history }: ChartsProps) {
  const [activeTab, setActiveTab] = useState<ChartType>('pie');

  if (stocks.length === 0) {
    return (
      <Card title="持仓分析">
        <EmptyState
          title="暂无数据"
          description="添加持仓后即可查看分析图表"
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">持仓分析</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          总市值: ¥{summary.totalMarketValue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
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
            {tab.label}
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
