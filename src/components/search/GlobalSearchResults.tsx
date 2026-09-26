import React, { useState } from 'react';
import { GlobalSearchResponseDto, EntityType } from '../../types/domain';
import { Badge } from '../shared/Badge';
import { CbCard } from '../shared/CbCard';
import { CbButton } from '../shared/CbButton';
import { handleImageError, getFigureImageUrl } from '../../utils/imageFallback';
import { Search, X, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface GlobalSearchResultsProps {
  searchResponse: GlobalSearchResponseDto;
  query: string;
  onQueryChange: (query: string) => void;
  onClear: () => void;
  onNavigate: (type: EntityType, id: string) => void;
  selectedCategory: EntityType | 'all';
  onCategoryChange: (category: EntityType | 'all') => void;
}

export const GlobalSearchResults: React.FC<GlobalSearchResultsProps> = ({
  searchResponse,
  query,
  onQueryChange,
  onClear,
  onNavigate,
  selectedCategory,
  onCategoryChange
}) => {
  const { t } = useLanguage();
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleClearWithFeedback = () => {
    onClear();
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 2500);
  };

  const categories: { id: EntityType | 'all'; label: string; count: number }[] = [
    { id: 'all', label: t('nav.all', 'All results'), count: searchResponse.total },
    { id: 'figure', label: t('nav.figures', 'Figures'), count: searchResponse.byTypeCount.figure },
    { id: 'variant', label: t('search.variants', 'Variants'), count: searchResponse.byTypeCount.variant },
    { id: 'product_release', label: t('search.releases', 'Product releases'), count: searchResponse.byTypeCount.product_release },
    { id: 'character', label: t('nav.characters', 'Characters'), count: searchResponse.byTypeCount.character },
    { id: 'line', label: t('nav.lines', 'Lines'), count: searchResponse.byTypeCount.line },
    { id: 'franchise', label: t('nav.franchises', 'Franchises'), count: searchResponse.byTypeCount.franchise },
    { id: 'manufacturer', label: t('search.manufacturers', 'Makers'), count: searchResponse.byTypeCount.manufacturer }
  ];

  const filteredResults = selectedCategory === 'all'
    ? searchResponse.results
    : searchResponse.results.filter(r => r.type === selectedCategory);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Search Results Header (Driven by the top Header Search Bar) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Search className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 font-display">
              {query ? t('search.results_for', 'Search results for “{{query}}”').replace('{{query}}', query) : t('search.global_title', 'Global catalogue search')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {query 
              ? t('search.match_count', 'Found {{count}} catalogue records matching your search').replace('{{count}}', String(searchResponse.total))
              : t('search.hint', 'Search figures, cardbacks, variants, and characters using the search field above')}
          </p>
        </div>

        {query && (
          <CbButton
            variant="outline"
            size="sm"
            onClick={handleClearWithFeedback}
            icon={<X className="w-3.5 h-3.5" />}
          >
            {t('search.clear', 'Clear search')}
          </CbButton>
        )}
      </div>

      {clearedNotice && (
        <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-md border border-amber-300 dark:border-amber-800 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{t('search.cleared', 'Search query cleared.')}</span>
        </div>
      )}

      {/* Categorical Filtering Tabs */}
      {query && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150 flex items-center gap-2 cursor-pointer
                  ${isSelected
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected 
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-950' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3">
        {filteredResults.length > 0 ? (
          filteredResults.map(item => (
            <CbCard
              key={`${item.type}-${item.id}`}
              interactive
              onClick={() => onNavigate(item.targetRoute.type, item.targetRoute.id)}
              className="p-4 hover:border-amber-500/60 flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700/60">
                  <img
                    src={getFigureImageUrl(item.imageUrl)}
                    alt={item.title}
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={item.type} size="sm">
                      {item.badgeText}
                    </Badge>
                    <span className="text-xs text-slate-500 truncate">{item.subtitle}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {item.meta}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                <span className="hidden sm:inline">{t('search.open_detail', 'Open detail')}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </CbCard>
          ))
        ) : query ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {t('search.no_results', 'No matching records found for “{{query}}”').replace('{{query}}', query)}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {t('search.no_results_help', 'Try a figure name, toy line, or identifying feature. For example: Darth Vader, Kenner, or Long Saber.')}
            </p>
            <div className="pt-2">
              <CbButton variant="secondary" size="sm" onClick={handleClearWithFeedback} icon={<X className="w-3.5 h-3.5" />}>
                {t('search.clear_query', 'Clear search query')}
              </CbButton>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
            <Layers className="w-10 h-10 text-amber-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t('search.global_archive', 'Cardback global search archive')}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {t('search.global_description', 'Search catalogue entries across franchises, manufacturers, lines, characters, figures, variants, and releases.')}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs text-slate-400">{t('search.popular', 'Popular searches:')}</span>
              {['Darth Vader', 'Long Saber', '12-Back', 'Boba Fett', 'He-Man', 'Kenner 1978', 'Double-Telescoping'].map(term => (
                <button
                  key={term}
                  type="button"
                  onClick={() => onQueryChange(term)}
                  className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full hover:border-amber-500 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
