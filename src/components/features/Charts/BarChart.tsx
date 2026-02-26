import ReactECharts from 'echarts-for-react';
import { useTheme } from '@/hooks/useTheme';
import type { BarChartProps } from '@/types';

export function BarChart({ data }: BarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: isDark ? '#374151' : '#fff',
      borderColor: isDark ? '#4B5563' : '#E5E7EB',
      textStyle: { color: isDark ? '#F9FAFB' : '#111827' },
      formatter: (params: any) => {
        const item = params[0];
        const d = data.find(d => d.name === item.name);
        if (!d) return '';
        return `${item.name}<br/>盈亏: ¥${d.profit.toFixed(3)}<br/>盈亏率: ${d.profitRate.toFixed(3)}%`;
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
      data: data.map(d => d.name),
      axisLabel: {
        rotate: 30,
        color: isDark ? '#9CA3AF' : '#6B7280',
      },
      axisLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB' } },
    },
    yAxis: {
      type: 'value',
      name: '盈亏率 (%)',
      nameTextStyle: { color: isDark ? '#9CA3AF' : '#6B7280' },
      axisLabel: {
        formatter: (value: number) => `${value.toFixed(1)}%`,
        color: isDark ? '#9CA3AF' : '#6B7280',
      },
      splitLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB' } },
    },
    series: [
      {
        name: '盈亏率',
        type: 'bar',
        data: data.map(d => ({
          value: d.profitRate,
          itemStyle: {
            color: d.profit >= 0 ? '#10B981' : '#EF4444',
            borderRadius: [4, 4, 0, 0],
          },
        })),
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => `${params.value.toFixed(3)}%`,
          color: isDark ? '#D1D5DB' : '#6B7280',
          fontSize: 11,
        },
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
