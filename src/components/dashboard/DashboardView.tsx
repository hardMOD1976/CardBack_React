import React, { useMemo } from 'react';
import { CollectionService } from '../../services/collectionService';
import { ApiService } from '../../services/apiService';
import { EntityType, OwnedFigure } from '../../types/domain';
import { CbCard } from '../shared/CbCard';
import { Badge } from '../shared/Badge';
import { CbButton } from '../shared/CbButton';
import { handleImageError, getFigureImageUrl } from '../../utils/imageFallback';
import { 
  Bookmark, 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  ScanBarcode, 
  Cpu, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  Plus, 
  Layers, 
  Award,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface DashboardViewProps {
  onNavigateEntity: (type: EntityType, id: string) => void;
  onSelectView: (view: 'dashboard' | 'collection' | 'databank' | 'wishlist' | 'ai_identify' | 'scan_barcode' | 'profile') => void;
  onOpenAddModal: () => void;
  currentUser: { name: string; email: string } | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateEntity,
  onSelectView,
  onOpenAddModal,
  currentUser
}) => {
  const { t, currentLanguage } = useLanguage();
  const stats = useMemo(() => CollectionService.getCollectionStats(), []);
  const ownedFigures = useMemo(() => CollectionService.getOwnedFigures(), []);
  const wishlist = useMemo(() => CollectionService.getWishlist(), []);

  // Most valuable figures
  const topValuedFigures = useMemo(() => {
    return [...ownedFigures]
      .sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0))
      .slice(0, 4);
  }, [ownedFigures]);

  // Recent additions
  const recentAdditions = useMemo(() => {
    return [...ownedFigures]
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, 4);
  }, [ownedFigures]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" /> {t('dashboard.portfolio_active', 'Collector Portfolio Active')}
              </span>
              <span className="text-xs text-slate-300">
                {currentUser ? currentUser.name : 'Collector'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-display">
              {t('dashboard.welcome_title', 'Check your collection.')}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              {t('dashboard.welcome_subtitle', 'Your authoritative hub for action figure archiving. Track conditions, inspect variants, scan commercial barcodes, and run AI visual appraisals.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <CbButton
              variant="amber"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={onOpenAddModal}
            >
              {t('dashboard.add_figure', 'Add Figure')}
            </CbButton>

            <CbButton
              variant="outline"
              size="md"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              icon={<ScanBarcode className="w-4 h-4 text-amber-400" />}
              onClick={() => onSelectView('scan_barcode')}
            >
              {t('nav.scan_barcode', 'Scan Barcode')}
            </CbButton>

            <CbButton
              variant="outline"
              size="md"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              icon={<Cpu className="w-4 h-4" />}
              onClick={() => onSelectView('ai_identify')}
            >
              {t('nav.ai_identify', 'AI Identify')}
            </CbButton>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CbCard
          interactive
          onClick={() => onSelectView('collection')}
          className="p-5 border-slate-200 dark:border-slate-800 space-y-1.5 hover:border-amber-500/60"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-amber-500" /> {t('dashboard.stats_figures', 'Owned Figures')}
            </span>
            <span className="text-[11px] text-amber-500 font-semibold flex items-center">
              {t('common.view', 'View')} <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-display">
            {stats.totalFigures}
          </div>
          <p className="text-[11px] text-slate-400">
            {t('dashboard.unique_catalogue', 'Across {{count}} unique catalogue molds').replace('{{count}}', String(stats.uniqueFiguresCount))}
          </p>
        </CbCard>

        <CbCard className="p-5 border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-500" /> {t('dashboard.stats_value', 'Portfolio Value')}
            </span>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">
              {t('common.current', 'Current')}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display font-mono">
            ${stats.totalEstimatedValue.toLocaleString(currentLanguage, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <p className="text-[11px] text-slate-400">
            {t('dashboard.invested', 'Invested')}: ${stats.totalInvested.toLocaleString(currentLanguage, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </CbCard>

        <CbCard className="p-5 border-slate-200 dark:border-slate-800 space-y-1.5 bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-500/20">
          <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400">
            <span className="font-medium flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> {t('dashboard.stats_growth', 'Capital Growth (ROI)')}
            </span>
            <span className="text-[10px] font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded">
              +{stats.gainPercentage}%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display font-mono">
            +${stats.unrealizedGain.toLocaleString(currentLanguage, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {t('dashboard.unrealized', 'Unrealized collector appreciation')}
          </p>
        </CbCard>

        <CbCard
          interactive
          onClick={() => onSelectView('wishlist')}
          className="p-5 border-slate-200 dark:border-slate-800 space-y-1.5 hover:border-purple-500/60"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-500" /> {t('dashboard.stats_wishlist', 'Target Wishlist')}
            </span>
            <span className="text-[11px] text-purple-500 font-semibold flex items-center">
              {t('common.view', 'View')} <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-display">
            {wishlist.length}
          </div>
          <p className="text-[11px] text-slate-400">
            {t('dashboard.wishlist_tracked', 'Unowned holy grails tracked')}
          </p>
        </CbCard>
      </div>

      {/* Feature Gateway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <CbCard
          interactive
          onClick={() => onSelectView('ai_identify')}
          className="p-5 border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/10 hover:border-blue-500 flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {t('dashboard.ai_title', 'AI Visual Figure Identifier')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t('dashboard.ai_description', 'Take or upload a photo of any figure, accessory, or blister pack to instantly detect mold variants and market price.')}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold">
            <span>{t('dashboard.ai_action', 'Launch AI Scanner')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </CbCard>

        <CbCard
          interactive
          onClick={() => onSelectView('scan_barcode')}
          className="p-5 border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/10 hover:border-amber-500 flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ScanBarcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {t('dashboard.barcode_title', 'Cardback Barcode Scanner')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t('dashboard.barcode_description', 'Scan UPC barcodes on cardbacks and packaging to reveal regional release history, assortment numbers, and variants.')}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold">
            <span>{t('dashboard.barcode_action', 'Scan UPC Barcode')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </CbCard>

        <CbCard
          interactive
          onClick={() => onSelectView('databank')}
          className="p-5 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                {t('dashboard.databank_title', 'Authoritative Databank')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t('dashboard.databank_description', 'Explore immutable catalogue hierarchies across Franchises, Toy Makers, Lines, Characters, Figures, and holy grail Variants.')}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold">
            <span>{t('dashboard.databank_action', 'Browse Catalogue')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </CbCard>
      </div>

      {/* Top Valued Figures & Recent Additions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Valued */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {t('dashboard.top_valued', 'Highest Valued Figures')}
            </h2>
            <button
              type="button"
              onClick={() => onSelectView('collection')}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
            >
              {t('dashboard.view_all_count', 'View All ({{count}})').replace('{{count}}', String(ownedFigures.length))}
            </button>
          </div>

          <div className="space-y-2.5">
            {topValuedFigures.map(item => (
              <div
                key={item.id}
                onClick={() => onNavigateEntity('figure', item.figureId)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/60 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={getFigureImageUrl(item.figureImageUrl)}
                    alt={item.figureName}
                    onError={handleImageError}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-500 truncate">
                      {item.figureName}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.lineName} • <span className="font-semibold">{item.condition}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                    ${item.estimatedValue}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {t('dashboard.cost', 'Cost')}: ${item.purchasePrice}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Line Completion Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              {t('dashboard.line_progress', 'Toy Line Completion Progress')}
            </h2>
            <button
              type="button"
              onClick={() => onSelectView('databank')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              {t('dashboard.explore_lines', 'Explore Lines')}
            </button>
          </div>

          <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {stats.lineBreakdown.slice(0, 4).map(line => (
              <div key={line.lineName} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {line.lineName}
                  </span>
                  <span className="text-slate-500 font-mono">
                    {line.count} / {line.totalInLine} ({line.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                    style={{ width: `${Math.min(100, line.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
