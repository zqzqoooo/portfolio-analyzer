import ReactECharts from 'echarts-for-react';
import { useTheme } from '@/hooks/useTheme';
import type { PieChartProps } from '@/types';

export function PieChart({ data }: PieChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)',
      backgroundColor: isDark ? '#374151' : '#fff',
      borderColor: isDark ? '#4B5563' : '#E5E7EB',
      textStyle: { color: isDark ? '#F9FAFB' : '#111827' },
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: isDark ? '#D1D5DB' : '#6B7280' },
    },
    series: [
      {
        name: '持仓占比',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: isDark ? '#1F2937' : '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          color: isDark ? '#D1D5DB' : '#6B7280',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: data.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: getChartColor(index),
          },
        })),
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

function getChartColor(index: number): string {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];
  return colors[index % colors.length];
}
