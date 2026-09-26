import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LineDetailResponseDto, EntityType } from '../../types/domain';
import { CbCard } from '../shared/CbCard';
import { Badge } from '../shared/Badge';
import { CbButton } from '../shared/CbButton';
import { handleImageError, getFigureImageUrl } from '../../utils/imageFallback';
import { Calendar, Factory, Layers, Sparkles, ArrowRight, Tag, BookmarkPlus } from 'lucide-react';

interface LineDetailProps {
  data: LineDetailResponseDto;
  onNavigate: (type: EntityType, id: string) => void;
  onAddFigureToCollection?: (figureId: string) => void;
}

export const LineDetail: React.FC<LineDetailProps> = ({
  data,
  onNavigate,
  onAddFigureToCollection
}) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Line Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-lg">
        <div className="absolute inset-0 opacity-20 mix-blend-luminosity">
          <img
            src={getFigureImageUrl(data.representativeImageUrl)}
            alt={data.name}
            onError={handleImageError}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('franchise', data.franchiseId)}
                className="hover:underline focus:outline-none"
              >
                <Badge variant="franchise" size="sm">{data.franchiseName}</Badge>
              </button>
              <Badge variant={data.isActive ? 'emerald' : 'gray'} size="sm">
                {data.isActive ? 'Active Toy Line' : 'Archived Line'}
              </Badge>
              {data.scale && (
                <span className="text-xs text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                  {data.scale}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {data.logoUrl ? (
                <img
                  src={getFigureImageUrl(data.logoUrl)}
                  alt={`${data.name} logo`}
                  onError={handleImageError}
                  className="h-10 sm:h-12 w-auto object-contain rounded-md bg-white/10 p-1"
                />
              ) : (
                <div className="text-xs font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded">
                  {data.franchiseName} Logo Text
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-display">
                {data.name}
              </h1>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {data.description}
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-2 text-xs sm:text-sm text-slate-300">
              <button
                type="button"
                onClick={() => onNavigate('manufacturer', data.manufacturerId)}
                className="flex items-center gap-1.5 hover:text-amber-400 transition-colors focus:outline-none"
              >
                <Factory className="w-4 h-4 text-amber-400" />
                {t('detail.manufacturer', 'Maker')}: <strong className="underline underline-offset-2">{data.manufacturerName}</strong>
              </button>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                {t('detail.year', 'Commercialized')}: <strong>{data.startYear}{data.endYear ? `–${data.endYear}` : '–'}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                {t('databank.tab_figures', 'Total products')}: <strong>{data.totalFiguresCount} {t('databank.tab_figures', 'Figures')}</strong>
              </span>
            </div>
          </div>

          <div className="shrink-0 w-36 h-36 sm:w-48 sm:h-48 rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-950">
            <img
              src={getFigureImageUrl(data.representativeImageUrl)}
              alt={data.name}
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Collector Notes */}
      {data.collectorNotes && (
        <div className="p-4 sm:p-5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-slate-800 dark:text-slate-200 text-sm flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">
              {t('detail.catalogue', 'Collector catalogue notes and identification')}
            </span>
            <p className="text-xs sm:text-sm leading-relaxed">{data.collectorNotes}</p>
          </div>
        </div>
      )}

      {/* Figures Catalogue Cards Section (Visual Cards - Not Plain Text Links) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              {t('detail.figure_variants', 'Figure catalogue cards')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {data.figures.length} {t('databank.tab_figures', 'Figures')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {data.figures.map(fig => (
            <CbCard
              key={fig.id}
              cardbackStyle
              interactive
              onClick={() => onNavigate('figure', fig.id)}
              className="group flex flex-col justify-between p-4 pt-7 hover:border-amber-500/60"
            >
              <div className="space-y-3">
                {/* Visual Identifying Image */}
                <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 relative">
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
                  <div className="absolute bottom-2 right-2">
                    <span className="text-[11px] font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded shadow-xs">
                      {fig.year}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>{t('databank.tab_characters', 'Character')}:</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('character', fig.characterId);
                      }}
                      className="font-medium text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      {fig.characterName}
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                    {fig.name}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                    {fig.variantsCount} {t('detail.catalogue_variant', 'Variants')}
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                    {fig.releasesCount} {t('detail.packaging_releases', 'Releases')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                  {t('detail.catalogue', 'Catalogue card')} <ArrowRight className="w-3.5 h-3.5" />
                </span>
                {onAddFigureToCollection && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddFigureToCollection(fig.id);
                    }}
                    title={t('detail.track_variant', 'Track in collection')}
                    className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                  >
                    <BookmarkPlus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </CbCard>
          ))}
        </div>
      </div>
    </div>
  );
};
