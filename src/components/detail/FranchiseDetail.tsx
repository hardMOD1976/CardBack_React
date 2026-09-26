import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { FranchiseDetailResponseDto, EntityType } from '../../types/domain';
import { CbCard } from '../shared/CbCard';
import { Badge } from '../shared/Badge';
import { CbButton } from '../shared/CbButton';
import { Layers, Users, Calendar, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { getFigureImageUrl, handleImageError } from '../../utils/imageFallback';

interface FranchiseDetailProps {
  data: FranchiseDetailResponseDto;
  onNavigate: (type: EntityType, id: string) => void;
}

export const FranchiseDetail: React.FC<FranchiseDetailProps> = ({ data, onNavigate }) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white shadow-lg">
        {data.headerBannerUrl && (
          <div className="absolute inset-0 opacity-25 mix-blend-overlay">
            <img
              src={getFigureImageUrl(data.headerBannerUrl)}
              alt={data.name}
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="franchise" size="sm">{t('detail.catalogue', 'Franchise archive')}</Badge>
              <span className="text-xs text-amber-300/80 font-medium">Est. {data.originYear}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-display">
              {data.name}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {data.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                {t('detail.created_by', 'Created by')} <strong>{data.creator}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                <strong>{data.lines.length}</strong> {t('databank.tab_lines', 'Toy lines')}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <strong>{data.totalFiguresCount}</strong> {t('databank.tab_figures', 'Figures')}
              </span>
            </div>
          </div>

          <div className="shrink-0 w-32 h-32 sm:w-44 sm:h-44 rounded-xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-slate-950">
            <img
              src={getFigureImageUrl(data.imageUrl)}
              alt={data.name}
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Historical Context & Action Figure Lore Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CbCard className="p-6 border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
            <Calendar className="w-4 h-4" />
            <span>{t('detail.franchise_history', 'Franchise origin and history')}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {data.history}
          </p>
        </CbCard>

        <CbCard className="p-6 border-slate-200 dark:border-slate-800 space-y-3 bg-amber-50/50 dark:bg-amber-950/10 border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>{t('detail.collecting_impact', 'Impact on figure collecting')}</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {data.actionFigureLoreContext}
          </p>
        </CbCard>
      </div>

      {/* Lines Gateway Section (Visual Lines Representation) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              {t('databank.tab_lines', 'Available product lines')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('detail.figure_variants', 'Explore catalogue figures and releases by product line')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.lines.map(line => (
            <CbCard
              key={line.id}
              interactive
              cardbackStyle
              onClick={() => onNavigate('line', line.id)}
              className="group flex flex-col justify-between p-5 pt-8 hover:border-amber-500/60"
            >
              <div className="space-y-4">
                <div className="aspect-16/9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                  <img
                    src={getFigureImageUrl(line.imageUrl)}
                    alt={line.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={line.isActive ? 'emerald' : 'gray'} size="sm">
                      {line.isActive ? t('common.active', 'Active') : `${line.startYear}–${line.endYear || 'End'}`}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {line.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t('detail.manufacturer', 'Produced by')} <strong>{line.manufacturerName}</strong>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>{line.figuresCount} {t('databank.tab_figures', 'Figures')}</span>
                <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                  {t('detail.browse_catalogue', 'View line')} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </CbCard>
          ))}
        </div>
      </div>

      {/* Key Characters in Franchise */}
      {data.keyCharacters && data.keyCharacters.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            {t('databank.tab_characters', 'Key characters')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data.keyCharacters.map(char => (
              <CbCard
                key={char.id}
                interactive
                onClick={() => onNavigate('character', char.id)}
                className="group p-3 text-center flex flex-col items-center gap-2 hover:border-purple-500/50"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 group-hover:border-purple-500 transition-colors">
                  <img
                    src={getFigureImageUrl(char.imageUrl)}
                    alt={char.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {char.name}
                </h4>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {char.figuresCount} {t('databank.tab_figures', 'Figures')}
                </span>
              </CbCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
