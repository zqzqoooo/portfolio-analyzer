import { useRef, useState } from 'react';
import { Upload, Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { Button, Card } from '@/components/common';
import { exportToJSON, exportToCSV, parseImportFile } from '@/services/storage';
import type { Stock, ExportFormat } from '@/types';

interface DataIOProps {
  stocks: Stock[];
  onImport: (stocks: Stock[]) => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function DataIO({ stocks, onImport, showToast }: DataIOProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');

  const handleExport = () => {
    if (stocks.length === 0) {
      showToast('暂无数据可导出', 'warning');
      return;
    }

    if (exportFormat === 'json') {
      exportToJSON(stocks);
    } else {
      exportToCSV(stocks);
    }
    showToast('导出成功', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const format = file.name.endsWith('.json') ? 'json' : 'csv';
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedStocks = parseImportFile(content, format);

        if (importedStocks.length === 0) {
          showToast('文件中没有有效数据', 'warning');
          return;
        }

        onImport(importedStocks);
        showToast(`成功导入 ${importedStocks.length} 条数据`, 'success');
      } catch (error) {
        showToast('文件格式错误，请检查文件内容', 'error');
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">导出格式:</span>
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setExportFormat('json')}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm transition-colors ${
                exportFormat === 'json'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <FileJson className="w-4 h-4" />
              JSON
            </button>
            <button
              onClick={() => setExportFormat('csv')}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm transition-colors ${
                exportFormat === 'csv'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" />
            导出数据
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleImport}
            className="hidden"
          />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-1" />
            导入数据
          </Button>
        </div>
      </div>
    </Card>
  );
}
