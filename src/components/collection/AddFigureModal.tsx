import React, { useState, useEffect } from 'react';
import { FigureDetailResponseDto, FigureCondition, OwnedFigure } from '../../types/domain';
import { CbInput } from '../shared/CbInput';
import { CbButton } from '../shared/CbButton';
import { Badge } from '../shared/Badge';
import { handleImageError, getFigureImageUrl } from '../../utils/imageFallback';
import { X, BookmarkPlus, DollarSign, Calendar, MapPin, FileText, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface AddFigureModalProps {
  figure: FigureDetailResponseDto | null;
  selectedVariantId?: string;
  selectedReleaseId?: string;
  initialData?: OwnedFigure | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<OwnedFigure, 'id' | 'addedAt'>) => void;
}

export const AddFigureModal: React.FC<AddFigureModalProps> = ({
  figure,
  selectedVariantId,
  selectedReleaseId,
  initialData,
  isOpen,
  onClose,
  onSave
}) => {
  const { t } = useLanguage();
  const [condition, setCondition] = useState<FigureCondition>(initialData?.condition || 'MOC');
  const [gradingScore, setGradingScore] = useState(initialData?.gradingScore || '');
  const [purchasePrice, setPurchasePrice] = useState<number>(initialData?.purchasePrice || 0);
  const [estimatedValue, setEstimatedValue] = useState<number>(initialData?.estimatedValue || 50);
  const [currency, setCurrency] = useState(initialData?.currency || 'USD');
  const [acquisitionDate, setAcquisitionDate] = useState(
    initialData?.acquisitionDate || new Date().toISOString().split('T')[0]
  );
  const [quantity, setQuantity] = useState<number>(initialData?.quantity || 1);
  const [storageLocation, setStorageLocation] = useState(initialData?.storageLocation || 'Main Display Shelf');
  const [collectorNotes, setCollectorNotes] = useState(initialData?.collectorNotes || '');
  const [isWishlist, setIsWishlist] = useState<boolean>(initialData?.isWishlist || false);
  const [variantId, setVariantId] = useState<string>(selectedVariantId || initialData?.variantId || '');
  const [releaseId, setReleaseId] = useState<string>(selectedReleaseId || initialData?.productReleaseId || '');

  useEffect(() => {
    if (!isOpen) return;
    setCondition(initialData?.condition || 'MOC');
    setGradingScore(initialData?.gradingScore || '');
    setPurchasePrice(initialData?.purchasePrice || 0);
    setEstimatedValue(initialData?.estimatedValue || 50);
    setCurrency(initialData?.currency || 'USD');
    setAcquisitionDate(initialData?.acquisitionDate || new Date().toISOString().split('T')[0]);
    setQuantity(initialData?.quantity || 1);
    setStorageLocation(initialData?.storageLocation || 'Main Display Shelf');
    setCollectorNotes(initialData?.collectorNotes || '');
    setIsWishlist(initialData?.isWishlist || false);
    setVariantId(selectedVariantId || initialData?.variantId || '');
    setReleaseId(selectedReleaseId || initialData?.productReleaseId || '');
  }, [isOpen, initialData, selectedVariantId, selectedReleaseId, figure?.id]);

  if (!isOpen || (!figure && !initialData)) return null;

  const fig = figure || {
    id: initialData?.figureId || '',
    name: initialData?.figureName || '',
    code: initialData?.figureCode,
    imageUrl: initialData?.figureImageUrl || '',
    line: { id: initialData?.lineId || '', name: initialData?.lineName || '' },
    franchise: { name: initialData?.franchiseName || '' },
    variants: [],
    productReleases: []
  };

  const activeVariant = fig.variants.find(v => v.id === variantId);
  const activeRelease = fig.productReleases.find(r => r.id === releaseId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      userId: 'user-collector-1',
      figureId: fig.id,
      figureName: fig.name,
      figureCode: fig.code,
      figureImageUrl: fig.imageUrl,
      lineId: fig.line.id,
      lineName: fig.line.name,
      franchiseId: fig.franchise.name.toLowerCase().replace(/\s+/g, '-'),
      franchiseName: fig.franchise.name,
      variantId: variantId || undefined,
      variantName: activeVariant?.name || initialData?.variantName,
      productReleaseId: releaseId || undefined,
      releasePackaging: activeRelease?.packagingType || initialData?.releasePackaging,
      condition,
      gradingScore: condition === 'GRADED' ? gradingScore : undefined,
      purchasePrice: Number(purchasePrice) || 0,
      currency,
      estimatedValue: Number(estimatedValue) || 0,
      acquisitionDate,
      quantity: Number(quantity) || 1,
      storageLocation,
      collectorNotes,
      isWishlist
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookmarkPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {initialData ? t('collection.edit_record', 'Edit collection record') : t('collection.add_btn', 'Add to collection')}
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                {fig.name} • {fig.line.name}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Figure Banner */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <img
              src={getFigureImageUrl(fig.imageUrl)}
              alt={fig.name}
              onError={handleImageError}
              className="w-12 h-12 rounded-md object-cover border border-slate-300 dark:border-slate-600"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{fig.name}</h4>
              <p className="text-[11px] text-slate-500 truncate">{fig.line.name} ({fig.franchise.name})</p>
            </div>
          </div>

          {/* Condition Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              {t('propose.condition', 'Item condition')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'MOC', label: t('propose.cond_moc', 'Mint on Card (MOC)') },
                { id: 'LOOSE_COMPLETE', label: t('propose.cond_loose_comp', 'Loose complete') },
                { id: 'LOOSE_INCOMPLETE', label: t('propose.cond_loose_incomp', 'Loose incomplete') },
                { id: 'GRADED', label: t('propose.cond_opt_graded', 'Professionally graded') }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCondition(opt.id as any)}
                  className={`p-2 rounded-lg text-xs font-semibold text-center border transition-all cursor-pointer ${
                    condition === opt.id
                      ? 'border-amber-500 bg-amber-500/15 text-amber-800 dark:text-amber-300 ring-1 ring-amber-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grading Score if Graded */}
          {condition === 'GRADED' && (
            <div className="space-y-1 animate-fadeIn">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {t('collection.grading_certificate', 'Grading certificate and score (e.g. AFA 85, UKG 80, CAS 85+)')}
              </label>
              <CbInput
                value={gradingScore}
                onChange={setGradingScore}
                placeholder={t('collection.grading_placeholder', 'AFA 85 (NM+)')}
                size="sm"
              />
            </div>
          )}

          {/* Associated Variant Selection */}
          {fig.variants && fig.variants.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                {t('collection.variant_specification', 'Catalogued variant')}
              </label>
              <select
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-amber-500"
              >
                <option value="">{t('collection.standard_variant', 'Standard / general casting')}</option>
                {fig.variants.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.distinguishingFeature})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Financials: Purchase Price & Estimated Value */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> {t('collection.purchase_price', 'Purchase price ($)')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> {t('collection.estimated_value', 'Estimated value ($)')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-slate-100 font-mono font-bold"
              />
            </div>
          </div>

          {/* Storage Location & Quantity */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {t('collection.storage_location', 'Storage / display location')}
              </label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder={t('collection.storage_placeholder', 'Display shelf 1, acrylic case A...')}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {t('collection.quantity', 'Quantity')}
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-slate-100 text-center font-mono font-semibold"
              />
            </div>
          </div>

          {/* Wishlist toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {t('collection.wishlist_toggle', 'Wishlist item')}
              </span>
              <span className="text-[11px] text-slate-500">
                {t('collection.wishlist_help', 'Track as an item you do not own yet')}
              </span>
            </div>
            <input
              type="checkbox"
              checked={isWishlist}
              onChange={(e) => setIsWishlist(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
          </div>

          {/* Collector Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> {t('collection.notes_provenance', 'Collector notes and provenance')}
            </label>
            <textarea
              rows={2}
              value={collectorNotes}
              onChange={(e) => setCollectorNotes(e.target.value)}
              placeholder={t('collection.notes_placeholder', 'Flawless bubble, unpunched card, bought from the original owner...')}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-amber-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <CbButton variant="outline" size="sm" type="button" onClick={onClose}>
              {t('propose.cancel', 'Cancel')}
            </CbButton>
            <CbButton variant="amber" size="sm" type="submit" icon={<Check className="w-4 h-4" />}>
              {t('collection.save_record', 'Save to collection')}
            </CbButton>
          </div>
        </form>
      </div>
    </div>
  );
};
