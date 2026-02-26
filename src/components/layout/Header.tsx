import { Sun, Moon, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/common';
import { useTheme } from '@/hooks/useTheme';
import type { Profile } from '@/types';

interface HeaderProps {
  profiles: Profile[];
  activeProfileId: string;
  onSwitchProfile: (id: string) => void;
  onAddProfile: (name: string) => void;
  onDeleteProfile: (id: string) => void;
}

export function Header({ profiles, activeProfileId, onSwitchProfile, onAddProfile, onDeleteProfile }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  const handleAddProfile = () => {
    const name = window.prompt('请输入新账户名称：');
    if (name && name.trim()) {
      onAddProfile(name.trim());
    }
  };

  const handleDeleteProfile = () => {
    if (activeProfileId === 'default') {
      alert('主账户不能删除');
      return;
    }
    if (window.confirm('确定要删除当前账户及其所有数据吗？此操作不可恢复。')) {
      onDeleteProfile(activeProfileId);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Portfolio Analyzer
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                持仓分析工具
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <select
                value={activeProfileId}
                onChange={(e) => onSwitchProfile(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-auto min-w-[100px] p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <Button variant="ghost" size="sm" onClick={handleAddProfile} className="p-2" title="添加账户">
                <Plus className="w-4 h-4" />
              </Button>
              {activeProfileId !== 'default' && (
                <Button variant="ghost" size="sm" onClick={handleDeleteProfile} className="p-2 text-danger-500 hover:text-danger-600" title="删除当前账户">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
