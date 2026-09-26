import React from 'react';
import { VariantDetailResponseDto, EntityType } from '../../types/domain';
import { CbCard } from '../shared/CbCard';
import { Badge } from '../shared/Badge';
import { CbButton } from '../shared/CbButton';
import { handleImageError, getFigureImageUrl } from '../../utils/imageFallback';
import { 
  Sparkles, 
  HelpCircle, 
  Search, 
  Globe, 
  Package, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  Tag, 
  Camera,
  BookmarkPlus
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface VariantDetailProps {
  data: VariantDetailResponseDto;
  onNavigate: (type: EntityType, id: string) => void;
  onAddToCollection?: (figureId: string, variantId: string) => void;
}

export const VariantDetail: React.FC<VariantDetailProps> = ({
  data,
  onNavigate,
  onAddToCollection
}) => {
  const { t } = useLanguage();
  const rarityColors = {
    Common: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
    Uncommon: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    Rare: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold',
    Grail: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 font-extrabold animate-pulse',
    'Proto / Error': 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40'
  }[data.rarityLevel] || 'bg-slate-100 text-slate-700';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-80 shrink-0 space-y-3">
            <CbCard cardbackStyle className="p-4 pt-7 aspect-square bg-slate-950/5 dark:bg-slate-950 flex items-center justify-center">
              <img
                src={getFigureImageUrl(data.imageUrl)}
                alt={data.name}
                onError={handleImageError}
                className="w-full h-full object-contain drop-shadow-xl"
              />
            </CbCard>

            {onAddToCollection && (
              <CbButton
                variant="amber"
                size="md"
                className="w-full font-bold"
                icon={<BookmarkPlus className="w-4 h-4" />}
                onClick={() => onAddToCollection(data.associatedFigure.id, data.id)}
              >
                {t('detail.track_variant', 'Track this variant in your collection')}
              </CbButton>
            )}
          </div>

          <div className="flex-1 space-y-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
              <Badge variant="variant" size="sm">{t('detail.catalogue_variant', 'Catalogue variant')}</Badge>
                <span className={`text-xs px-2.5 py-0.5 rounded-md border ${rarityColors}`}>
                  {t('detail.rarity', 'Rarity')}: {data.rarityLevel}
                </span>
                <span className="text-xs text-slate-500">
                  {t('detail.part_of', 'Part of')} {data.associatedFigure.franchiseName}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-slate-100 font-display">
                {data.name}
              </h1>

              {/* Associated Figure Link */}
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 pt-1">
                <span>{t('detail.associated_figure', 'Associated figure')}:</span>
                <button
                  type="button"
                  onClick={() => onNavigate('figure', data.associatedFigure.id)}
                  className="font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 focus:outline-none"
                >
                  {data.associatedFigure.name} ({data.associatedFigure.lineName})
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Distinguishing Characteristics Banner */}
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-500/30 text-rose-950 dark:text-rose-200">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
                {t('detail.distinguishing_feature', 'Key distinguishing physical feature')}
              </span>
              <p className="text-sm font-medium leading-relaxed">
                {data.distinguishingFeature}
              </p>
            </div>

            {/* Specific Accessories */}
            {data.accessoriesSpecific && data.accessoriesSpecific.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('detail.variant_accessories', 'Variant-specific accessories and molds')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.accessoriesSpecific.map((acc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                      {acc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collector Questions: What Makes This Special & How To Identify */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CbCard className="p-6 border-slate-200 dark:border-slate-800 space-y-3 bg-amber-50/40 dark:bg-amber-950/10 border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>{t('detail.why_matters', 'Why does this variant matter to collectors?')}</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {data.whyItMatters}
          </p>
        </CbCard>

        <CbCard className="p-6 border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50 dark:bg-slate-800/40 border-slate-300/80 dark:border-slate-700">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
            <Search className="w-4 h-4 text-emerald-500" />
            <span>{t('detail.how_to_identify', 'How can I authenticate and identify it?')}</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {data.identificationGuide}
          </p>
        </CbCard>
      </div>

      {/* Historical Distribution & Appearance */}
      <CbCard className="p-6 border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
          <Globe className="w-4 h-4 text-blue-500" />
          <span>{t('detail.historical_distribution', 'Historical distribution and factory batches')}</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {data.historicalDistributionNotes}
        </p>
        {data.firstAppearanceContext && (
          <div className="pt-2 text-xs text-slate-500">
            <strong>{t('detail.first_appearance', 'First appearance run')}:</strong> {data.firstAppearanceContext}
          </div>
        )}
      </CbCard>

      {/* Product Releases Containing This Variant */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-500" />
              {t('detail.releases_with_variant', 'Product releases containing this variant')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('detail.verified_packages', 'Commercial packages verified to include this variation')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.releasesContainingVariant.map(rel => (
            <CbCard
              key={rel.id}
              interactive
              cardbackStyle
              onClick={() => onNavigate('product_release', rel.id)}
              className="group p-4 pt-7 hover:border-cyan-500/60 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img
                    src={getFigureImageUrl(rel.imageUrl)}
                    alt={rel.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <Badge variant="product_release" size="sm">{rel.packagingType}</Badge>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1.5 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {rel.name}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                    <span>{t('detail.region', 'Region')}: {rel.region}</span>
                    <span>{t('detail.year', 'Year')}: {rel.releaseYear}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
                <span>{t('detail.view_packaging', 'View packaging details')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </CbCard>
          ))}
        </div>
      </div>
    </div>
  );
};
