import React, { useState } from 'react';
import { CbCard } from '../shared/CbCard';
import { CbButton } from '../shared/CbButton';
import { 
  PlusCircle, 
  UploadCloud, 
  Check, 
  AlertCircle, 
  X, 
  Sparkles, 
  Film, 
  Tag, 
  Calendar, 
  Barcode, 
  FileText,
  ShieldCheck,
  BookmarkCheck,
  Heart,
  Eye
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ApiService } from '../../services/apiService';
import { CollectionService } from '../../services/collectionService';
import { FigureCondition } from '../../types/domain';

interface ProposeFigureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function mapToFigureCondition(cond: string): FigureCondition {
  if (cond === 'MOC' || cond === 'MIB' || cond === 'CARDED_DAMAGED') return 'MOC';
  if (cond === 'LOOSE_COMPLETE') return 'LOOSE_COMPLETE';
  if (cond === 'LOOSE_INCOMPLETE' || cond === 'LOOSE_PLAYED') return 'LOOSE_INCOMPLETE';
  if (cond === 'GRADED') return 'GRADED';
  return 'CUSTOM';
}

const AVAILABLE_LINES = [
  { id: 'line-sw-vintage', name: 'Vintage Star Wars Kenner (1977–1985)' },
  { id: 'line-sw-potf-1985', name: 'The Power of the Force - Coin Line (1985)' },
  { id: 'line-sw-potf2', name: 'The Power of the Force 2 (1995–2000)' },
  { id: 'line-sw-ep1', name: 'Episode I: The Phantom Menace (1999)' },
  { id: 'line-sw-aotc', name: 'Episode II: Attack of the Clones - Blue Card (2002–2004)' },
  { id: 'line-sw-votc', name: 'Vintage Original Trilogy Collection / VOTC (2004)' },
  { id: 'line-sw-tac', name: '30th Anniversary Collection / TAC (2007)' },
  { id: 'line-sw-tvc', name: 'The Vintage Collection / TVC (2010–Present)' },
  { id: 'line-sw-tbs', name: 'The Black Series 6" (2013–Present)' },
  { id: 'line-sw-retro', name: 'Retro Collection (2019–Present)' },
  { id: 'line-sw-mandalorian', name: 'The Mandalorian Line (2019–Present)' },
  { id: 'line-sw-boba-fett', name: 'The Book of Boba Fett Line (2021–Present)' },
  { id: 'line-sw-andor', name: 'Andor Line (2022–Present)' },
  { id: 'line-sw-ahsoka', name: 'Ahsoka Line (2023–Present)' },
  { id: 'line-sw-skeleton-crew', name: 'Skeleton Crew Line (2024–Present)' },
  { id: 'line-motu-vintage', name: 'Masters of the Universe Vintage' },
  { id: 'line-tmnt-1988', name: 'TMNT Vintage (1988)' }
];

export const ProposeFigureModal: React.FC<ProposeFigureModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [lineId, setLineId] = useState('line-sw-tvc');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [ownershipStatus, setOwnershipStatus] = useState<'OWNED' | 'WISHLIST' | 'NONE'>('OWNED');
  const [condition, setCondition] = useState('MOC');
  const [conditionDetails, setConditionDetails] = useState('');
  const [barcode, setBarcode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert local user file to base64 data URI so it embeds into database
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage(t('propose.error', 'Cal indicar com a mínim el nom de la figura.'));
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        name: name.trim(),
        characterName: characterName.trim() || name.trim(),
        lineId,
        year: parseInt(year, 10) || new Date().getFullYear(),
        condition,
        conditionDetails: conditionDetails.trim() || undefined,
        barcode: barcode.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        description: description.trim() || undefined,
        userNotes: userNotes.trim() || undefined
      };

      const res = await fetch('/api/catalog/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cb_token') || ''}` },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar la proposta de figura.');
      }

      // Register immediately in frontend memory store for instant catalog lookup & match
      let registeredFig: any = null;
      if (data.figure) {
        registeredFig = ApiService.registerCommunityProposal({
          ...data.figure,
          characterName: characterName.trim() || name.trim(),
          condition,
          conditionDetails: conditionDetails.trim() || undefined,
          description: description.trim() || undefined
        });
      }

      // Automatically add to personal user collection or wishlist if selected
      const targetFig = registeredFig || data.figure;
      if (targetFig && (ownershipStatus === 'OWNED' || ownershipStatus === 'WISHLIST')) {
        const lineObj = AVAILABLE_LINES.find(l => l.id === lineId);
        CollectionService.addFigure({
          userId: 'user-collector-1',
          figureId: targetFig.id,
          figureName: targetFig.name || name.trim(),
          figureCode: targetFig.code || (barcode ? `BC-${barcode.slice(-6)}` : undefined),
          figureImageUrl: targetFig.imageUrl || imageUrl || '/cardback_placeholder.jpeg',
          lineId: lineId,
          lineName: lineObj?.name || 'The Vintage Collection',
          franchiseId: 'fran-star-wars',
          franchiseName: 'Star Wars',
          condition: mapToFigureCondition(condition),
          gradingScore: condition === 'GRADED' ? conditionDetails : undefined,
          purchasePrice: 0,
          currency: 'USD',
          estimatedValue: condition === 'GRADED' ? 120 : (condition === 'MOC' || condition === 'MIB' ? 35 : 18),
          acquisitionDate: new Date().toISOString().split('T')[0],
          quantity: 1,
          storageLocation: 'Vitrina de Col·leccionista',
          collectorNotes: [conditionDetails, userNotes].filter(Boolean).join(' - ') || undefined,
          isWishlist: ownershipStatus === 'WISHLIST',
          priority: ownershipStatus === 'WISHLIST' ? 'Medium' : undefined
        });
      }

      setSuccessMessage(t('propose.success', 'Gràcies! La figura ha quedat registrada directament al catàleg comunitari.'));
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        // Reset form
        setName('');
        setCharacterName('');
        setOwnershipStatus('OWNED');
        setCondition('MOC');
        setConditionDetails('');
        setBarcode('');
        setImageUrl('');
        setDescription('');
        setUserNotes('');
        setSuccessMessage(null);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(t('propose.error', 'The figure proposal could not be saved.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-display">
                {t('propose.modal_title', 'Proposar Nova Figura al Catàleg')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('propose.modal_subtitle', 'Model tipus Viquipèdia / Discogs: Afegeix figures, variants o fotos pròpies per ampliar la base de dades.')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close', 'Close dialog')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body & Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Status Alerts */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Figure Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                {t('propose.name', 'Nom de la Figura *')}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('propose.example_figure', 'e.g. Luke Skywalker (Bespin Fatigue)')}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 dark:focus:border-amber-400 transition-all shadow-xs"
              />
            </div>

            {/* Character Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {t('propose.character', 'Personatge')}
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder={t('propose.example_character', 'e.g. Luke Skywalker')}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 dark:focus:border-amber-400 transition-all shadow-xs"
              />
            </div>

            {/* Line Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber-500" />
                {t('propose.line', 'Línia de Joguines')}
              </label>
              <select
                value={lineId}
                onChange={(e) => setLineId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 dark:focus:border-amber-400 transition-all shadow-xs"
              >
                {AVAILABLE_LINES.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Release Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                {t('propose.year', 'Any de Llançament')}
              </label>
              <input
                type="number"
                min="1970"
                max="2030"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 dark:focus:border-amber-400 transition-all shadow-xs font-mono"
              />
            </div>

            {/* User Collection Status / Ownership Section */}
            <div className="sm:col-span-2 space-y-2.5 p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <BookmarkCheck className="w-4 h-4 text-amber-500" />
                  <span>{t('propose.ownership_label', 'Estat a la Col·lecció')}</span>
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('propose.ownership_help', 'Indica si tens la figura a la teva col·lecció, si la vols a la wishlist o només catalogar')}
                </span>
              </div>

              {/* Quick Ownership Toggle Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: 'OWNED' as const,
                    icon: BookmarkCheck,
                    label: t('propose.ownership_owned', 'A la meva col·lecció'),
                    sub: t('propose.ownership_owned_sub', 'Tinc aquesta figura'),
                    activeClass: 'border-emerald-500 bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500 font-semibold',
                    iconClass: 'text-emerald-500'
                  },
                  {
                    id: 'WISHLIST' as const,
                    icon: Heart,
                    label: t('propose.ownership_wishlist', 'A la Wishlist'),
                    sub: t('propose.ownership_wishlist_sub', 'Vull aconseguir-la'),
                    activeClass: 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-300 ring-1 ring-amber-500 font-semibold',
                    iconClass: 'text-amber-500'
                  },
                  {
                    id: 'NONE' as const,
                    icon: Eye,
                    label: t('propose.ownership_none', 'No la tinc'),
                    sub: t('propose.ownership_none_sub', 'Només catalogar'),
                    activeClass: 'border-slate-400 bg-slate-200/60 dark:bg-slate-700/60 text-slate-900 dark:text-slate-100 ring-1 ring-slate-400 font-semibold',
                    iconClass: 'text-slate-400'
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = ownershipStatus === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOwnershipStatus(item.id)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg text-xs transition-all border text-left cursor-pointer ${
                        isSelected
                          ? item.activeClass
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? item.iconClass : 'text-slate-400'}`} />
                      <div className="min-w-0">
                        <div className="font-bold truncate">{item.label}</div>
                        <div className="text-[10px] opacity-75 truncate">{item.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Standardized Dropdown for user collection status */}
              <div className="pt-0.5">
                <select
                  value={ownershipStatus}
                  onChange={(e) => setOwnershipStatus(e.target.value as 'OWNED' | 'WISHLIST' | 'NONE')}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 dark:focus:border-amber-400 transition-all shadow-xs"
                >
                  <option value="OWNED">{t('propose.ownership_owned', 'A la meva col·lecció')} ({t('propose.ownership_owned_sub', 'Tinc aquesta figura')})</option>
                  <option value="WISHLIST">{t('propose.ownership_wishlist', 'A la Wishlist')} ({t('propose.ownership_wishlist_sub', 'Vull aconseguir-la')})</option>
                  <option value="NONE">{t('propose.ownership_none', 'No la tinc')} ({t('propose.ownership_none_sub', 'Només catalogar')})</option>
                </select>
              </div>
            </div>

            {/* Figure Condition / State Section (Estat de Conservació) */}
            <div className="sm:col-span-2 space-y-2.5 p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>{t('propose.condition', 'Estat de Conservació')}</span>
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('propose.condition_help', 'Defineix si la figura està en blíster, caixa o solta (loose)')}
                </span>
              </div>

              {/* Quick Collector Preset Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'MOC', label: t('propose.cond_moc', 'Mint On Card'), sub: t('propose.cond_moc_sub', 'Blíster intacte') },
                  { id: 'MIB', label: t('propose.cond_mib', 'Mint In Box'), sub: t('propose.cond_mib_sub', 'Caixa segellada') },
                  { id: 'LOOSE_COMPLETE', label: t('propose.cond_loose_comp', 'Loose Complet'), sub: t('propose.cond_loose_comp_sub', '100% accessoris') },
                  { id: 'LOOSE_INCOMPLETE', label: t('propose.cond_loose_incomp', 'Loose Incomplet'), sub: t('propose.cond_loose_incomp_sub', 'Falten peces') }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setCondition(preset.id)}
                    className={`px-3 py-2 rounded-lg text-xs transition-all border text-left cursor-pointer ${
                      condition === preset.id
                        ? 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-300 ring-1 ring-amber-500 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="font-bold truncate">{preset.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{preset.sub}</div>
                  </button>
                ))}
              </div>

              {/* Standardized Dropdown & Exact Specification Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {t('propose.cond_select_label', 'Estat normalitzat de catalogació')}
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 dark:focus:border-amber-400 transition-all shadow-xs"
                  >
                    <option value="MOC">{t('propose.cond_opt_moc', 'Mint on Card (MOC - Blíster original segellat)')}</option>
                    <option value="MIB">{t('propose.cond_opt_mib', 'Mint in Box (MIB / MISB - En caixa original segellada)')}</option>
                    <option value="CARDED_DAMAGED">{t('propose.cond_opt_carded_dmg', 'Carded amb desgast (Blíster obert, plecs o bombolla groga)')}</option>
                    <option value="LOOSE_COMPLETE">{t('propose.cond_opt_loose_comp', 'Loose Complet (C-9 / C-10 - Amb tots els accessoris originals)')}</option>
                    <option value="LOOSE_INCOMPLETE">{t('propose.cond_opt_loose_incomp', 'Loose Incomplet (Falta algun accessori, arma o capa)')}</option>
                    <option value="LOOSE_PLAYED">{t('propose.cond_opt_loose_played', 'Loose amb desgast de joc (Fregaments o articulacions toves)')}</option>
                    <option value="GRADED">{t('propose.cond_opt_graded', 'Graduada Professionalment (AFA / CAS / UKG / PSA)')}</option>
                    <option value="CUSTOM">{t('propose.cond_opt_custom', 'Customitzada / Repintada / Restaurada')}</option>
                    <option value="OTHER">{t('propose.cond_opt_other', 'Altre estat definit pel col·leccionista')}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {condition === 'GRADED' 
                      ? t('propose.cond_notes_graded_label', 'Puntuació i empresa graduadora') 
                      : condition === 'LOOSE_INCOMPLETE'
                      ? t('propose.cond_notes_missing_label', 'Quines armes o peces falten?')
                      : t('propose.cond_notes_label', 'Especificació o matís de l\'estat (opcional)')}
                  </label>
                  <input
                    type="text"
                    value={conditionDetails}
                    onChange={(e) => setConditionDetails(e.target.value)}
                    placeholder={
                      condition === 'GRADED'
                        ? t('propose.example_grade', 'e.g. AFA 85 (C:85, B:85, F:85) NM+')
                        : condition === 'LOOSE_INCOMPLETE'
                        ? t('propose.example_missing_parts', 'e.g. Missing blaster or original cape')
                        : condition === 'CARDED_DAMAGED'
                        ? t('propose.example_damage', 'e.g. Yellowed bubble, creased edge')
                        : t('propose.example_condition', 'e.g. Unpunched card, pristine backing card')
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 dark:focus:border-amber-400 transition-all shadow-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Barcode & Image Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-amber-500" />
                {t('propose.barcode', 'Codi de Barres (UPC / EAN)')}
              </label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder={t('propose.example_barcode', 'e.g. 076281382101 or 5010993...')}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 dark:focus:border-amber-400 transition-all shadow-xs font-mono"
              />
            </div>

            {/* Photo Upload or URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5 text-amber-500" />
                {t('propose.photo', 'Foto de la Figura (Fitxer o URL)')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder={t('propose.image_url_placeholder', 'Image URL or upload a file')}
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 dark:focus:border-amber-400 transition-all shadow-xs"
                />
                <label className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs">
                  <UploadCloud className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('propose.upload_btn', 'Pujar')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Photo Preview if loaded */}
          {imageUrl && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <img
                src={imageUrl}
                alt={t('propose.photo_preview', 'Image preview')}
                className="w-12 h-12 object-contain bg-black/10 rounded-md border border-slate-200 dark:border-slate-700"
              />
              <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {t('propose.photo_ready', 'Foto adjuntada correctament per al catàleg públic.')}
              </div>
            </div>
          )}

          {/* Description & Collector Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              {t('propose.description', 'Descripció, Variants o Accessoris Originals')}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('propose.example_description', 'e.g. Brown vinyl cape, yellow telescoping saber, small blaster...')}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 dark:focus:border-amber-400 transition-all shadow-xs resize-none"
            />
          </div>

          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <CbButton
              variant="outline"
              size="sm"
              type="button"
              onClick={onClose}
              disabled={submitting}
            >
              {t('propose.cancel', 'Cancel·lar')}
            </CbButton>

            <CbButton
              variant="primary"
              size="sm"
              type="submit"
              disabled={submitting}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              {submitting ? t('propose.submitting', 'Enregistrant...') : t('propose.submit', 'Proposar i Publicar Figura')}
            </CbButton>
          </div>
        </form>
      </div>
    </div>
  );
};
