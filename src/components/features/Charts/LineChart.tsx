import ReactECharts from 'echarts-for-react';
import { useTheme } from '@/hooks/useTheme';
import type { LineChartProps } from '@/types';

export function LineChart({ data }: LineChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
        <p>暂无历史数据，系统会自动记录每日市值</p>
      </div>
    );
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#374151' : '#fff',
      borderColor: isDark ? '#4B5563' : '#E5E7EB',
      textStyle: { color: isDark ? '#F9FAFB' : '#111827' },
      formatter: (params: any) => {
        const item = params[0];
        return `${item.name}<br/>市值: ¥${item.value.toLocaleString()}`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date),
      axisLabel: {
        color: isDark ? '#9CA3AF' : '#6B7280',
      },
      axisLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB' } },
    },
    yAxis: {
      type: 'value',
      name: '市值 (¥)',
      nameTextStyle: { color: isDark ? '#9CA3AF' : '#6B7280' },
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
          return value.toString();
        },
        color: isDark ? '#9CA3AF' : '#6B7280',
      },
      splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB' } },
    },
    series: [
      {
        name: '总市值',
        type: 'line',
        data: data.map(d => d.totalMarketValue),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#3B82F6', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ],
          },
        },
        itemStyle: { color: '#3B82F6' },
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: '400px', width: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  );
}
