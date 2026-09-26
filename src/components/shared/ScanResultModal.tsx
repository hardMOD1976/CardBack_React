import React, { useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { FigureDetailResponseDto, ProductReleaseDetailResponseDto } from '../../types/domain';
import { CbButton } from './CbButton';
import { Badge } from './Badge';
import { getFigureImageUrl, handleImageError } from '../../utils/imageFallback';
import { 
  Barcode, 
  Cpu, 
  Sparkles, 
  Eye, 
  Plus, 
  X, 
  CheckCircle2, 
  PackageX, 
  DollarSign, 
  Layers,
  Calendar,
  Building2,
  Tag
} from 'lucide-react';

export interface ScanResultOption {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  packagingStatus?: string;
  estimatedMocValue?: number;
  estimatedLooseValue?: number;
}

export interface ScanResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'barcode' | 'ai';
  // Identified Figure Data
  figure: FigureDetailResponseDto | null;
  release?: ProductReleaseDetailResponseDto | null;
  variantId?: string;
  releaseId?: string;
  barcode?: string | null;
  confidence?: number;
  packagingStatus?: string;
  variantName?: string;
  marketValueLoose?: number;
  marketValueMoc?: number;
  accessories?: string[];
  moldingDetails?: string;

  // Multiple referenced options (if any)
  options?: ScanResultOption[];
  selectedOptionId?: string | null;
  onSelectOption?: (optionId: string) => void;

  // Not Found State
  isNotFound?: boolean;
  notFoundSubject?: string;
  notFoundReason?: string;
  notFoundMessage?: string;

  // The 3 required actions
  onGoToFigureDetail: () => void;
  onAddToCollection: () => void;
  onCancel: () => void;
}

export const ScanResultModal: React.FC<ScanResultModalProps> = ({
  isOpen,
  onClose,
  mode,
  figure,
  release,
  variantId,
  releaseId,
  barcode,
  confidence,
  packagingStatus,
  variantName,
  marketValueLoose,
  marketValueMoc,
  accessories = [],
  moldingDetails,
  options = [],
  selectedOptionId,
  onSelectOption,
  isNotFound = false,
  notFoundSubject,
  notFoundReason,
  notFoundMessage,
  onGoToFigureDetail,
  onAddToCollection,
  onCancel
}) => {
  const { t } = useLanguage();
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const displayImage = release?.imageUrl || figure?.imageUrl || '/cardback_placeholder.jpeg';
  const displayTitle = figure?.name || release?.name || t('ai.identification', 'Identified figure');
  const displayLine = figure?.line?.name || release?.lineName || t('nav.collection', 'General collection');
  const displayFranchise = figure?.franchise?.name || release?.franchiseName || 'Action Figures';
  const displayManufacturer = figure?.line?.manufacturerName || 'Kenner / Hasbro';
  const displayYear = release?.releaseYear || figure?.year || 1985;
  const displayPackaging = packagingStatus || release?.packagingType || 'Carded Blister (MOC)';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-6 transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isNotFound
                ? 'bg-rose-500/10 text-rose-500'
                : mode === 'barcode' 
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
            }`}>
              {isNotFound ? (
                <PackageX className="w-5 h-5" />
              ) : mode === 'barcode' ? (
                <Barcode className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 id="modal-headline" className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-display">
                {isNotFound
                  ? t('ai.not_found_title', 'No catalogue match')
                  : mode === 'barcode'
                    ? t('nav.scan_barcode', 'Barcode scan results')
                    : t('ai.results_modal', 'AI identification results')
                }
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isNotFound
                  ? t('ai.non_toy', 'This item is not a catalogued collectible')
                  : mode === 'barcode'
                    ? t('scanner.release_record', 'Code checked against the packaging catalogue')
                    : t('ai.identification', 'Image analysis and figure identification')
                }
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label={t('common.close', 'Close dialog')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {isNotFound ? (
            /* NOT FOUND VIEW */
            <div className="p-5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
                <PackageX className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-rose-950 dark:text-rose-100">
                  {t('ai.not_found_title', 'Item not found in the catalogue')}
                </h3>
                <p className="text-xs text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
                  {notFoundMessage || t('ai.non_toy', 'No matching collectible figure or toy was found.')}
                </p>
              </div>

              {notFoundSubject && (
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 text-left text-xs space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {t('ai.detected_subject', 'Detected subject')}: <span className="font-bold text-rose-600 dark:text-rose-400">{notFoundSubject}</span>
                  </div>
                  {notFoundReason && (
                    <div className="text-slate-600 dark:text-slate-400">
                      {t('ai.reason', 'Reason')}: {notFoundReason}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* FOUND FIGURE VIEW */
            <>
              {/* Success Notification Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{t('scanner.product_detected', 'Figure found and verified')}</span>
                </div>
                {confidence !== undefined && (
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {confidence.toFixed(1)}%
                  </span>
                )}
              </div>

              {/* Main Identified Item Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex flex-col sm:flex-row gap-4">
                {/* Visual Thumbnail */}
                <div className="w-full sm:w-28 h-36 sm:h-auto rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 shrink-0 flex items-center justify-center">
                  <img
                    src={getFigureImageUrl(displayImage)}
                    alt={displayTitle}
                    onError={handleImageError}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details Meta */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {displayFranchise}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {t('detail.year', 'Year')} {displayYear}
                    </span>
                    {barcode && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                        UPC {barcode}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-display leading-tight truncate">
                    {displayTitle}
                  </h3>

                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                    <p className="truncate">
                      {t('nav.lines', 'Line')}: <strong className="text-slate-800 dark:text-slate-200">{displayLine}</strong>
                    </p>
                    <p className="truncate">
                      Fabricant: <strong className="text-slate-800 dark:text-slate-200">{displayManufacturer}</strong>
                    </p>
                    <p className="truncate">
                      {t('scanner.packaging', 'Packaging')} / {t('propose.condition', 'Condition')}: <strong className="text-slate-800 dark:text-slate-200">{displayPackaging}</strong>
                    </p>
                  </div>

                  {/* Market Value summary */}
                  {(marketValueLoose !== undefined || marketValueMoc !== undefined) && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 flex items-center gap-3 text-xs font-mono font-bold">
                      {marketValueLoose !== undefined && (
                        <span className="text-slate-600 dark:text-slate-400">
                          Loose: <strong className="text-slate-900 dark:text-slate-100">${marketValueLoose}</strong>
                        </span>
                      )}
                      {marketValueMoc !== undefined && (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          MOC: <strong>${marketValueMoc}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Multiple Options Selector (if multiple matching candidates found) */}
              {options.length > 1 && onSelectOption && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                          <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      Altres opcions trobades a Internet ({options.length})
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {t('ai.options_found', 'Select an option')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {options.map((opt) => {
                      const isSelected = selectedOptionId === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => onSelectOption(opt.id)}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/10 shadow-xs ring-1 ring-blue-500/30'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                              {opt.title}
                            </span>
                            {isSelected && (
                              <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded shrink-0">
                                {t('ai.active', 'Active')}
                              </span>
                            )}
                          </div>
                          {opt.subtitle && (
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {opt.subtitle}
                            </p>
                          )}
                          {opt.estimatedMocValue && (
                            <div className="mt-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                              MOC: ${opt.estimatedMocValue}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Molding & Accessories Details (if present) */}
              {moldingDetails && (
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold block text-slate-800 dark:text-slate-200 mb-0.5">
                    {t('ai.authentic_accessories', 'Mold and authenticity check')}:
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {moldingDetails}
                  </p>
                </div>
              )}

              {accessories.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('ai.authentic_accessories', 'Identified accessories')}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {accessories.map((acc, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        ✓ {acc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Action Buttons Footer (Offering the 3 explicit requested actions) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          {/* Action 3: Cancel·lar */}
          <CbButton
            variant="outline"
            size="sm"
            onClick={onCancel}
            icon={<X className="w-3.5 h-3.5" />}
            className="order-3 sm:order-1"
          >
            {t('common.cancel', 'Cancel')}
          </CbButton>

          {!isNotFound && (
            <>
              {/* Action 1: Anar a fitxa detall de figura */}
              <CbButton
                variant="outline"
                size="sm"
                icon={<Eye className="w-3.5 h-3.5" />}
                onClick={onGoToFigureDetail}
                className="order-2"
              >
                {t('detail.browse_catalogue', 'Open figure details')}
              </CbButton>

              {/* Action 2: Afegir a col·lecció */}
              <CbButton
                variant="amber"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={onAddToCollection}
                className="order-1 sm:order-3 shadow-sm font-semibold"
              >
                {t('collection.add_btn', 'Add to collection')}
              </CbButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
