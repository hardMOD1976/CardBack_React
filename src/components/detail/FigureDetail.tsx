import React from 'react';
import { FigureDetailResponseDto, EntityType } from '../../types/domain';
import { CbCard } from '../shared/CbCard';
import { Badge } from '../shared/Badge';
import { CbButton } from '../shared/CbButton';
import { handleImageError, getFigureImageUrl } from '../../utils/imageFallback';
import { 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Package, 
  BookmarkPlus, 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  Tag, 
  Box
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FigureDetailProps {
  data: FigureDetailResponseDto;
  onNavigate: (type: EntityType, id: string) => void;
  onAddToCollection: (figure: FigureDetailResponseDto, variantId?: string, releaseId?: string) => void;
  isOwned?: boolean;
}

export const FigureDetail: React.FC<FigureDetailProps> = ({
  data,
  onNavigate,
  onAddToCollection,
  isOwned = false
}) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Visual Image & Card Frame */}
          <div className="w-full lg:w-80 shrink-0 space-y-3">
            <CbCard cardbackStyle className="p-4 pt-7 aspect-3/4 bg-slate-950/5 dark:bg-slate-950 flex items-center justify-center">
              <img
                src={getFigureImageUrl(data.imageUrl)}
                alt={data.name}
                onError={handleImageError}
                className="w-full h-full object-contain drop-shadow-xl"
              />
            </CbCard>

            <div className="flex gap-2">
              <CbButton
                variant={isOwned ? 'secondary' : 'amber'}
                size="md"
                className="w-full font-bold"
                icon={<BookmarkPlus className="w-4 h-4" />}
                onClick={() => onAddToCollection(data)}
              >
                {isOwned ? t('collection.in_collection', 'In your collection') : t('collection.add_btn', 'Add to collection')}
              </CbButton>
            </div>
          </div>

          {/* Details Content */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('franchise', data.franchise.name.toLowerCase().replace(/\s+/g, '-'))}
                  className="hover:underline focus:outline-none"
                >
                  <Badge variant="franchise" size="sm">{data.franchise.name}</Badge>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('line', data.line.id)}
                  className="hover:underline focus:outline-none"
                >
                  <Badge variant="line" size="sm">{data.line.name}</Badge>
                </button>
                {data.code && (
                  <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                    {data.code}
                  </span>
                )}
                <span className="text-xs text-slate-500 font-semibold">{data.year} Release</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-slate-100 font-display">
                {data.name}
              </h1>

              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                {data.description}
              </p>
            </div>

            {/* Sculpt Specs & Articulation */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs">
              <div>
                  <span className="text-slate-500 block">{t('detail.manufacturer', 'Manufacturer')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{data.line.manufacturerName}</span>
              </div>
              <div>
                  <span className="text-slate-500 block">{t('detail.scale', 'Scale')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{data.line.scale || '3.75"'}</span>
              </div>
              <div>
                  <span className="text-slate-500 block">{t('detail.articulation', 'Articulation')}</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400 font-mono">
                  {data.articulationPoints} POA (Points of Articulation)
                </span>
              </div>
            </div>

            {/* Accessories Checklist */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('detail.original_accessories', 'Original included accessories')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.originalAccessories.map((acc, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {acc}
                  </span>
                ))}
              </div>
            </div>

            {/* Contextual Character Lore Callout */}
            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 flex items-start gap-4">
              <img
                src={getFigureImageUrl(data.character.imageUrl)}
                alt={data.character.name}
                onError={handleImageError}
                className="w-14 h-14 rounded-full object-cover border-2 border-purple-500 shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold text-purple-600 dark:text-purple-400">
                {t('detail.lore_context', 'Fictional background')}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('character', data.character.id)}
                    className="text-xs font-semibold text-purple-700 dark:text-purple-300 hover:underline inline-flex items-center gap-1 focus:outline-none"
                  >
                    View {data.character.name} Character Page <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {data.character.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Variants Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
                {t('detail.figure_variants', 'Catalogue variants and distinguishing features')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {t('detail.variant_description', 'Catalogue entries describing molds, paint revisions, and rare variants')}
            </p>
          </div>
        </div>

        {data.variants && data.variants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.variants.map(v => (
              <CbCard
                key={v.id}
                interactive
                onClick={() => onNavigate('variant', v.id)}
                className="group p-5 hover:border-rose-500/60 flex gap-4 items-start"
              >
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                  <img
                    src={getFigureImageUrl(v.imageUrl)}
                    alt={v.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="variant" size="sm">{t('detail.catalogue_variant', 'Variant')}</Badge>
                    {v.isRare && (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide bg-rose-500/10 px-2 py-0.5 rounded">
                    {t('detail.high_value', 'High collector value')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {v.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>{t('detail.differentiator', 'Distinguishing feature')}:</strong> {v.distinguishingFeature}
                  </p>
                  <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform">
                    <span>{t('detail.variant_analysis', 'Variant analysis and identification')}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </CbCard>
            ))}
          </div>
        ) : (
          <CbCard className="p-8 text-center text-slate-500">
                {t('detail.no_variants', 'No major casting variants have been recorded for this release yet.')}
          </CbCard>
        )}
      </div>

      {/* Commercial Product Releases */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-500" />
              {t('detail.packaging_releases', 'Commercial packaging releases')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('detail.packaging_description', 'Boxed, carded, regional, and retailer-exclusive packaging versions')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.productReleases.map(rel => (
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
                  {rel.barcode && (
                    <span className="font-mono text-[10px] text-slate-400 block mt-1">
                    UPC: {rel.barcode}
                    </span>
                  )}
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
