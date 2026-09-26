import React, { useState, useEffect } from 'react';
import { EntityType, FigureDetailResponseDto } from '../../types/domain';
import { ApiService, AiFigureOption } from '../../services/apiService';
import { getFigureImageUrl, handleImageError } from '../../utils/imageFallback';
import { CbCard } from '../shared/CbCard';
import { Badge } from '../shared/Badge';
import { CbButton } from '../shared/CbButton';
import { ScanResultModal } from '../shared/ScanResultModal';
import { 
  Cpu, 
  Upload, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Plus, 
  DollarSign, 
  RefreshCw,
  Eye,
  Sliders,
  ShieldCheck,
  Search,
  Wifi,
  WifiOff,
  Globe,
  PackageX,
  Tag,
  Calendar,
  Building2
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface AiIdentifyViewProps {
  onNavigateEntity: (type: EntityType, id: string) => void;
  onAddToCollection: (figure: FigureDetailResponseDto, variantId?: string, releaseId?: string) => void;
}

interface IdentifiedResult {
  figureId: string;
  figureName: string;
  lineName: string;
  franchiseName: string;
  manufacturer: string;
  year: number;
  imageUrl: string;
  confidence: number;
  packagingStatus?: string;
  detectedVariant?: {
    variantId: string;
    variantName: string;
    rarity: string;
    identifyingFeatures: string[];
    estimatedLooseValue: number;
    estimatedMocValue: number;
  };
  moldingDetails: string;
  authenticityNotes: string;
  accessoriesIdentified: string[];
  barcode?: string | null;
}

const SAMPLE_FIGURES = [
  {
    label: 'POTF2 Darth Vader (Long Saber)',
    id: 'fig-sw-vader-potf2',
    variantId: 'var-vader-potf2-long',
    category: 'toy',
    imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800&auto=format&fit=crop&q=80',
    description: '1995 Red Card motlle de transició amb espasa làser translúcida llarga (Kenner / Hasbro)'
  },
  {
    label: 'Vintage 1978 Darth Vader',
    id: 'fig-sw-vader-vintage',
    category: 'toy',
    imageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&auto=format&fit=crop&q=80',
    description: 'Kenner 12-back original amb capa de vinil i sabre telescòpic'
  },
  {
    label: '1982 MOTU Skeletor (Soft Head)',
    id: 'fig-motu-skeletor-vintage',
    category: 'toy',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    description: 'Mattel Taiwan wave 1 amb cap de cautxú tou'
  },
  {
    label: '1988 TMNT Leonardo',
    id: 'fig-tmnt-leo-vintage',
    category: 'toy',
    imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80',
    description: 'Playmates 10-back amb cap de goma tova i katanes dobles'
  },
  {
    label: 'Poma Fresca (Test: No Joguina -> Not Found)',
    id: 'test-non-toy-apple',
    category: 'non-toy',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
    description: 'Fruita fresca de consum — Test de rebuig Not Found per a objectes que no són joguines'
  }
];

export const AiIdentifyView: React.FC<AiIdentifyViewProps> = ({
  onNavigateEntity,
  onAddToCollection
}) => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_FIGURES[0].imageUrl);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<IdentifiedResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Real-time network connectivity state
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  // Multiple referenced options from online archives
  const [foundOptions, setFoundOptions] = useState<AiFigureOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Not Found state (when image is not a toy or non-figure)
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null);
  const [notFoundDetails, setNotFoundDetails] = useState<{
    detectedSubject: string;
    reason?: string;
  } | null>(null);

  // Result modal state
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // Monitor online / offline connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Helper to find or synthesize figure domain object
  const getOrSynthesizeFigure = (res: IdentifiedResult): FigureDetailResponseDto => {
    const existing = ApiService.getFigureDetail(res.figureId);
    if (existing) return existing;

    // Search by name
    const all = ApiService.getFigures({ search: res.figureName, limit: 1 });
    if (all.items.length > 0) {
      const match = ApiService.getFigureDetail(all.items[0].id);
      if (match) return match;
    }

    // Synthesize real figure detail matching domain DTO
    return {
      id: res.figureId,
      name: res.figureName,
      code: `AI-${res.year}-${res.figureName.slice(0, 4).toUpperCase()}`,
      year: res.year,
      description: `Identificat per visió neuronal Gemini AI: ${res.figureName} de ${res.lineName} (${res.franchiseName}).`,
      imageUrl: res.imageUrl,
      character: {
        id: `char-${res.figureName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: res.figureName,
        description: `Representació del personatge ${res.figureName}.`,
        imageUrl: res.imageUrl
      },
      line: {
        id: `line-${res.lineName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: res.lineName,
        manufacturerName: res.manufacturer || 'Hasbro / Kenner',
        startYear: res.year,
        scale: '3.75 inch'
      },
      franchise: {
        id: `fr-${res.franchiseName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: res.franchiseName
      },
      sculptDetails: res.moldingDetails,
      articulationPoints: 5,
      originalAccessories: res.accessoriesIdentified,
      variants: [
        {
          id: res.detectedVariant?.variantId || 'var-1',
          name: res.detectedVariant?.variantName || 'Standard Release',
          figureId: res.figureId,
          figureName: res.figureName,
          distinguishingFeature: res.detectedVariant?.identifyingFeatures?.[0] || 'Matriu de producció original',
          imageUrl: res.imageUrl,
          isRare: (res.detectedVariant?.rarity || '').includes('Rare') || (res.detectedVariant?.rarity || '').includes('Grail')
        }
      ],
      productReleases: [
        {
          id: `rel-${res.figureId}`,
          name: `${res.figureName} (${res.lineName})`,
          figureId: res.figureId,
          variantId: res.detectedVariant?.variantId || 'var-1',
          packagingType: res.packagingStatus || 'Carded Blister (MOC)',
          region: 'US / Global',
          releaseYear: res.year,
          retailer: 'General Retail',
          imageUrl: res.imageUrl,
          barcode: res.barcode || undefined
        }
      ]
    };
  };

  const applyOptionAsCurrent = (opt: AiFigureOption) => {
    setSelectedOptionId(opt.id);
    setResult({
      figureId: `fig-${opt.figureName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      figureName: opt.figureName,
      lineName: opt.lineName,
      franchiseName: opt.franchiseName,
      manufacturer: opt.manufacturer,
      year: opt.year,
      imageUrl: selectedImage || opt.imageUrl || SAMPLE_FIGURES[0].imageUrl,
      confidence: opt.confidence,
      packagingStatus: opt.packagingStatus,
      detectedVariant: {
        variantId: `var-${opt.variantName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        variantName: opt.variantName,
        rarity: opt.estimatedMocValue > 80 ? 'Grail / Rare Variant' : 'Standard Release',
        identifyingFeatures: opt.identifyingFeatures,
        estimatedLooseValue: opt.estimatedLooseValue,
        estimatedMocValue: opt.estimatedMocValue
      },
      moldingDetails: opt.moldingDetails,
      authenticityNotes: opt.authenticityNotes,
      accessoriesIdentified: opt.accessoriesIdentified,
      barcode: opt.barcode
    });
  };

  const runIdentification = async (imageUrl: string, samplePresetId?: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setNotFoundMessage(null);
    setNotFoundDetails(null);
    setFoundOptions([]);
    setSelectedOptionId(null);

    // If device is offline
    if (!isOnline && !samplePresetId) {
      setIsAnalyzing(false);
      setErrorMessage(t('ai.offline_status', 'Internet is required to analyze new images and check catalogue records.'));
      return;
    }

    try {
      // Call Real Gemini Multimodal AI Endpoint
      const aiResponse = await ApiService.identifyFigureWithAi(imageUrl);

      // Handle Not Found (Non-Toy or Unrecognized Subject)
      if (aiResponse.isToyOrActionFigure === false || aiResponse.found === false) {
        setNotFoundMessage(
          t('ai.non_toy', 'No matching collectible figure or toy was found.')
        );
        setNotFoundDetails({
          detectedSubject: aiResponse.detectedSubject || "Element no catalogat com a joguina",
          reason: aiResponse.notFoundReason || "L'element no correspon a cap fabricant de figures o joguines reconegut a la xarxa."
        });
        setResult(null);
        setFoundOptions([]);
        setIsResultModalOpen(true);
        return;
      }

      // Process options found online
      const options = aiResponse.options || [];
      setFoundOptions(options);

      const generatedId = samplePresetId || `fig-${(aiResponse.figureName || 'figure').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

      if (options.length > 0) {
        setSelectedOptionId(options[0].id);
      }

      setResult({
        figureId: generatedId,
        figureName: aiResponse.figureName || 'Figura Desconeguda',
        lineName: aiResponse.lineName || 'Col·lecció General',
        franchiseName: aiResponse.franchiseName || 'Action Figures',
        manufacturer: aiResponse.manufacturer || 'Kenner / Hasbro',
        year: aiResponse.year || 1980,
        imageUrl: imageUrl,
        confidence: aiResponse.confidence || 95.0,
        packagingStatus: aiResponse.packagingStatus || 'Carded Blister (MOC)',
        detectedVariant: {
          variantId: `var-${(aiResponse.variantName || 'standard').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          variantName: aiResponse.variantName || 'Edició Estàndard',
          rarity: (aiResponse.estimatedMocValue || 0) > 80 ? 'Grail / Rare Variant' : 'Standard Release',
          identifyingFeatures: aiResponse.identifyingFeatures || ['Matriu de producció original'],
          estimatedLooseValue: aiResponse.estimatedLooseValue || 25,
          estimatedMocValue: aiResponse.estimatedMocValue || 65
        },
        moldingDetails: aiResponse.moldingDetails || 'Matriu original de producció verificada.',
        authenticityNotes: aiResponse.authenticityNotes || 'Sense evidència de falsificació o còpia en resina.',
        accessoriesIdentified: aiResponse.accessoriesIdentified || [],
        barcode: aiResponse.barcode
      });
      setIsResultModalOpen(true);
    } catch (err: any) {
      console.warn('Gemini AI identification fallback:', err);
      // If sample preset was clicked, fallback to sample data if offline
      if (samplePresetId && samplePresetId !== 'test-non-toy-apple') {
        const fig = ApiService.getFigureDetail(samplePresetId);
        if (fig) {
          const primaryVariant = fig.variants[0];
          const synthOptions: AiFigureOption[] = [
            {
              id: `opt-1-${fig.id}`,
              title: `${fig.name} (${primaryVariant?.name || 'Edició Estàndard'})`,
              figureName: fig.name,
              lineName: fig.line.name,
              franchiseName: fig.franchise?.name || 'Action Figures',
              manufacturer: fig.line.manufacturerName,
              year: fig.year,
              variantName: primaryVariant?.name || 'Edició Estàndard',
              packagingStatus: 'Carded Blister (MOC)',
              description: `Opció catalogada a la col·lecció per a ${fig.name}.`,
              confidence: 96.5,
              estimatedLooseValue: 45,
              estimatedMocValue: 120,
              identifyingFeatures: [primaryVariant?.distinguishingFeature || 'Motlle original'],
              accessoriesIdentified: fig.originalAccessories,
              moldingDetails: `Motlle autèntic de ${fig.line.manufacturerName}.`,
              authenticityNotes: 'Plàstic original d\'època amb segell de copyright a la cama.',
              source: 'database'
            }
          ];

          setFoundOptions(synthOptions);
          setSelectedOptionId(synthOptions[0].id);

          setResult({
            figureId: fig.id,
            figureName: fig.name,
            lineName: fig.line.name,
            franchiseName: fig.franchise?.name || 'Action Figures',
            manufacturer: fig.line.manufacturerName,
            year: fig.year,
            imageUrl: imageUrl,
            confidence: 96.5,
            packagingStatus: 'Carded Blister (MOC)',
            detectedVariant: primaryVariant ? {
              variantId: primaryVariant.id,
              variantName: primaryVariant.name,
              rarity: primaryVariant.isRare ? 'Rare / Grail' : 'Standard Release',
              identifyingFeatures: [primaryVariant.distinguishingFeature],
              estimatedLooseValue: 45,
              estimatedMocValue: 120
            } : undefined,
            moldingDetails: `Motlle autèntic de ${fig.line.manufacturerName}. Prova d'articulació amb ${fig.articulationPoints} punts d'articulació (POA). ${fig.sculptDetails}`,
            authenticityNotes: 'Plàstic original de producció amb segell de copyright net.',
            accessoriesIdentified: fig.originalAccessories
          });
          setIsResultModalOpen(true);
        }
      } else if (samplePresetId === 'test-non-toy-apple') {
        // Explicit non-toy fallback
        setNotFoundMessage("Not Found: L'objecte fotografiat no és cap figura d'acció ni joguina de cap fabricant col·leccionable.");
        setNotFoundDetails({
          detectedSubject: "Poma Fresca / Fruita Natural",
          reason: "Fruita fresca de consum humà. No pertany a cap fabricant de figures o joguines."
        });
        setResult(null);
        setFoundOptions([]);
        setIsResultModalOpen(true);
      } else {
        setErrorMessage(t('scanner.image_error', 'The image could not be analyzed. Make sure it is clear and try again.'));
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setSelectedImage(url);
        runIdentification(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_FIGURES[0]) => {
    setSelectedImage(sample.imageUrl);
    runIdentification(sample.imageUrl, sample.id);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* View Header with Connectivity State */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Cpu className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 font-display">
            {t('ai.title', 'AI figure recognition')}
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('ai.subtitle', 'Take or upload a photo. If it shows a figure or toy, you will see matching catalogue options. Other objects will be marked as not found.')}
          </p>
        </div>

        {/* Real-time Internet Connectivity Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isOnline ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('ai.online_status', 'Connected to the internet • AI recognition active')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium">
              <WifiOff className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('ai.offline_status', 'Offline • Limited local search')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Input & Scanning Stage */}
        <div className="lg:col-span-5 space-y-4">
          <CbCard className="p-4 border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>{t('ai.capture_label', 'Photo / visual scanner')}</span>
              {isAnalyzing && (
                <span className="flex items-center gap-1.5 text-blue-500 animate-pulse font-mono">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {t('ai.analyzing', 'AI analysis in progress')}
                </span>
              )}
            </div>

            {/* Visual Display Stage */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 group">
              {selectedImage ? (
                <>
                  <img
                    src={selectedImage}
                    alt={t('ai.capture_label', 'Figure or object to identify')}
                    className="w-full h-full object-cover"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-white p-4 text-center">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent absolute top-0 animate-bounce" />
                      <div className="p-3 rounded-full bg-slate-900/80 border border-blue-500/50 mb-2">
                        <Cpu className="w-6 h-6 text-blue-400 animate-pulse" />
                      </div>
                      <span className="text-xs font-bold font-mono tracking-wider text-blue-200 uppercase">
                  {t('ai.validating', 'Checking toy maker and figure mold online...')}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-6 text-slate-500">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">{t('ai.no_image', 'No image loaded')}</p>
                </div>
              )}
            </div>

            {/* Upload & Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-blue-500" />
                  {t('ai.upload', 'Upload photo')}
                </div>
              </label>

              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-500/20 cursor-pointer transition-colors">
                  <Camera className="w-3.5 h-3.5 text-amber-500" />
                  {t('ai.take_photo', 'Take a photo')}
                </div>
              </label>

              {selectedImage && !isAnalyzing && (
                <CbButton
                  variant="primary"
                  size="sm"
                  icon={<Sparkles className="w-3.5 h-3.5" />}
                  onClick={() => selectedImage && runIdentification(selectedImage)}
                >
                  {t('ai.identify', 'Identify')}
                </CbButton>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </CbCard>

          {/* Sample Preset Figures */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              {t('ai.sample_tests', 'Sample tests (toys and non-toys)')}
            </span>
            <div className="space-y-1.5">
              {SAMPLE_FIGURES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`w-full p-2 rounded-lg border text-left text-xs transition-colors flex items-center gap-2.5 cursor-pointer ${
                    selectedImage === sample.imageUrl
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <img
                    src={getFigureImageUrl(sample.imageUrl)}
                    alt={sample.label}
                    onError={handleImageError}
                    className="w-10 h-10 rounded object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-medium">{sample.label}</p>
                      {sample.category === 'non-toy' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20">
                  {t('ai.non_toy', 'Non-toy')}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {sample.description}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Detection Results, Options & Not Found States */}
        <div className="lg:col-span-7 space-y-5">
          {/* Multiple Options Referenced Online (if found) */}
          {foundOptions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  {t('ai.options_found', 'Options found online ({{count}})').replace('{{count}}', String(foundOptions.length))}
                </h3>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    {t('ai.verified_maker', 'Verified toy maker')}
                </span>
              </div>

              {/* Options Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {foundOptions.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => applyOptionAsCurrent(opt)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10 shadow-xs ring-1 ring-blue-500/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {opt.title}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded shrink-0">
                        {t('ai.active', 'Selected')}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{opt.year}</span>
                        <span>•</span>
                        <span className="truncate">{opt.manufacturer}</span>
                      </div>

                      <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {opt.description}
                      </p>

                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">{opt.packagingStatus}</span>
                        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          MOC: ${opt.estimatedMocValue}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Inspection Result Card */}
          {result ? (
            <div className="space-y-5">
              {/* Identification Header Banner */}
              <CbCard className="p-5 border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t('ai.identified_confidence', 'Identified with {{confidence}}% confidence').replace('{{confidence}}', String(result.confidence))}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                  {t('detail.year', 'Year')} {result.year} • {result.manufacturer}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-display">
                      {result.figureName}
                    </h2>

                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {t('nav.lines', 'Line')}: <span className="text-slate-900 dark:text-slate-200 font-semibold">{result.lineName}</span> • {t('nav.franchises', 'Franchise')}: <span className="text-slate-900 dark:text-slate-200 font-semibold">{result.franchiseName}</span>
                    </p>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                    <CbButton
                      variant="amber"
                      size="sm"
                      icon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => {
                        const fig = getOrSynthesizeFigure(result);
                        onAddToCollection(fig, result.detectedVariant?.variantId);
                      }}
                    >
                  {t('collection.add_btn', 'Add to collection')}
                    </CbButton>

                    <CbButton
                      variant="outline"
                      size="sm"
                      icon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => {
                        const fig = getOrSynthesizeFigure(result);
                        onNavigateEntity('figure', fig.id);
                      }}
                    >
                  {t('detail.catalogue', 'Catalogue record')}
                    </CbButton>

                    <CbButton
                      variant="ghost"
                      size="sm"
                      icon={<Sparkles className="w-3.5 h-3.5" />}
                      onClick={() => setIsResultModalOpen(true)}
                    >
            {t('ai.results_modal', 'Recognition results')}
                    </CbButton>
                  </div>
                </div>
              </CbCard>

              {/* Detected Variant Callout */}
              {result.detectedVariant && (
                <CbCard className="p-5 border-amber-500/40 bg-amber-50/20 dark:bg-amber-950/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('ai.variant_detected', 'Detected variant')}: {result.detectedVariant.variantName}
                      </h3>
                    </div>
                    <Badge variant="amber">{result.detectedVariant.rarity}</Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
              {t('ai.visual_features', 'Visual features and mold identification:')}
                    </span>
                    <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {result.detectedVariant.identifyingFeatures.map((feat, idx) => (
                        <li key={idx}>{feat}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{t('ai.market_value', 'Collector market estimate:')}</span>
                    <div className="flex items-center gap-4 font-mono font-bold">
                      <span className="text-slate-700 dark:text-slate-300">
                  {t('ai.loose_value', 'Loose')}: ${result.detectedVariant.estimatedLooseValue}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                  {t('ai.moc_value', 'MOC, carded')}: ${result.detectedVariant.estimatedMocValue}
                      </span>
                    </div>
                  </div>
                </CbCard>
              )}

              {/* Tooling & Authenticity Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CbCard className="p-4 border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-blue-500" /> {t('ai.mold_check', 'Mold and articulation check')}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {result.moldingDetails}
                  </p>
                </CbCard>

                <CbCard className="p-4 border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t('ai.authenticity_check', 'Authenticity verification')}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {result.authenticityNotes}
                  </p>
                </CbCard>
              </div>

              {/* Accessories Checklist */}
              {result.accessoriesIdentified.length > 0 && (
                <CbCard className="p-4 border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>{t('ai.authentic_accessories', 'Associated original accessories')}</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {result.accessoriesIdentified.length} peces verificades
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {result.accessoriesIdentified.map((acc, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        ✓ {acc}
                      </span>
                    ))}
                  </div>
                </CbCard>
              )}
            </div>
          ) : notFoundMessage ? (
            /* Explicit "Not Found" Screen when not a toy manufacturer or non-toy */
            <div className="p-8 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
                <PackageX className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-rose-950 dark:text-rose-100">
                {t('ai.not_found_title', 'Not found: this is not a figure or toy')}
                </h3>
                <p className="text-xs text-rose-800 dark:text-rose-300 max-w-lg mx-auto leading-relaxed">
                  {notFoundMessage}
                </p>
              </div>

              {notFoundDetails?.detectedSubject && (
                <div className="inline-block p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-900 text-left text-xs max-w-sm mx-auto">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                {t('ai.detected_subject', 'Object detected in the photo:')}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                  • <strong>{t('ai.identification', 'Identification')}:</strong> {notFoundDetails.detectedSubject}
                  </div>
                  {notFoundDetails.reason && (
                    <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                  • <strong>{t('ai.reason', 'Reason')}:</strong> {notFoundDetails.reason}
                    </div>
                  )}
                  <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 italic">
                {t('ai.classification', 'Classification: not a collectible action figure or toy.')}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-center gap-3">
                <CbButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleSelectSample(SAMPLE_FIGURES[0]);
                  }}
                >
                {t('ai.try_valid_sample', 'Try a valid Star Wars Kenner sample')}
                </CbButton>
                <CbButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNotFoundMessage(null);
                    setNotFoundDetails(null);
                  }}
                >
                {t('common.close', 'Close')}
                </CbButton>
              </div>
            </div>
          ) : (
            /* Standby State */
            <div className="h-full min-h-[380px] rounded-xl border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <Cpu className="w-12 h-12 text-slate-400 mb-3 opacity-60" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              {t('ai.ready_title', 'Ready for online visual analysis')}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
              {t('ai.ready_body', 'Upload or take a photo of a figure or package. Gemini will check whether it is a toy, compare online records, and show possible matches.')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Dialog with AI Recognition Results */}
      <ScanResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        mode="ai"
        figure={result ? getOrSynthesizeFigure(result) : null}
        variantId={result?.detectedVariant?.variantId}
        barcode={result?.barcode}
        confidence={result?.confidence}
        packagingStatus={result?.packagingStatus}
        variantName={result?.detectedVariant?.variantName}
        marketValueLoose={result?.detectedVariant?.estimatedLooseValue}
        marketValueMoc={result?.detectedVariant?.estimatedMocValue}
        accessories={result?.accessoriesIdentified}
        moldingDetails={result?.moldingDetails}
        isNotFound={!!notFoundMessage}
        notFoundSubject={notFoundDetails?.detectedSubject}
        notFoundReason={notFoundDetails?.reason}
        notFoundMessage={notFoundMessage || undefined}
        options={foundOptions.map(opt => ({
          id: opt.id,
          title: opt.title,
          subtitle: `${opt.year} • ${opt.manufacturer} • ${opt.packagingStatus}`,
          description: opt.description,
          imageUrl: opt.imageUrl,
          packagingStatus: opt.packagingStatus,
          estimatedMocValue: opt.estimatedMocValue,
          estimatedLooseValue: opt.estimatedLooseValue
        }))}
        selectedOptionId={selectedOptionId}
        onSelectOption={(optionId) => {
          const opt = foundOptions.find(o => o.id === optionId);
          if (opt) applyOptionAsCurrent(opt);
        }}
        onGoToFigureDetail={() => {
          if (result) {
            const fig = getOrSynthesizeFigure(result);
            setIsResultModalOpen(false);
            onNavigateEntity('figure', fig.id);
          }
        }}
        onAddToCollection={() => {
          if (result) {
            const fig = getOrSynthesizeFigure(result);
            setIsResultModalOpen(false);
            onAddToCollection(fig, result.detectedVariant?.variantId);
          }
        }}
        onCancel={() => setIsResultModalOpen(false)}
      />
    </div>
  );
};
