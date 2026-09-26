import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ManufacturerDetailResponseDto, EntityType } from '../../types/domain';
import { CbCard } from '../shared/CbCard';
import { Badge } from '../shared/Badge';
import { Factory, Calendar, MapPin, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { getFigureImageUrl, handleImageError } from '../../utils/imageFallback';

interface ManufacturerDetailProps {
  data: ManufacturerDetailResponseDto;
  onNavigate: (type: EntityType, id: string) => void;
}

export const ManufacturerDetail: React.FC<ManufacturerDetailProps> = ({ data, onNavigate }) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge variant="manufacturer" size="sm">{t('detail.manufacturer', 'Toy maker')}</Badge>
            <span className="text-xs text-slate-500 font-medium">Est. {data.foundedYear}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 font-display">
            {data.name}
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {data.description}
          </p>

          <div className="flex flex-wrap items-center gap-5 pt-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-500" />
              {data.headquarters || data.country}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              {t('profile.provider', 'Founded in')} <strong>{data.foundedYear}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" />
              <strong>{data.linesProduced.length}</strong> {t('databank.tab_lines', 'Major lines produced')}
            </span>
          </div>
        </div>

        <div className="shrink-0 w-36 h-36 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950">
          <img
            src={getFigureImageUrl(data.imageUrl)}
            alt={data.name}
            onError={handleImageError}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* History & Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CbCard className="p-6 border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Factory className="w-4 h-4 text-indigo-500" />
            {t('detail.manufacturers', 'Corporate and manufacturing history')}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {data.history}
          </p>
        </CbCard>

        <CbCard className="p-6 border-slate-200 dark:border-slate-800 space-y-3 bg-indigo-50/40 dark:bg-indigo-950/10 border-indigo-500/20">
          <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {t('detail.collecting_impact', 'Historical impact on action figures')}
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {data.impactOnActionFigures}
          </p>
        </CbCard>
      </div>

      {/* Lines Produced */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-500" />
          {t('databank.tab_lines', 'Toy lines produced by')} {data.name}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.linesProduced.map(line => (
            <CbCard
              key={line.id}
              interactive
              cardbackStyle
              onClick={() => onNavigate('line', line.id)}
              className="group p-5 pt-8 hover:border-indigo-500/60 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="aspect-16/9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={getFigureImageUrl(line.imageUrl)}
                    alt={line.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <Badge variant="franchise" size="sm">{line.franchiseName}</Badge>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {line.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t('detail.year', 'Era')}: {line.startYear}{line.endYear ? `–${line.endYear}` : '–'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                <span>{t('detail.browse_catalogue', 'Explore line')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </CbCard>
          ))}
        </div>
      </div>
    </div>
  );
};
