import React, { useState, useRef, useEffect } from 'react';
import { CbInput } from '../shared/CbInput';
import { CbButton } from '../shared/CbButton';
import { Badge } from '../shared/Badge';
import { ApiService } from '../../services/apiService';
import { EntityType, GlobalSearchResponseDto } from '../../types/domain';
import { 
  Search, 
  Sun, 
  Moon, 
  User, 
  Bookmark, 
  Layers, 
  ArrowRight, 
  SlidersHorizontal,
  X,
  PackageCheck,
  ScanBarcode,
  Palette
} from 'lucide-react';

import { MainNavView } from './Sidebar';
import { handleImageError, getFigureImageUrl } from '../../utils/imageFallback';
import { CardbackLogo } from '../brand/CardbackLogo';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { SkinSelectorModal } from './SkinSelectorModal';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  onSearchClear: () => void;
  onNavigate: (type: EntityType, id: string) => void;
  onOpenView: (view: MainNavView | 'search') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  collectionCount: number;
  collectionValue: number;
  onOpenAuth: () => void;
  currentUser: { name: string; email: string } | null;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  onNavigate,
  onOpenView,
  theme,
  onToggleTheme,
  collectionCount,
  collectionValue,
  onOpenAuth,
  currentUser
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [skinModalOpen, setSkinModalOpen] = useState(false);
  const [liveResults, setLiveResults] = useState<GlobalSearchResponseDto | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { skin, mode, toggleMode } = useTheme();

  // Live search debouncing for header dropdown
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const resp = ApiService.globalSearch(searchQuery);
      setLiveResults(resp);
      setDropdownOpen(true);
    } else {
      setLiveResults(null);
      setDropdownOpen(false);
    }
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    onSearchClear();
    setDropdownOpen(false);
    setLiveResults(null);
  };

  const handleEnter = () => {
    if (searchQuery.trim()) {
      setDropdownOpen(false);
      onSearchSubmit(searchQuery);
    }
  };

  const handleResultClick = (type: EntityType, id: string) => {
    setDropdownOpen(false);
    onNavigate(type, id);
  };

  const skinBorderClass = 
    skin === 'vintage-kenner'
      ? 'border-b-2 border-slate-300 dark:border-slate-600 shadow-[0_2px_0_0_rgba(15,23,42,0.9),0_3.5px_0_0_rgba(148,163,184,0.5)]'
      : skin === 'retro-neon'
      ? 'border-b border-cyan-500/50 shadow-[0_4px_16px_-2px_rgba(6,182,212,0.25)]'
      : 'border-b border-slate-200 dark:border-slate-800';

  return (
    <>
      <header className={`sticky top-0 z-40 h-16 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between gap-4 transition-all ${skinBorderClass}`}>
        {/* Brand Identity / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onOpenView('dashboard')}
            className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer py-1"
            title={t('dashboard.welcome_title', 'Cardback')}
          >
            {/* Official Cardback Logo */}
            <div className="group-hover:opacity-90 transition-opacity flex items-center gap-2">
              <div className="hidden sm:block">
                <CardbackLogo variant="full" size="md" className="h-8 w-auto" />
              </div>
              <div className="sm:hidden">
                <CardbackLogo variant="mark" size="md" className="h-8 w-auto" />
              </div>

              {/* 80s Vintage Badge indicator */}
              {skin === 'vintage-kenner' && (
                <span className="hidden xl:inline-flex items-center gap-1 text-[9px] font-mono uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-slate-900 border border-slate-400 text-amber-400 shadow-xs">
                  <span>★</span>
                  <span>Kenner '78</span>
                </span>
              )}
              {skin === 'retro-neon' && (
                <span className="hidden xl:inline-flex items-center gap-1 text-[9px] font-mono uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-slate-950 border border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                  <span>◆</span>
                  <span>Neon '84</span>
                </span>
              )}
            </div>
          </button>
        </div>

      {/* Global Search Bar with verified clearing and live popover */}
      <div className="flex-1 max-w-xl relative" ref={dropdownRef}>
        <CbInput
          id="header-global-search"
          value={searchQuery}
          onChange={onSearchChange}
          onEnter={handleEnter}
          onClear={handleClear}
          clearable={true}
          placeholder={t('nav.search_placeholder', 'Search figures, variants, cardbacks, characters...')}
          icon={<Search className="w-4 h-4" />}
          size="md"
        />

        {/* Live Search Quick Popover */}
        {dropdownOpen && liveResults && liveResults.total > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden z-50 animate-fadeIn">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>{t('search.match_count', 'Matching catalogue results').replace('{{count}}', String(liveResults.total))}</span>
              <button
                type="button"
                onClick={handleEnter}
                className="text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                {t('search.open_detail', 'View all results')} <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {liveResults.results.slice(0, 6).map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleResultClick(item.targetRoute.type, item.targetRoute.id)}
                  className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={getFigureImageUrl(item.imageUrl)}
                      alt={item.title}
                      onError={handleImageError}
                      className="w-10 h-10 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={item.type} size="sm">{item.badgeText}</Badge>
                        <span className="text-[11px] text-slate-400 truncate">{item.subtitle}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
              ))}
            </div>

            <div className="p-2 bg-slate-100/70 dark:bg-slate-950 text-center text-[11px] text-slate-500 flex items-center justify-between px-3">
              <span>{t('search.hint', 'Press Enter to see all results')}</span>
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" /> {t('search.clear', 'Clear')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Controls: Collection Stats, Language Selector, Theme Toggle, Auth */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Quick Collection Badge */}
        <button
          type="button"
          onClick={() => onOpenView('collection')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 bg-slate-50 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          title={t('nav.collection', 'Open Collection')}
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-500" />
          <span>
            <strong>{collectionCount}</strong> {t('nav.figures', 'figures')}
          </span>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            ${collectionValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </button>

        {/* Quick Barcode Scanner Shortcut */}
        <button
          type="button"
          id="header-scan-barcode-btn"
          onClick={() => onOpenView('scan_barcode')}
          aria-label={t('nav.scan_barcode', 'Scan barcode')}
          title={t('nav.scan_barcode', 'Scan action figure barcode')}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <ScanBarcode className="w-4 h-4 text-amber-500" />
          <span className="hidden xl:inline text-xs font-semibold">{t('nav.quick_scan', 'Scan')}</span>
        </button>

        {/* Multi-language Selector (8 languages supported) */}
        <LanguageSelector />

        {/* 80s Themes & Skin Selector Button */}
        <button
          type="button"
          id="header-skin-selector-btn"
          onClick={() => setSkinModalOpen(true)}
          aria-label={t('skin.button_label', 'Personalitzar Skin i Tema')}
          title={t('skin.button_title', 'Tria entre Arxiu Modern, Kenner 1978 Cardback o Neon 80s')}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <Palette className="w-4 h-4 text-amber-500" />
          <span className="hidden lg:inline text-xs font-semibold">
            {skin === 'vintage-kenner' ? 'Kenner ’78' : skin === 'retro-neon' ? 'Neon ’84' : 'Modern'}
          </span>
        </button>

        {/* Light / Dark Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? t('common.theme_light', 'Switch to light mode') : t('common.theme_dark', 'Switch to dark mode')}
          title={theme === 'dark' ? t('common.theme_light', 'Switch to light mode') : t('common.theme_dark', 'Switch to dark mode')}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* User Account Button */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center text-xs">
            {currentUser ? currentUser.name.charAt(0) : <User className="w-3.5 h-3.5" />}
          </div>
          <span className="hidden md:inline font-medium">
            {currentUser ? currentUser.name : t('nav.sign_in', 'Sign In')}
          </span>
        </button>
      </div>
    </header>

    {/* Accessible 80s Skin & Theme Selector Modal */}
    <SkinSelectorModal 
      isOpen={skinModalOpen} 
      onClose={() => setSkinModalOpen(false)} 
    />
  </>
  );
};
