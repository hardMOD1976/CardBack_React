import React, { useMemo, useState, useEffect } from 'react';
import { EntityType, FigureDetailResponseDto } from '../../types/domain';
import { ApiService } from '../../services/apiService';
import { FranchiseDetail } from './FranchiseDetail';
import { LineDetail } from './LineDetail';
import { CharacterDetail } from './CharacterDetail';
import { FigureDetail } from './FigureDetail';
import { VariantDetail } from './VariantDetail';
import { ProductReleaseDetail } from './ProductReleaseDetail';
import { ManufacturerDetail } from './ManufacturerDetail';
import { ChevronRight, ArrowLeft, Loader2, Database, Compass, Search } from 'lucide-react';
import { CbButton } from '../shared/CbButton';
import { useLanguage } from '../../contexts/LanguageContext';

interface TransversalDetailViewProps {
  target: {
    type: EntityType;
    id: string;
  };
  onNavigate: (type: EntityType, id: string) => void;
  onBack: () => void;
  onAddToCollection: (figure: FigureDetailResponseDto, variantId?: string, releaseId?: string) => void;
}

export const TransversalDetailView: React.FC<TransversalDetailViewProps> = ({
  target,
  onNavigate,
  onBack,
  onAddToCollection
}) => {
  const { t } = useLanguage();
  const { type, id } = target;

  // Immediate synchronous lookup from active memory store
  const syncEntity = useMemo(() => {
    return ApiService.getSyncEntityDetail(type, id);
  }, [type, id]);

  const [entityData, setEntityData] = useState<any>(syncEntity);
  const [isLoading, setIsLoading] = useState<boolean>(!syncEntity);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Sync / async fetch entity whenever target changes
  useEffect(() => {
    const direct = ApiService.getSyncEntityDetail(type, id);
    if (direct) {
      setEntityData(direct);
      setIsLoading(false);
      setFetchError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setFetchError(null);

    ApiService.fetchEntityDetail(type, id)
      .then(result => {
        if (!isMounted) return;
        if (result) {
          setEntityData(result);
          setFetchError(null);
        } else {
          setEntityData(null);
          setFetchError(t('detail.fetch_missing', 'Could not find the {{type}} record (ID: {{id}}).').replace('{{type}}', type).replace('{{id}}', id));
        }
      })
      .catch(err => {
        if (!isMounted) return;
        setEntityData(null);
        setFetchError(t('detail.fetch_error', 'Could not load this record.'));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [type, id]);

  // Compute breadcrumb path dynamically based on entity hierarchy
  const breadcrumbs = useMemo(() => {
    const crumbs: { label: string; action?: () => void }[] = [
      { label: t('detail.catalogue', 'Catalogue'), action: onBack }
    ];

    if (!entityData) return crumbs;

    if (type === 'franchise') {
      crumbs.push({ label: (entityData as any).name });
    } else if (type === 'manufacturer') {
      crumbs.push({ label: t('detail.manufacturers', 'Manufacturers') });
      crumbs.push({ label: (entityData as any).name });
    } else if (type === 'line') {
      const line = entityData as any;
      crumbs.push({
        label: line.franchiseName,
        action: () => onNavigate('franchise', line.franchiseId)
      });
      crumbs.push({ label: line.name });
    } else if (type === 'character') {
      const char = entityData as any;
      crumbs.push({
        label: char.franchiseName,
        action: () => onNavigate('franchise', char.franchiseId)
      });
      crumbs.push({ label: char.name });
    } else if (type === 'figure') {
      const fig = entityData as any;
      crumbs.push({
        label: fig.franchise?.name || 'Franquícia',
        action: () => onNavigate('franchise', (fig.franchise?.name || '').toLowerCase().replace(/\s+/g, '-'))
      });
      crumbs.push({
        label: fig.line?.name || 'Línia',
        action: () => onNavigate('line', fig.line?.id || 'line-default')
      });
      crumbs.push({ label: fig.name });
    } else if (type === 'variant') {
      const variant = entityData as any;
      crumbs.push({
        label: variant.associatedFigure?.lineName || 'Línia',
        action: () => onNavigate('figure', variant.associatedFigure?.id)
      });
      crumbs.push({
        label: variant.associatedFigure?.name || 'Figura',
        action: () => onNavigate('figure', variant.associatedFigure?.id)
      });
      crumbs.push({ label: variant.name });
    } else if (type === 'product_release') {
      const rel = entityData as any;
      crumbs.push({
        label: rel.lineName || 'Release'
      });
      crumbs.push({
        label: rel.parentFigure?.name || 'Figura',
        action: () => onNavigate('figure', rel.parentFigure?.id)
      });
      crumbs.push({ label: rel.name });
    }

    return crumbs;
  }, [type, entityData, onBack, onNavigate, t]);

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="w-48 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-80 aspect-3/4 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="w-3/4 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="w-1/2 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="pt-6 space-y-2">
              <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-5/6 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-4/6 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="pt-6 flex gap-3">
              <div className="w-36 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="w-36 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found / error state with helpful recovery actions
  if (!entityData) {
    return (
      <div className="p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm my-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <Database className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {t('detail.not_found_title', 'Catalogue record not found')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {fetchError || t('detail.not_found_body', 'No {{type}} record was found with this identifier:').replace('{{type}}', type)}
          </p>
          <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-mono text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {id}
          </div>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <CbButton variant="secondary" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
            {t('detail.back_previous', 'Back to previous view')}
          </CbButton>
          <CbButton 
            variant="amber" 
            onClick={() => onNavigate('figure', 'fig-sw-vader-potf2')}
            icon={<Compass className="w-4 h-4" />}
          >
            {t('detail.browse_catalogue', 'Browse the catalogue')}
          </CbButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Transversal Navigation Bar & Breadcrumb Hierarchy */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <CbButton
            variant="ghost"
            size="sm"
            onClick={onBack}
            icon={<ArrowLeft className="w-4 h-4" />}
            title={t('detail.back_previous', 'Back to previous view')}
          >
            {t('detail.back', 'Back')}
          </CbButton>

          <nav aria-label={t('detail.breadcrumb', 'Breadcrumb')} className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                {crumb.action && idx < breadcrumbs.length - 1 ? (
                  <button
                    type="button"
                    onClick={crumb.action}
                    className="hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className={idx === breadcrumbs.length - 1 ? 'font-bold text-slate-900 dark:text-slate-100' : ''}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {type.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Render matching Detail Component */}
      {type === 'franchise' && (
        <FranchiseDetail
          data={entityData as any}
          onNavigate={onNavigate}
        />
      )}

      {type === 'line' && (
        <LineDetail
          data={entityData as any}
          onNavigate={onNavigate}
          onAddFigureToCollection={async (figId) => {
            let fig = ApiService.getFigureDetail(figId);
            if (!fig) {
              fig = await ApiService.fetchEntityDetail('figure', figId);
            }
            if (fig) onAddToCollection(fig);
          }}
        />
      )}

      {type === 'character' && (
        <CharacterDetail
          data={entityData as any}
          onNavigate={onNavigate}
        />
      )}

      {type === 'figure' && (
        <FigureDetail
          data={entityData as any}
          onNavigate={onNavigate}
          onAddToCollection={(fig) => onAddToCollection(fig)}
        />
      )}

      {type === 'variant' && (
        <VariantDetail
          data={entityData as any}
          onNavigate={onNavigate}
          onAddToCollection={async (figId: string, varId: string) => {
            let fig = ApiService.getFigureDetail(figId);
            if (!fig) {
              fig = await ApiService.fetchEntityDetail('figure', figId);
            }
            if (fig) onAddToCollection(fig, varId);
          }}
        />
      )}

      {type === 'product_release' && (
        <ProductReleaseDetail
          data={entityData as any}
          onNavigate={onNavigate}
          onAddToCollection={async (figId: string, varId?: string, relId?: string) => {
            let fig = ApiService.getFigureDetail(figId);
            if (!fig) {
              fig = await ApiService.fetchEntityDetail('figure', figId);
            }
            if (fig) onAddToCollection(fig, varId, relId);
          }}
        />
      )}

      {type === 'manufacturer' && (
        <ManufacturerDetail
          data={entityData as any}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};
