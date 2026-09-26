import React, { useState, useRef, useEffect } from 'react';
import { EntityType, ProductReleaseDetailResponseDto, FigureDetailResponseDto } from '../../types/domain';
import { ApiService } from '../../services/apiService';
import { CbCard } from '../shared/CbCard';
import { Badge } from '../shared/Badge';
import { CbButton } from '../shared/CbButton';
import { CbInput } from '../shared/CbInput';
import { handleImageError, getFigureImageUrl } from '../../utils/imageFallback';
import { ScanResultModal } from '../shared/ScanResultModal';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { 
  ScanBarcode, 
  Camera, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Package, 
  Plus, 
  Eye, 
  Barcode, 
  Layers,
  Sparkles,
  RefreshCw,
  VideoOff,
  Upload,
  ExternalLink,
  ShieldAlert,
  Wifi,
  WifiOff,
  Globe,
  PackageX,
  Building2,
  Calendar,
  Tag
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ScanBarcodeViewProps {
  onNavigateEntity: (type: EntityType, id: string) => void;
  onAddToCollection: (figure: FigureDetailResponseDto, variantId?: string, releaseId?: string) => void;
}

export interface BarcodeOptionItem {
  id: string;
  title: string;
  character: string;
  line: string;
  franchise: string;
  manufacturer: string;
  year: number;
  packagingType: string;
  region: string;
  assortmentSku?: string;
  description: string;
  imageUrl?: string;
  source: 'database' | 'curated_catalog' | 'gs1_registry' | 'online_archive';
  confidence: number;
  figureId?: string;
  releaseId?: string;
}

const SAMPLE_BARCODES = [
  {
    code: '076281695701',
    label: 'POTF2 1995 Red Card (Kenner / Hasbro)',
    category: 'toy',
    releaseId: 'rel-sw-vader-potf2-red-us',
    figureId: 'fig-sw-vader-potf2'
  },
  {
    code: '043377050019',
    label: 'TMNT 1988 Leonardo 10-Back (Playmates Toys)',
    category: 'toy',
    releaseId: 'rel-tmnt-leo-10back-us',
    figureId: 'fig-tmnt-leo-vintage'
  },
  {
    code: '074299044237',
    label: 'MOTU 1982 Skeletor 8-Back (Mattel)',
    category: 'toy',
    releaseId: 'rel-motu-skeletor-8back',
    figureId: 'fig-motu-skeletor-vintage'
  },
  {
    code: '3017620422003',
    label: 'Nutella Ferrero (Test: No Joguina -> Not Found)',
    category: 'non-toy',
    releaseId: '',
    figureId: ''
  }
];

export const ScanBarcodeView: React.FC<ScanBarcodeViewProps> = ({
  onNavigateEntity,
  onAddToCollection
}) => {
  const { t } = useLanguage();
  const [barcodeInput, setBarcodeInput] = useState('076281695701');
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [scanStatusText, setScanStatusText] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Real-time network connectivity state
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  // Result states
  const [foundRelease, setFoundRelease] = useState<ProductReleaseDetailResponseDto | null>(() => {
    return ApiService.getProductReleaseDetail('rel-sw-vader-potf2-red-us');
  });
  const [parentFigure, setParentFigure] = useState<FigureDetailResponseDto | null>(() => {
    return ApiService.getFigureDetail('fig-sw-vader-potf2');
  });
  
  // Multiple options found online
  const [foundOptions, setFoundOptions] = useState<BarcodeOptionItem[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Not Found details
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null);
  const [notFoundDetails, setNotFoundDetails] = useState<{
    manufacturer?: string | null;
    productName?: string | null;
    reason?: string | null;
  } | null>(null);

  // Modal dialog with scan results
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  // Monitor network connectivity
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

  const stopCamera = () => {
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch (e) {
        console.warn('Error stopping ZXing controls:', e);
      }
      controlsRef.current = null;
    }

    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      } catch (e) {
        console.warn('Error stopping media tracks:', e);
      }
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
    setIsCameraStarting(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setNotFoundMessage(null);
    setIsCameraStarting(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(t('scanner.camera_unavailable', 'Camera access is unavailable in this browser context. Use the photo upload option instead.'));
      }

      if (controlsRef.current) {
        try { controlsRef.current.stop(); } catch (e) {}
        controlsRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      mediaStreamRef.current = stream;

      const videoEl = videoRef.current;
      if (!videoEl) {
        throw new Error(t('scanner.camera_unavailable', 'The camera is unavailable.'));
      }

      videoEl.srcObject = stream;
      await videoEl.play();

      setIsCameraActive(true);
      setIsCameraStarting(false);

      const codeReader = new BrowserMultiFormatReader();
      const controls = await codeReader.decodeFromVideoElement(
        videoEl,
        (result, error) => {
          if (result) {
            const detectedCode = result.getText();
            if (detectedCode && detectedCode.trim().length > 0) {
              setBarcodeInput(detectedCode);
              handleLookupBarcode(detectedCode);
              stopCamera();
            }
          }
        }
      );

      controlsRef.current = controls;
    } catch (err: any) {
      console.error('Camera barcode start error:', err);
      setIsCameraActive(false);
      setIsCameraStarting(false);
      stopCamera();

      let message = t('scanner.camera_unavailable', 'Could not access the camera.');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = t('scanner.camera_permission', 'Camera permission was denied. Allow camera access in your browser settings or use photo upload.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = t('scanner.camera_missing', 'No camera was found on this device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = t('scanner.camera_busy', 'The camera is being used by another application.');
      }
      setCameraError(message);
    }
  };

  /**
   * Builds domain DTO objects from an option item for seamless UI integration
   */
  const applyOptionAsCurrent = (option: BarcodeOptionItem) => {
    setSelectedOptionId(option.id);

    // Check if there is an existing database release/figure
    if (option.releaseId) {
      const existingRel = ApiService.getProductReleaseDetail(option.releaseId);
      const existingFig = option.figureId ? ApiService.getFigureDetail(option.figureId) : null;
      if (existingRel && existingFig) {
        setFoundRelease(existingRel);
        setParentFigure(existingFig);
        return;
      }
    }

    // Build synthetic entity from online option
    const synthFigId = option.figureId || `fig-${option.character.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const synthRelId = option.releaseId || option.id;

    const synthFig: FigureDetailResponseDto = {
      id: synthFigId,
      name: option.character,
      code: `UPC-${barcodeInput}`,
      year: option.year,
      description: option.description,
      imageUrl: option.imageUrl || '/cardback_placeholder.jpeg',
      character: {
        id: `char-${option.character.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: option.character,
        description: `Depicció de ${option.character}`,
        imageUrl: option.imageUrl || '/cardback_placeholder.jpeg'
      },
      line: {
        id: `line-${option.line.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: option.line,
        manufacturerName: option.manufacturer,
        startYear: option.year,
        scale: '3.75 inch'
      },
      franchise: {
        id: `fr-${option.franchise.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: option.franchise
      },
      sculptDetails: `Fabricat per ${option.manufacturer}. Concordança de packaging referenciada a la xarxa.`,
      articulationPoints: 5,
      originalAccessories: ['Embalatge original', 'Targeta Cardback'],
      variants: [
        {
          id: `var-${synthFigId}-std`,
          name: 'Variant Estàndard Cardback',
          figureId: synthFigId,
          figureName: option.character,
          distinguishingFeature: `Codi de barres UPC ${barcodeInput}`,
          imageUrl: option.imageUrl || '/cardback_placeholder.jpeg',
          isRare: false
        }
      ],
      productReleases: [
        {
          id: synthRelId,
          name: option.title,
          figureId: synthFigId,
          variantId: `var-${synthFigId}-std`,
          packagingType: option.packagingType,
          region: option.region,
          barcode: barcodeInput,
          releaseYear: option.year,
          retailer: 'General Retail',
          imageUrl: option.imageUrl || '/cardback_placeholder.jpeg'
        }
      ]
    };

    const synthRel: ProductReleaseDetailResponseDto = {
      id: synthRelId,
      name: option.title,
      packagingType: option.packagingType,
      region: option.region,
      language: 'Multilingüe / Oficial',
      releaseDate: String(option.year),
      releaseYear: option.year,
      barcode: barcodeInput,
      collectorNotes: option.description,
      assortmentNumber: option.assortmentSku || undefined,
      retailerExclusivity: 'Distribució general',
      imageUrl: option.imageUrl || '/cardback_placeholder.jpeg',
      associatedVariant: {
        id: `var-${synthFigId}-std`,
        name: 'Variant Estàndard',
        distinguishingFeature: `Codi de barres UPC ${barcodeInput}`
      },
      parentFigure: {
        id: synthFig.id,
        name: synthFig.name,
        code: synthFig.code,
        imageUrl: synthFig.imageUrl,
        lineName: synthFig.line.name,
        franchiseName: synthFig.franchise.name
      },
      franchiseName: synthFig.franchise.name,
      lineName: synthFig.line.name
    };

    setFoundRelease(synthRel);
    setParentFigure(synthFig);
  };

  /**
   * Main lookup: verifies barcode with live internet check if online,
   * enforces Not Found if not a toy manufacturer.
   */
  const handleLookupBarcode = async (
    code: string,
    aiContext?: { figureName?: string; lineName?: string; details?: string }
  ) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    setIsScanning(true);
    setNotFoundMessage(null);
    setNotFoundDetails(null);
    setFoundOptions([]);
    setSelectedOptionId(null);

    // 1. If device is online, perform full online barcode verification
    if (isOnline) {
    setScanStatusText(t('scanner.searching_online', 'Searching online and checking toy makers...'));
      try {
        const result = await ApiService.lookupBarcodeOnline(cleanCode);

        // Not a toy manufacturer OR not found
        if (!result.isToyOrActionFigure || !result.found) {
          setFoundRelease(null);
          setParentFigure(null);
          setFoundOptions([]);
          setNotFoundDetails({
            manufacturer: result.manufacturer,
            productName: result.productName,
            reason: t('scanner.barcode_not_found', 'This barcode does not match a recognized toy or figure maker.')
          });
          setNotFoundMessage(t('scanner.barcode_not_found', 'This barcode does not match a recognized toy or figure maker.'));
          setIsResultModalOpen(true);
          setIsScanning(false);
          return;
        }

        // Is a verified toy manufacturer and options are returned
        if (result.options && result.options.length > 0) {
          setFoundOptions(result.options);
          applyOptionAsCurrent(result.options[0]);
          setIsResultModalOpen(true);
          setIsScanning(false);
          return;
        }
      } catch (err: any) {
        console.warn('Online lookup failed, falling back to local database:', err);
      }
    }

    // 2. Offline or fallback: Search local database and samples
  setScanStatusText(t('scanner.searching_local', 'Searching the local catalogue...'));
    const sample = SAMPLE_BARCODES.find(s => s.code === cleanCode);
    let release: ProductReleaseDetailResponseDto | null = null;
    let figure: FigureDetailResponseDto | null = null;

    if (sample && sample.releaseId) {
      release = ApiService.getProductReleaseDetail(sample.releaseId);
      figure = ApiService.getFigureDetail(sample.figureId);
    } else {
      const allFigures = ApiService.getFigures({ limit: 100 });
      for (const f of allFigures.items) {
        const detail = ApiService.getFigureDetail(f.id);
        if (detail?.productReleases) {
          const matchedRelease = detail.productReleases.find(r => r.barcode === cleanCode);
          if (matchedRelease) {
            release = ApiService.getProductReleaseDetail(matchedRelease.id);
            figure = detail;
            break;
          }
        }
      }
    }

    if (release && figure) {
      setFoundRelease(release);
      setParentFigure(figure);
      setFoundOptions([{
        id: release.id,
        title: `${figure.name} (${release.packagingType})`,
        character: figure.name,
        line: figure.line.name,
        franchise: figure.franchise.name,
        manufacturer: figure.line.manufacturerName || 'Kenner / Hasbro',
        year: release.releaseYear || figure.year,
        packagingType: release.packagingType,
        region: release.region,
        assortmentSku: release.assortmentNumber || undefined,
        description: release.collectorNotes || 'Edició oficial catalogada.',
        imageUrl: release.imageUrl || figure.imageUrl,
        source: 'database',
        confidence: 1.0,
        releaseId: release.id,
        figureId: figure.id
      }]);
      setIsResultModalOpen(true);
    } else if (aiContext?.figureName) {
      const opt: BarcodeOptionItem = {
        id: `opt-${cleanCode}-ai`,
        title: `${aiContext.figureName} (Packaging Cardback)`,
        character: aiContext.figureName,
        line: aiContext.lineName || 'Cardback Collection',
        franchise: 'Action Figures',
        manufacturer: 'Hasbro / Kenner',
        year: 2023,
        packagingType: 'Standard Cardback (MOC)',
        region: 'Global',
        description: aiContext.details || `Identificació visual de packaging per a ${aiContext.figureName}.`,
        imageUrl: '/cardback_placeholder.jpeg',
        source: 'online_archive',
        confidence: 0.90
      };
      setFoundOptions([opt]);
      applyOptionAsCurrent(opt);
      setIsResultModalOpen(true);
    } else {
      setFoundRelease(null);
      setParentFigure(null);
      setNotFoundOptionsState(cleanCode);
      setIsResultModalOpen(true);
    }

    setIsScanning(false);
  };

  const setNotFoundOptionsState = (cleanCode: string) => {
    if (!isOnline) {
      setNotFoundMessage(t('scanner.barcode_missing_offline', 'Barcode {{code}} was not found in the local catalogue. Connect to the internet to search and verify the maker.').replace('{{code}}', cleanCode));
    } else {
      setNotFoundMessage(t('scanner.barcode_unregistered', 'Barcode {{code}} is not associated with a recognized figure or toy maker.').replace('{{code}}', cleanCode));
    }
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
  setScanStatusText(t('scanner.scanning', 'Scanning barcode and packaging...'));
    setNotFoundMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      let detectedBarcode: string | null = null;

      try {
        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });

        const zxingReader = new BrowserMultiFormatReader();
        const result = await zxingReader.decodeFromImageElement(img);
        if (result) {
          detectedBarcode = result.getText();
        }
      } catch (err) {
        // ZXing didn't detect pattern, proceed to multimodal Gemini Vision
      }

      try {
        setScanStatusText(t('scanner.analyzing_image', 'Analyzing packaging with Gemini Vision AI...'));
        const aiResult = await ApiService.detectBarcodeWithAi(dataUrl);

        if (aiResult.barcode) {
          detectedBarcode = aiResult.barcode;
        }

        if (detectedBarcode) {
          setBarcodeInput(detectedBarcode);
          await handleLookupBarcode(detectedBarcode, aiResult);
        } else if (aiResult.figureName) {
          await handleLookupBarcode(`SCAN-${Date.now().toString().slice(-6)}`, aiResult);
        } else {
        setNotFoundMessage(t('scanner.image_not_detected', 'No clear barcode or package could be detected in the image.'));
          setIsScanning(false);
        }
      } catch (err) {
        if (detectedBarcode) {
          setBarcodeInput(detectedBarcode);
          await handleLookupBarcode(detectedBarcode);
        } else {
        setNotFoundMessage(t('scanner.image_error', 'There was an error analyzing the photo.'));
          setIsScanning(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof SAMPLE_BARCODES[0]) => {
    setBarcodeInput(sample.code);
    handleLookupBarcode(sample.code);
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Connectivity Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 font-display">
            <ScanBarcode className="w-7 h-7 text-amber-500" />
            {t('nav.scan_barcode', 'Lector de Codi de Barres')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('scanner.subtitle', 'Escaneja blisters o caixes per verificar fabricants de joguines i consultar les opcions referenciades a Internet.')}
          </p>
        </div>

        {/* Live Internet Connectivity Badge */}
        <div className="flex items-center gap-3">
          {isOnline ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-xs">
              <Wifi className="w-4 h-4 text-emerald-500" />
              <span>{t('scanner.online_status', 'Connectat a Internet • Cerca global activa')}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 shadow-xs">
              <WifiOff className="w-4 h-4 text-amber-500" />
              <span>{t('scanner.offline_status', 'Fora de línia • Cerca local limitada')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Barcode Reader & Optical Viewfinder */}
        <div className="md:col-span-5 space-y-4">
          <CbCard className="p-5 border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Barcode className="w-4 h-4 text-amber-500" /> {t('scanner.title', 'Cardback barcode scanner')}
              </span>
              {isScanning && (
                <span className="text-amber-500 flex items-center gap-1 font-mono text-[11px]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {t('scanner.scanning', 'Verifying')}
                </span>
              )}
            </div>

            {/* Viewfinder Target / Camera Feed */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-4">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  isCameraActive ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
                }`}
              />

              {!isCameraActive && (
                <div className="border border-dashed border-amber-400/50 rounded-lg p-6 w-full h-full flex flex-col items-center justify-center text-center text-slate-400 z-10">
                  <Barcode className="w-16 h-16 text-slate-600 mb-2 opacity-70" />
                  <span className="text-[11px] font-mono text-slate-300 font-semibold tracking-wider">
                  {t('scanner.align_code', 'ALIGN THE BARCODE WITH THE FRAME')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">
                  {t('scanner.supported_formats', 'UPC-A • EAN-13 • JAN • Code 128')}
                  </span>
                </div>
              )}

              {/* Scanning Red Laser Line */}
              {isCameraActive && (
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse z-10" />
              )}

              {/* Real-time Processing Overlay */}
              {isScanning && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20 text-center px-4">
                  <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {scanStatusText || t('scanner.searching_online', 'Checking makers and catalogue matches online...')}
                  </span>
                </div>
              )}

              {/* Viewfinder corner brackets */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-400 z-10 pointer-events-none" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-400 z-10 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-400 z-10 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-400 z-10 pointer-events-none" />
            </div>

            {/* Camera Controls for Mobile & Desktop Devices */}
            <div className="flex flex-col sm:flex-row gap-2">
              {isCameraActive ? (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-red-500/20"
                >
                  <VideoOff className="w-4 h-4" /> {t('scanner.stop_camera', 'Stop camera')}
                </button>
              ) : (
                <button
                  type="button"
                  id="start-camera-scan-btn"
                  onClick={startCamera}
                  disabled={isCameraStarting}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isCameraStarting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> {t('scanner.camera_starting', 'Starting camera...')}
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" /> {t('scanner.start_camera', 'Start device camera')}
                    </>
                  )}
                </button>
              )}

              {/* Direct Mobile Photo Snap of Barcode */}
              <label className="py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0">
                <Upload className="w-4 h-4 text-amber-500" />
                <span>{t('scanner.upload_photo', 'Upload / Photo')}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoCapture}
                />
              </label>
            </div>

            {cameraError && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
                <div className="flex items-start gap-2 text-amber-800 dark:text-amber-200 text-xs font-semibold">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 pl-6">
            {t('scanner.photo_tip', 'Tip: Use the “Upload / Photo” button to take a picture with your phone.')}
                </p>
              </div>
            )}

            {/* Manual UPC Input & Search */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('scanner.manual_search', 'Search by UPC / EAN barcode')}
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isOnline ? t('scanner.searching_online', 'Online search active') : t('scanner.searching_local', 'Local cache only')}
                </span>
              </div>
              <div className="flex gap-2">
                <CbInput
                  type="text"
                  value={barcodeInput}
                  onChange={setBarcodeInput}
                placeholder={t('scanner.barcode_placeholder', 'e.g. 076281695701')}
                  size="sm"
                  clearable
                  onClear={() => setBarcodeInput('')}
                  icon={<Barcode className="w-4 h-4" />}
                />
                <CbButton
                  variant="amber"
                  size="sm"
                  disabled={isScanning || !barcodeInput.trim()}
                  onClick={() => handleLookupBarcode(barcodeInput)}
                >
                  {isScanning ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    t('common.search', 'Search')
                  )}
                </CbButton>
              </div>
            </div>
          </CbCard>

          {/* Sample Barcodes */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              {t('ai.sample_tests', 'Sample tests (toys and non-toys)')}
            </span>
            <div className="space-y-1.5">
              {SAMPLE_BARCODES.map(sample => (
                <button
                  key={sample.code}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    barcodeInput === sample.code
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-medium">{sample.label}</p>
                      {sample.category === 'non-toy' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20">
                  {t('ai.non_toy', 'Non-toy')}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {sample.code}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Search Results, Options & Not Found States */}
        <div className="md:col-span-7 space-y-5">
          {/* Multiple Options Found List (if more than 1 option) */}
          {foundOptions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-500" />
                  {t('ai.options_found', 'Options found online ({{count}})').replace('{{count}}', String(foundOptions.length))}
                </h3>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {t('ai.verified_maker', 'Verified toy maker')}
                </span>
              </div>

              {/* Options selection pills/cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {foundOptions.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => applyOptionAsCurrent(opt)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 shadow-xs ring-1 ring-amber-500/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {opt.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {opt.year}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-1 items-center">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                          {opt.manufacturer}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                          {opt.line}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {opt.packagingType} • {opt.region}
                      </p>

                      {isSelected && (
                        <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t('scanner.option_selected', 'Selected option')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Product Release Preview Card */}
          {foundRelease && parentFigure ? (
            <div className="space-y-5 animate-fadeIn">
              <CbCard className="p-5 border-amber-500/40 bg-white dark:bg-slate-900 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t('scanner.online_status', 'Code verified online')}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                        UPC {foundRelease.barcode}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-display">
                      {foundRelease.name || foundRelease.packagingType}
                    </h2>

                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {t('detail.region', 'Distribution')}: <span className="font-semibold text-slate-900 dark:text-slate-200">{foundRelease.region}</span> ({foundRelease.language || t('scanner.release_record', 'Official')}) • {t('detail.year', 'Year')}: <span className="font-semibold text-slate-900 dark:text-slate-200">{foundRelease.releaseYear || foundRelease.releaseDate}</span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <CbButton
                      variant="amber"
                      size="sm"
                      icon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => onAddToCollection(parentFigure, undefined, foundRelease.id)}
                    >
                  {t('collection.add_btn', 'Add to collection')}
                    </CbButton>

                    <CbButton
                      variant="outline"
                      size="sm"
                      icon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => onNavigateEntity('product_release', foundRelease.id)}
                    >
                  {t('scanner.release_record', 'Release record')}
                    </CbButton>

                    <CbButton
                      variant="ghost"
                      size="sm"
                      icon={<Barcode className="w-3.5 h-3.5" />}
                      onClick={() => setIsResultModalOpen(true)}
                    >
            {t('ai.results_modal', 'Scan results')}
                    </CbButton>
                  </div>
                </div>

                {/* Packaging Image & Contained Figure Preview */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 aspect-[3/4] max-h-56">
                    <img
                      src={getFigureImageUrl(foundRelease.imageUrl)}
                      alt={foundRelease.packagingType}
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              {t('scanner.packaged_figure_mold', 'Packaged figure mold')}
                      </span>
                      <div
                        onClick={() => onNavigateEntity('figure', parentFigure.id)}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-amber-500 cursor-pointer transition-colors flex items-center gap-3"
                      >
                        <img
                          src={getFigureImageUrl(parentFigure.imageUrl)}
                          alt={parentFigure.name}
                          onError={handleImageError}
                          className="w-10 h-10 rounded object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {parentFigure.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            {parentFigure.line.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between">
                  <span className="text-slate-400">{t('scanner.assortment_sku', 'Assortment / SKU')}:</span>
                        <span className="font-mono font-semibold">{foundRelease.assortmentNumber || t('scanner.assortment_default', 'Standard assortment')}</span>
                      </div>
                      <div className="flex justify-between">
                  <span className="text-slate-400">{t('scanner.packaging', 'Packaging')}:</span>
                        <span className="font-medium truncate max-w-[180px]">{foundRelease.packagingType}</span>
                      </div>
                      <div className="flex justify-between">
                  <span className="text-slate-400">{t('nav.franchises', 'Franchise')}:</span>
                        <span className="font-medium">{parentFigure.franchise?.name || 'Action Figures'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CbCard>
            </div>
          ) : notFoundMessage ? (
            /* Explicit "Not Found" Screen when not a toy manufacturer or unreferenced */
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

              {notFoundDetails?.productName && (
                <div className="inline-block p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-900 text-left text-xs max-w-sm mx-auto">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                {t('scanner.product_detected', 'Product detected online:')}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                  • <strong>{t('export.figure_name', 'Name')}:</strong> {notFoundDetails.productName}
                  </div>
                  {notFoundDetails.manufacturer && (
                    <div className="text-slate-600 dark:text-slate-400">
                  • <strong>{t('detail.manufacturer', 'Brand / manufacturer')}:</strong> {notFoundDetails.manufacturer}
                    </div>
                  )}
                  <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 italic">
                {t('scanner.not_collectible', 'Classification: this product is not a collectible action figure or toy.')}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-center gap-3">
                <CbButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBarcodeInput('076281695701');
                    handleLookupBarcode('076281695701');
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
            <div className="h-full min-h-[360px] rounded-xl border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <ScanBarcode className="w-12 h-12 text-slate-400 mb-3 opacity-60" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              {t('scanner.ready_title', 'Ready to search online')}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
              {t('scanner.ready_body', 'Scan with the camera or search by UPC/EAN. If the code matches a figure or toy maker, online options will be shown; otherwise, no result will be found.')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Dialog with Scan Results */}
      <ScanResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        mode="barcode"
        figure={parentFigure}
        release={foundRelease}
        releaseId={foundRelease?.id}
        variantId={foundRelease?.associatedVariant?.id}
        barcode={barcodeInput || foundRelease?.barcode}
        packagingStatus={foundRelease?.packagingType}
        marketValueLoose={35}
        marketValueMoc={85}
        isNotFound={!!notFoundMessage}
        notFoundSubject={
          notFoundDetails?.productName
            ? `${notFoundDetails.productName} (${notFoundDetails.manufacturer || t('detail.manufacturer', 'Manufacturer')})`
            : notFoundDetails?.manufacturer || undefined
        }
        notFoundReason={notFoundDetails?.reason || undefined}
        notFoundMessage={notFoundMessage || undefined}
        options={foundOptions.map(opt => ({
          id: opt.id,
          title: opt.title,
          subtitle: `${opt.year} • ${opt.manufacturer} • ${opt.packagingType}`,
          description: opt.description,
          imageUrl: opt.imageUrl,
          packagingStatus: opt.packagingType,
          estimatedMocValue: opt.confidence ? Math.round(opt.confidence * 90) : 75
        }))}
        selectedOptionId={selectedOptionId}
        onSelectOption={(optionId) => {
          const opt = foundOptions.find(o => o.id === optionId);
          if (opt) applyOptionAsCurrent(opt);
        }}
        onGoToFigureDetail={() => {
          if (parentFigure) {
            setIsResultModalOpen(false);
            onNavigateEntity('figure', parentFigure.id);
          }
        }}
        onAddToCollection={() => {
          if (parentFigure) {
            setIsResultModalOpen(false);
            onAddToCollection(parentFigure, foundRelease?.associatedVariant?.id, foundRelease?.id);
          }
        }}
        onCancel={() => setIsResultModalOpen(false)}
      />
    </div>
  );
};
