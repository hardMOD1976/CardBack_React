import React, { useState, useMemo } from 'react';
import { CollectionService } from '../../services/collectionService';
import { OwnedFigure, FigureCondition, EntityType } from '../../types/domain';
import { CbCard } from '../shared/CbCard';
import { Badge } from '../shared/Badge';
import { CbButton } from '../shared/CbButton';
import { handleImageError, getFigureImageUrl } from '../../utils/imageFallback';
import { 
  Bookmark, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpDown, 
  SlidersHorizontal, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowRight,
  Sparkles,
  MapPin,
  Heart
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface CollectionViewProps {
  onNavigate: (type: EntityType, id: string) => void;
  onOpenAddModal: () => void;
  onEditItem: (item: OwnedFigure) => void;
  isWishlistView?: boolean;
}

export const CollectionView: React.FC<CollectionViewProps> = ({
  onNavigate,
  onOpenAddModal,
  onEditItem,
  isWishlistView = false
}) => {
  const { t, currentLanguage } = useLanguage();
  const [collection, setCollection] = useState<OwnedFigure[]>(() => {
    return isWishlistView
      ? CollectionService.getWishlist()
      : CollectionService.getOwnedFigures();
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [franchiseFilter, setFranchiseFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'value' | 'price' | 'condition'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Listen to collection changes
  React.useEffect(() => {
    const unsub = CollectionService.subscribe(() => {
      setCollection(
        isWishlistView
          ? CollectionService.getWishlist()
          : CollectionService.getOwnedFigures()
      );
    });
    return unsub;
  }, [isWishlistView]);

  const stats = useMemo(() => CollectionService.getCollectionStats(), [collection]);

  // Unique franchises in collection
  const availableFranchises = useMemo(() => {
    const set = new Set(collection.map(c => c.franchiseName));
    return Array.from(set);
  }, [collection]);

  // Filter & Sort
  const filteredItems = useMemo(() => {
    return collection
      .filter(item => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.figureName.toLowerCase().includes(q);
          const matchLine = item.lineName.toLowerCase().includes(q);
          const matchVar = item.variantName?.toLowerCase().includes(q);
          const matchCode = item.figureCode?.toLowerCase().includes(q);
          if (!matchName && !matchLine && !matchVar && !matchCode) return false;
        }
        if (conditionFilter !== 'all' && item.condition !== conditionFilter) {
          return false;
        }
        if (franchiseFilter !== 'all' && item.franchiseName !== franchiseFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'date') {
          comp = new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        } else if (sortBy === 'name') {
          comp = a.figureName.localeCompare(b.figureName);
        } else if (sortBy === 'value') {
          comp = (b.estimatedValue || 0) - (a.estimatedValue || 0);
        } else if (sortBy === 'price') {
          comp = (b.purchasePrice || 0) - (a.purchasePrice || 0);
        } else if (sortBy === 'condition') {
          comp = a.condition.localeCompare(b.condition);
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [collection, searchQuery, conditionFilter, franchiseFilter, sortBy, sortOrder]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Remove this figure record from your collection?')) {
      CollectionService.removeFigure(id);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs uppercase font-mono tracking-wider text-slate-500 font-semibold">
              {isWishlistView ? t('nav.wishlist', 'Wishlist') : t('collection.title', 'Col·lecció')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-display">
            {isWishlistView ? t('collection.wishlist_title', 'Target Wishlist') : t('collection.title', 'My Figure Collection')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isWishlistView
              ? t('collection.wishlist_subtitle', 'Catalogued figures and variants you plan to acquire.')
              : t('collection.subtitle', 'Manage your owned figures, condition records, and valuations.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CbButton
            variant="amber"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={onOpenAddModal}
          >
            {t('collection.add_btn', 'Add Figure to Collection')}
          </CbButton>
        </div>
      </div>

      {/* Portfolio Stats Dashboard (for main collection) */}
      {!isWishlistView && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CbCard className="p-4 border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-amber-500" /> {t('dashboard.stats_figures', 'Owned figures')}
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-display">
              {stats.totalFigures} <span className="text-xs text-slate-400 font-normal font-sans">{t('common.units', 'units')}</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {t('dashboard.unique_catalogue', '{{count}} unique catalogue molds').replace('{{count}}', String(stats.uniqueFiguresCount))}
            </span>
          </CbCard>

          <CbCard className="p-4 border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> {t('dashboard.stats_value', 'Portfolio value')}
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display font-mono">
              ${stats.totalEstimatedValue.toLocaleString(currentLanguage, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-400">
              {t('collection.verified_appraisal', 'Verified market appraisal')}
            </span>
          </CbCard>

          <CbCard className="p-4 border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-500" /> {t('collection.acquisition_cost', 'Total acquisition cost')}
            </span>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-200 font-display font-mono">
              ${stats.totalInvested.toLocaleString(currentLanguage, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-400">
              {t('collection.capital_expended', 'Capital expended')}
            </span>
          </CbCard>

          <CbCard className="p-4 border-slate-200 dark:border-slate-800 space-y-1 bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-500/20">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> {t('dashboard.stats_growth', 'Capital growth (ROI)')}
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-display font-mono">
              +${stats.unrealizedGain.toLocaleString(currentLanguage, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              <span className="text-xs font-bold ml-1.5 bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-800 dark:text-emerald-300">
                +{stats.gainPercentage}%
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('collection.appreciation', 'Appreciation over purchase')}
            </span>
          </CbCard>
        </div>
      )}

      {/* Filter and Sorting Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px]">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">{t('propose.condition', 'Condition')}:</span>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">{t('collection.all_conditions', 'All conditions')}</option>
              <option value="MOC">{t('propose.cond_moc', 'Mint on Card (MOC)')}</option>
              <option value="LOOSE_COMPLETE">{t('propose.cond_loose_comp', 'Loose complete')}</option>
              <option value="LOOSE_INCOMPLETE">{t('propose.cond_loose_incomp', 'Loose incomplete')}</option>
              <option value="GRADED">{t('propose.cond_opt_graded', 'Professionally graded')}</option>
            </select>
          </div>

          {availableFranchises.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">{t('nav.franchises', 'Franchise')}:</span>
              <select
                value={franchiseFilter}
                onChange={(e) => setFranchiseFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">{t('databank.all_franchises', 'All franchises')}</option>
                {availableFranchises.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500">{t('databank.sort_by', 'Sort by')}:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="date">{t('collection.date_added', 'Date added')}</option>
            <option value="name">{t('collection.figure_name', 'Figure name')}</option>
            <option value="value">{t('collection.estimated_value', 'Estimated value')}</option>
            <option value="price">{t('collection.purchase_price', 'Purchase price')}</option>
            <option value="condition">{t('propose.condition', 'Condition')}</option>
          </select>
          <button
            type="button"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-amber-500"
            title={t('collection.sort_order', 'Sort {{order}}').replace('{{order}}', sortOrder === 'asc' ? t('collection.ascending', 'ascending') : t('collection.descending', 'descending'))}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collection Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map(item => (
            <CbCard
              key={item.id}
              cardbackStyle
              interactive
              onClick={() => onNavigate('figure', item.figureId)}
              className="group p-4 pt-7 hover:border-amber-500/60 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Figure Image */}
                <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative">
                  <img
                    src={getFigureImageUrl(item.figureImageUrl)}
                    alt={item.figureName}
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant={item.condition === 'GRADED' ? 'purple' : item.condition === 'MOC' ? 'amber' : 'gray'} size="sm">
                      {item.condition === 'MOC' ? 'MOC' : item.condition === 'GRADED' ? item.gradingScore || t('propose.cond_opt_graded', 'Graded') : item.condition === 'LOOSE_COMPLETE' ? t('propose.cond_loose_comp', 'Loose complete') : t('propose.cond_loose_incomp', 'Loose incomplete')}
                    </Badge>
                  </div>
                  {item.quantity > 1 && (
                    <div className="absolute top-2 right-2 bg-slate-900/90 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                      x{item.quantity}
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                    {item.lineName}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                    {item.figureName}
                  </h3>

                  {item.variantName && (
                    <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1">
                      {t('collection.variant_label', 'Variant')}: {item.variantName}
                    </div>
                  )}

                  {item.storageLocation && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{item.storageLocation}</span>
                    </div>
                  )}
                </div>

                {/* Financial Appraisal Row */}
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('dashboard.cost', 'Cost')}</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">${item.purchasePrice}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">{t('dashboard.stats_value', 'Current value')}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${item.estimatedValue}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                  {t('collection.catalogue_detail', 'Catalogue detail')} <ArrowRight className="w-3 h-3" />
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditItem(item);
                    }}
                    className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                    title={t('collection.edit_details', 'Edit inventory details')}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                    title={t('collection.remove_item', 'Remove from collection')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </CbCard>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
          <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {isWishlistView ? t('collection.empty_wishlist_title', 'Your wishlist is empty') : t('collection.empty_collection_title', 'No figures found in your collection')}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isWishlistView
              ? t('collection.empty_wishlist_help', 'Browse the catalogue and bookmark figures you want to own.')
              : t('collection.empty_collection_help', 'Add your first figure to record its condition, value, and storage location.')}
          </p>
          <div className="pt-2">
            <CbButton variant="amber" size="sm" onClick={onOpenAddModal} icon={<Plus className="w-3.5 h-3.5" />}>
              {t('collection.add_now', 'Add a figure now')}
            </CbButton>
          </div>
        </div>
      )}
    </div>
  );
};
