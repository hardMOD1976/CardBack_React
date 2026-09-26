import React, { useState, useMemo } from 'react';
import { ApiService } from '../../services/apiService';
import { EntityType, FigureSummaryDto } from '../../types/domain';
import { CbCard } from '../shared/CbCard';
import { Badge } from '../shared/Badge';
import { CbButton } from '../shared/CbButton';
import { handleImageError, getFigureImageUrl } from '../../utils/imageFallback';
import { 
  Database, 
  Filter, 
  ArrowUpDown, 
  Layers, 
  ArrowRight, 
  BookmarkPlus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import { ProposeFigureModal } from './ProposeFigureModal';
import { useLanguage } from '../../contexts/LanguageContext';

interface DatabankViewProps {
  onNavigate: (type: EntityType, id: string) => void;
  onAddFigure: (figureId: string) => void;
}

export const DatabankView: React.FC<DatabankViewProps> = ({
  onNavigate,
  onAddFigure
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'figures' | 'lines' | 'franchises' | 'characters'>('figures');
  const [searchFilter, setSearchFilter] = useState('');
  const [franchiseFilter, setFranchiseFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'year' | 'name'>('year');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  const pageSize = 8;

  const franchises = useMemo(() => ApiService.getFranchises(), []);
  const lines = useMemo(() => ApiService.getLines(), []);
  const characters = useMemo(() => ApiService.getCharacters(), []);

  // Filtered Figures
  const figuresResult = useMemo(() => {
    return ApiService.getFigures({
      franchiseId: franchiseFilter !== 'all' ? franchiseFilter : undefined,
      search: searchFilter,
      sortBy,
      sortOrder,
      page,
      limit: pageSize
    });
  }, [franchiseFilter, searchFilter, sortBy, sortOrder, page]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs uppercase font-mono tracking-wider text-slate-500 font-semibold">
              {t('databank.title', 'Catalogue Databank')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-display">
            {t('databank.title', 'Catalogue Databank')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('databank.subtitle', 'The definitive global action figure database. Browse verified toy lines, figure cards, variants, and releases.')}
          </p>
        </div>

        {/* Tab Switcher & Propose Button */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {[
              { id: 'figures', label: t('databank.tab_figures', 'Figures') },
              { id: 'lines', label: t('databank.tab_lines', 'Lines') },
              { id: 'franchises', label: t('databank.tab_franchises', 'Franchises') },
              { id: 'characters', label: t('databank.tab_characters', 'Characters') }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Community Propose Figure Button */}
          <CbButton
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => setIsProposeModalOpen(true)}
            className="shadow-sm"
          >
            {t('databank.propose_btn', 'Proposar Figura')}
          </CbButton>
        </div>
      </div>

      {/* Control Bar: Category Filters & Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px]">
          {activeTab === 'figures' && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">{t('nav.franchises', 'Franchise')}:</span>
              <select
                value={franchiseFilter}
                onChange={(e) => {
                  setFranchiseFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">{t('databank.all_franchises', 'All franchises')}</option>
                {franchises.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {activeTab === 'figures' && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500">{t('databank.sort_by', 'Sort by')}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="year">{t('databank.sort_year', 'Release year')}</option>
              <option value="name">{t('databank.sort_name', 'Figure name')}</option>
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
        )}
      </div>

      {/* Figures Tab Content */}
      {activeTab === 'figures' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {figuresResult.items.map(fig => (
              <CbCard
                key={fig.id}
                cardbackStyle
                interactive
                onClick={() => onNavigate('figure', fig.id)}
                className="group p-4 pt-7 hover:border-amber-500/60 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative">
                    <img
                      src={getFigureImageUrl(fig.imageUrl)}
                      alt={fig.name}
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {fig.code && (
                      <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs text-amber-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/40">
                        {fig.code}
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 text-[11px] font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded shadow-xs">
                      {fig.year}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                      {fig.lineName}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                      {fig.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                      {fig.variantsCount} {t('detail.catalogue_variant', 'Variants')}
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                      {fig.releasesCount} {t('detail.packaging_releases', 'Releases')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                    {t('detail.browse_catalogue', 'View figure')} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddFigure(fig.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                    title={t('collection.add_btn', 'Add to my collection')}
                  >
                    <BookmarkPlus className="w-4 h-4" />
                  </button>
                </div>
              </CbCard>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            <span>
              {figuresResult.page} / {figuresResult.totalPages} · {figuresResult.total} {t('databank.tab_figures', 'figures')}
            </span>
            <div className="flex items-center gap-2">
              <CbButton
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                icon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                {t('common.previous', 'Previous')}
              </CbButton>
              <CbButton
                variant="outline"
                size="sm"
                disabled={page >= figuresResult.totalPages}
                onClick={() => setPage(p => p + 1)}
                icon={<ChevronRight className="w-3.5 h-3.5" />}
                iconPosition="right"
              >
                {t('common.next', 'Next')}
              </CbButton>
            </div>
          </div>
        </div>
      )}

      {/* Lines Tab */}
      {activeTab === 'lines' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {lines.map(line => (
            <CbCard
              key={line.id}
              cardbackStyle
              interactive
              onClick={() => onNavigate('line', line.id)}
              className="group p-5 pt-8 hover:border-amber-500/60 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="aspect-16/9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                  <img
                    src={getFigureImageUrl(line.representativeImageUrl)}
                    onError={handleImageError}
                    alt={line.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="franchise" size="sm">{line.franchiseName}</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    {line.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {t('detail.manufacturer', 'Maker')}: <strong>{line.manufacturerName}</strong> • {line.startYear}{line.endYear ? `–${line.endYear}` : '–'}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>{line.totalFiguresCount} {t('databank.tab_figures', 'Figures')}</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                  {t('detail.browse_catalogue', 'Explore line')} <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </CbCard>
          ))}
        </div>
      )}

      {/* Franchises Tab */}
      {activeTab === 'franchises' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {franchises.map(fran => (
            <CbCard
              key={fran.id}
              cardbackStyle
              interactive
              onClick={() => onNavigate('franchise', fran.id)}
              className="group p-5 pt-8 hover:border-amber-500/60 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="aspect-16/9 rounded-lg overflow-hidden bg-slate-900 relative">
                  <img
                    src={getFigureImageUrl(fran.imageUrl)}
                    onError={handleImageError}
                    alt={fran.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    {fran.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {fran.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>{fran.lines.length} {t('databank.tab_lines', 'Lines')} • {t('detail.year', 'Est.')} {fran.originYear}</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                  Franchise Portal <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </CbCard>
          ))}
        </div>
      )}

      {/* Characters Tab */}
      {activeTab === 'characters' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {characters.map(char => (
            <CbCard
              key={char.id}
              interactive
              onClick={() => onNavigate('character', char.id)}
              className="group p-3 text-center flex flex-col items-center gap-2 hover:border-purple-500/60"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 group-hover:border-purple-500 transition-colors">
                <img
                  src={getFigureImageUrl(char.imageUrl)}
                  onError={handleImageError}
                  alt={char.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 line-clamp-1">
                {char.name}
              </h4>
              <span className="text-[11px] text-slate-500">
                {char.totalFiguresCount} {t('databank.tab_figures', 'Figures')}
              </span>
            </CbCard>
          ))}
        </div>
      )}

      {/* Community Propose Figure Modal (Wikipedia / Discogs style) */}
      <ProposeFigureModal
        isOpen={isProposeModalOpen}
        onClose={() => setIsProposeModalOpen(false)}
        onSuccess={() => {
          ApiService.syncCatalogueWithServer().then(() => {
            setPage(1);
          });
        }}
      />
    </div>
  );
};
