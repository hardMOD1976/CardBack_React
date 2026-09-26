import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ProductReleaseDetailResponseDto, EntityType } from '../../types/domain';
import { CbCard } from '../shared/CbCard';
import { Badge } from '../shared/Badge';
import { CbButton } from '../shared/CbButton';
import { handleImageError, getFigureImageUrl } from '../../utils/imageFallback';
import { 
  Barcode, 
  Globe2, 
  Store, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  Package, 
  Layers,
  BookmarkPlus
} from 'lucide-react';

interface ProductReleaseDetailProps {
  data: ProductReleaseDetailResponseDto;
  onNavigate: (type: EntityType, id: string) => void;
  onAddToCollection?: (figureId: string, variantId?: string, releaseId?: string) => void;
}

export const ProductReleaseDetail: React.FC<ProductReleaseDetailProps> = ({
  data,
  onNavigate,
  onAddToCollection
}) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Packaging Imagery */}
          <div className="w-full lg:w-80 shrink-0 space-y-3">
            <CbCard cardbackStyle className="p-4 pt-7 aspect-3/4 bg-slate-950/5 dark:bg-slate-950 flex items-center justify-center">
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
                onClick={() => onAddToCollection(data.parentFigure.id, data.associatedVariant.id, data.id)}
              >
                {t('detail.track_variant', 'Track this release')}
              </CbButton>
            )}
          </div>

          {/* Metadata & Specifications */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="product_release" size="sm">{t('detail.packaging_releases', 'Commercial release')}</Badge>
                <span className="text-xs px-2.5 py-0.5 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  {data.packagingType}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {data.region} ({data.releaseYear})
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-slate-100 font-display">
                {data.name}
              </h1>

              {/* Hierarchy Context */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                <span>{t('detail.catalogue', 'Catalogue context')}:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{data.franchiseName}</span>
                <span>›</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{data.lineName}</span>
                <span>›</span>
                <button
                  type="button"
                  onClick={() => onNavigate('figure', data.parentFigure.id)}
                  className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  {data.parentFigure.name}
                </button>
              </div>
            </div>

            {/* Commercial Packaging Specification Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-500 flex items-center gap-1 mb-0.5">
                  <Package className="w-3.5 h-3.5" /> {t('detail.packaging_releases', 'Packaging format')}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{data.packagingType}</span>
              </div>

              <div>
                <span className="text-slate-500 flex items-center gap-1 mb-0.5">
                  <Globe2 className="w-3.5 h-3.5" /> {t('detail.region', 'Distribution region')}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{data.region} ({data.language})</span>
              </div>

              <div>
                <span className="text-slate-500 flex items-center gap-1 mb-0.5">
                  <Store className="w-3.5 h-3.5" /> {t('detail.region', 'Retailer exclusivity')}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {data.retailerExclusivity || t('detail.region', 'General retail')}
                </span>
              </div>

              <div>
                <span className="text-slate-500 flex items-center gap-1 mb-0.5">
                  <Calendar className="w-3.5 h-3.5" /> {t('detail.year', 'Commercial date')}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{data.releaseDate}</span>
              </div>

              {data.barcode && (
                <div>
                  <span className="text-slate-500 flex items-center gap-1 mb-0.5">
                    <Barcode className="w-3.5 h-3.5" /> UPC
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{data.barcode}</span>
                </div>
              )}

              {data.assortmentNumber && (
                <div>
                  <span className="text-slate-500 flex items-center gap-1 mb-0.5">
                    {t('scanner.assortment_sku', 'Assortment number')}
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{data.assortmentNumber}</span>
                </div>
              )}
            </div>

            {/* Packaging Collector Notes */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('detail.packaging_description', 'Packaging analysis and reverse cardback layout')}
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                {data.collectorNotes}
              </p>
            </div>

            {/* Associated Variant Callout */}
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="variant" size="sm">{t('detail.catalogue_variant', 'Contained variant')}</Badge>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {data.associatedVariant.name}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {data.associatedVariant.distinguishingFeature}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('variant', data.associatedVariant.id)}
                className="shrink-0 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 focus:outline-none"
              >
                {t('detail.variant_analysis', 'Explore variant')} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
