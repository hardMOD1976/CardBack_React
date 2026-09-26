import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CharacterDetailResponseDto, EntityType } from '../../types/domain';
import { CbCard } from '../shared/CbCard';
import { Badge } from '../shared/Badge';
import { handleImageError, getFigureImageUrl } from '../../utils/imageFallback';
import { BookOpen, Sparkles, Layers, ArrowRight, Camera, Award } from 'lucide-react';

interface CharacterDetailProps {
  data: CharacterDetailResponseDto;
  onNavigate: (type: EntityType, id: string) => void;
}

export const CharacterDetail: React.FC<CharacterDetailProps> = ({ data, onNavigate }) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-lg p-6 sm:p-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('franchise', data.franchiseId)}
              className="hover:underline focus:outline-none"
            >
              <Badge variant="franchise" size="sm">{data.franchiseName}</Badge>
            </button>
            <Badge variant="character" size="sm">{t('detail.lore_context', 'Fictional character')}</Badge>
            {data.affiliation && (
              <span className="text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {data.affiliation}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-display">
            {data.name}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {data.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 text-xs text-slate-300">
            {data.species && (
              <div>
                <span className="text-slate-500 block">{t('detail.species', 'Species')}</span>
                <span className="font-semibold text-slate-200">{data.species}</span>
              </div>
            )}
            {data.homeworld && (
              <div>
                <span className="text-slate-500 block">{t('detail.homeworld', 'Homeworld')}</span>
                <span className="font-semibold text-slate-200">{data.homeworld}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500 block">{t('detail.figure_appearances', 'Figure appearances')}</span>
              <span className="font-semibold text-amber-400">{data.totalFiguresCount} {t('databank.tab_figures', 'Figures')}</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-2xl bg-slate-950">
          <img
            src={getFigureImageUrl(data.imageUrl)}
            alt={data.name}
            onError={handleImageError}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Collector Dual Heritage Section: Lore vs First Action Figure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CbCard className="p-6 border-slate-200 dark:border-slate-800 space-y-3 bg-purple-50/40 dark:bg-purple-950/10 border-purple-500/20">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>1. {t('detail.first_appearance', 'First appearance')}</span>
          </div>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {data.firstLoreAppearance}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {t('detail.lore_context', 'Fictional background')}
          </p>
        </CbCard>

        <CbCard className="p-6 border-slate-200 dark:border-slate-800 space-y-3 bg-amber-50/40 dark:bg-amber-950/10 border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
            <Award className="w-4 h-4" />
            <span>2. {t('detail.first_figure', 'First action figure')}</span>
          </div>
          <div>
            <button
              type="button"
              onClick={() => onNavigate('figure', data.firstFigureAppearance.figureId)}
              className="text-base font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 focus:outline-none"
            >
              <span>{data.firstFigureAppearance.figureName} ({data.firstFigureAppearance.year})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {t('nav.lines', 'Line')}: <strong>{data.firstFigureAppearance.lineName}</strong>
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('detail.first_appearance', 'First appearance')}
          </p>
        </CbCard>
      </div>

      {/* 3. Appearances Across Toy Lines */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              {t('detail.figure_appearances', 'Appearances across figure lines')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('detail.figure_variants', 'Catalogue appearances across product lines')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.appearancesAcrossLines.map(app => (
            <CbCard
              key={app.figureId}
              interactive
              cardbackStyle
              onClick={() => onNavigate('figure', app.figureId)}
              className="group p-4 pt-7 hover:border-amber-500/60 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img
                    src={getFigureImageUrl(app.imageUrl)}
                    alt={app.figureName}
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 block">
                    {app.lineName} ({app.year})
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    {app.figureName}
                  </h3>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>{t('databank.search_label', 'Code')}: {app.code || 'Standard'}</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold inline-flex items-center gap-1">
                  {t('detail.catalogue', 'Figure card')} <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </CbCard>
          ))}
        </div>
      </div>

      {/* 5. Photographic Catalogue Gallery */}
      {data.galleryUrls && data.galleryUrls.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-500" />
            {t('detail.catalogue', 'Photo archive')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.galleryUrls.map((url, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-16/10 bg-slate-900 shadow-sm">
                <img
                  src={getFigureImageUrl(url)}
                  alt={`${data.name} archive photo ${idx + 1}`}
                  onError={handleImageError}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
