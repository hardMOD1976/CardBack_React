import React from 'react';
import { 
  LayoutDashboard,
  Bookmark, 
  Database, 
  Heart, 
  Cpu, 
  ScanBarcode, 
  User,
  ChevronRight
} from 'lucide-react';
import { EntityType } from '../../types/domain';
import { useLanguage } from '../../contexts/LanguageContext';

export type MainNavView = 
  | 'dashboard' 
  | 'collection' 
  | 'databank' 
  | 'wishlist' 
  | 'ai_identify' 
  | 'scan_barcode' 
  | 'profile';

interface SidebarProps {
  currentView: MainNavView | 'detail' | 'search';
  onSelectView: (view: MainNavView) => void;
  onNavigateEntity: (type: EntityType, id: string) => void;
  collectionCount: number;
  wishlistCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onNavigateEntity,
  collectionCount,
  wishlistCount
}) => {
  const { t } = useLanguage();

  // Exactly the 7 features specified in the user's screenshot
  const menuItems: { id: MainNavView; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: t('nav.dashboard', 'Dashboard'),
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'collection',
      label: t('nav.collection', 'Collection'),
      icon: <Bookmark className="w-4 h-4" />,
      badge: collectionCount
    },
    {
      id: 'databank',
      label: t('nav.databank', 'Databank'),
      icon: <Database className="w-4 h-4" />
    },
    {
      id: 'wishlist',
      label: t('nav.wishlist', 'Wishlist'),
      icon: <Heart className="w-4 h-4" />,
      badge: wishlistCount
    },
    {
      id: 'ai_identify',
      label: t('nav.ai_identify', 'AI Identify'),
      icon: <Cpu className="w-4 h-4" />
    },
    {
      id: 'scan_barcode',
      label: t('nav.scan_barcode', 'Scan Barcode'),
      icon: <ScanBarcode className="w-4 h-4" />
    },
    {
      id: 'profile',
      label: t('nav.profile', 'Profile'),
      icon: <User className="w-4 h-4" />
    }
  ];

  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 flex flex-col justify-between p-4 hidden md:flex h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="space-y-4">
        {/* Feature Navigation List starting right at the top */}
        <nav className="space-y-1">
          {menuItems.map(item => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`sidebar-nav-${item.id}`}
                onClick={() => onSelectView(item.id)}
                className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer text-left ${
                  active
                    ? 'bg-slate-900 dark:bg-slate-800 text-white font-bold border border-slate-900 dark:border-slate-700/80 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`transition-colors ${
                    active 
                      ? 'text-amber-400' 
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}>
                    {item.icon}
                  </span>
                  <span className={active ? 'text-white' : ''}>
                    {item.label}
                  </span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold transition-colors ${
                    active
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-850 text-[11px] text-slate-400 dark:text-slate-500 space-y-1">
        <div className="flex items-center justify-between font-mono text-[10px]">
          <span>{t('databank.title', 'CATALOGUE ARCHIVE')}</span>
          <span className="text-emerald-500 font-bold">● {t('scanner.online_status', 'ONLINE')}</span>
        </div>
      </div>
    </aside>
  );
};
