import React, { useState, useEffect } from 'react';
import { CbButton } from '../shared/CbButton';
import { 
  Wifi, 
  ShieldCheck, 
  Lock, 
  Cpu, 
  ScanBarcode, 
  Check, 
  X, 
  AlertCircle,
  FileText,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export interface ConnectionConsentModalProps {
  isOpen: boolean;
  onAgree: (rememberPreference: boolean) => void;
  onCancel: () => void;
  userName?: string;
  errorMessage?: string | null;
}

export const ConnectionConsentModal: React.FC<ConnectionConsentModalProps> = ({
  isOpen,
  onAgree,
  onCancel,
  userName,
  errorMessage
}) => {
  const { t } = useLanguage();
  const [rememberPreference, setRememberPreference] = useState(true);
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);

  // Close or handle escape
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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-6 transition-all">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h2 id="consent-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-display">
                {t('consent.title', 'Connection consent and legal notice')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('consent.subtitle', 'Authorization for data transfer during scanning and AI features')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label={t('common.close', 'Close')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

          {errorMessage && (
            <div role="alert" className="mx-5 mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-medium text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

        {/* Scrollable Terms & Legal Disclaimer Content */}
        <div 
          className="p-5 space-y-3.5 max-h-[60vh] overflow-y-auto text-xs leading-relaxed"
          onScroll={() => setHasScrolledTerms(true)}
        >
          {/* Welcome User Pill */}
          <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-[11px] font-medium">
              {t('consent.welcome', 'Hello {{name}}, please review and approve remote data communication before continuing.').replace('{{name}}', userName || t('consent.collector', 'collector'))}
            </span>
          </div>

          {/* Point 1: Internet Connectivity */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{t('consent.section1_title', '1. Internet connection and cloud services')}</span>
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed pl-6">
              {t('consent.section1_body', 'Cardback requires an active internet connection to look up and verify collectible figure catalogue references, packaging variants, and MOC/loose market values.')}
            </p>
          </div>

          {/* Point 2: AI and Barcode Recognition */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{t('consent.section2_title', '2. AI recognition and barcode scanning (Google Gemini)')}</span>
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed pl-6">
              {t('consent.section2_body', 'When you use barcode scanning or AI visual recognition, encrypted data such as figure photos or UPC/EAN numbers are sent to Gemini AI servers to identify molds, original accessories, product lines, and authenticity.')}
            </p>
          </div>

          {/* Point 3: Data Privacy and Security */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{t('consent.section3_title', '3. Data protection and information security')}</span>
            </h3>
            <ul className="list-disc space-y-1 pl-6 ml-4 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              <li>{t('consent.privacy1', 'No biometric, banking, or sensitive personal data is transmitted.')}</li>
              <li>{t('consent.privacy2', 'All communications use an encrypted channel with the HTTPS / TLS 1.3 security protocol.')}</li>
              <li>{t('consent.privacy3', 'Submitted images are used only to catalogue your items and are never made public without your explicit permission.')}</li>
            </ul>
          </div>

          {/* Rights & Cancellation info */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-950 dark:text-amber-100 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{t('consent.decision_title', 'What your choice means:')}</span>
            </div>
            <p className="text-[11px] leading-relaxed pl-5 text-slate-700 dark:text-slate-200">
              • <strong>{t('consent.accept_label', 'Agree (Accept)')}:</strong> {t('consent.accept_body', 'Allows internet access, scanning, AI features, and collection sync.')}<br />
              • <strong>{t('consent.decline_label', 'Cancel (Decline)')}:</strong> {t('consent.decline_body', 'Declines the data connection and ends the session to respect your choice.')}
            </p>
          </div>

          {/* Remember Choice Checkbox */}
          <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberPreference}
              onChange={(e) => setRememberPreference(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-500 dark:bg-slate-800"
            />
            <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
              {t('consent.remember', 'Remember my choice in this browser / on this device')}
            </span>
          </label>
        </div>

        {/* Action Buttons Footer with the exact Agree and Cancel buttons requested */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>{t('consent.tls', 'TLS 1.3 encryption')}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Cancel Button */}
            <CbButton
              variant="outline"
              size="md"
              icon={<X className="w-4 h-4" />}
              onClick={onCancel}
              className="text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400"
            >
              {t('common.cancel', 'Cancel')}
            </CbButton>

            {/* Agree Button */}
            <CbButton
              variant="amber"
              size="md"
              icon={<Check className="w-4 h-4" />}
              onClick={() => onAgree(rememberPreference)}
              className="font-bold shadow-sm"
            >
              {t('consent.agree', 'Agree')}
            </CbButton>
          </div>
        </div>
      </div>
    </div>
  );
};
