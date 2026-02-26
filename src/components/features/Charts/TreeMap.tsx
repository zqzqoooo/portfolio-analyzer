import ReactECharts from 'echarts-for-react';
import { useTheme } from '@/hooks/useTheme';
import type { TreeMapProps } from '@/types';

export function TreeMap({ data }: TreeMapProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
        <p>暂无行业分布数据</p>
      </div>
    );
  }

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? '#374151' : '#fff',
      borderColor: isDark ? '#4B5563' : '#E5E7EB',
      textStyle: { color: isDark ? '#F9FAFB' : '#111827' },
      formatter: (params: any) => {
        return `${params.name}<br/>市值: ¥${params.value?.toLocaleString() || 0}`;
      },
    },
    series: [
      {
        type: 'treemap',
        data: data.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: getTreeMapColor(index),
          },
        })),
        width: '100%',
        height: '100%',
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        label: {
          show: true,
          formatter: '{b}\n¥{c}',
          color: '#fff',
          fontSize: 12,
        },
        itemStyle: {
          borderColor: isDark ? '#1F2937' : '#fff',
          borderWidth: 2,
          gapWidth: 2,
        },
        levels: [
          {
            itemStyle: {
              borderColor: isDark ? '#1F2937' : '#fff',
              borderWidth: 2,
              gapWidth: 2,
            },
          },
        ],
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

function getTreeMapColor(index: number): string {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#A855F7', '#F43F5E', '#22C55E', '#0EA5E9',
  ];
  return colors[index % colors.length];
}
