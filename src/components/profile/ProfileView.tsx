import React, { useState } from 'react';
import { CollectionService } from '../../services/collectionService';
import { ApiService } from '../../services/apiService';
import { CbCard } from '../shared/CbCard';
import { Badge } from '../shared/Badge';
import { CbButton } from '../shared/CbButton';
import { 
  User, 
  ShieldCheck, 
  Download, 
  MapPin, 
  Settings, 
  LogOut, 
  Layers, 
  Award, 
  DollarSign, 
  Check, 
  Bookmark,
  Sparkles,
  Database,
  Wifi
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSelector } from '../shell/LanguageSelector';

interface ProfileViewProps {
  currentUser: { name: string; email: string; id?: string; displayName?: string; role?: string } | null;
  onLogin: (user: { name: string; email: string }) => void;
  onLogout: () => void;
  onOpenAuthModal: () => void;
  onOpenConsentModal?: () => void;
  isConsentAgreed?: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onOpenAuthModal,
  onOpenConsentModal,
  isConsentAgreed = true
}) => {
  const { t } = useLanguage();
  const stats = CollectionService.getCollectionStats();
  const ownedFigures = CollectionService.getOwnedFigures();
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ message: string; figuresCount?: number; linesCount?: number } | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault(); setPasswordMessage(null); setPasswordError(null);
    if (newPassword.length < 12) { setPasswordError(t('auth.password_min', 'Use at least 12 characters for your password.')); return; }
    if (newPassword !== confirmNewPassword) { setPasswordError(t('auth.password_mismatch', 'Passwords do not match.')); return; }
    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/auth/password/change', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not change password.');
      setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); setPasswordMessage(t('auth.password_changed', 'Password changed successfully.'));
    } catch (error: any) { setPasswordError(error.message || 'Could not change password.'); }
    finally { setIsChangingPassword(false); }
  };

  const handleSeedStarWarsDatabase = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    setSeedError(null);
    try {
      const res = await fetch('/api/db/seed/star-wars', { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('cb_token') || ''}` } });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(t('seed.error', 'Could not load the catalogue into the database.'));
      }
      setSeedResult(data);
      // Synchronize in-memory catalogue with freshly seeded figures
      await ApiService.syncCatalogueWithServer();
    } catch (err: any) {
      setSeedError(err.message || t('seed.error', 'Could not load the catalogue into the database.'));
    } finally {
      setIsSeeding(false);
    }
  };

  // Storage locations breakdown
  const storageLocations = [
    { name: 'Main Display Cabinet A', type: 'glass', count: ownedFigures.filter(f => f.storageLocation?.includes('Case') || f.storageLocation?.includes('Display')).length || 2 },
    { name: 'Acrylic Armor UV Cases', type: 'uv', count: ownedFigures.filter(f => f.condition === 'MOC' || f.condition === 'GRADED').length || 2 },
    { name: 'Climate Vault Bin 01', type: 'acid_free', count: ownedFigures.filter(f => f.condition?.includes('LOOSE')).length || 1 }
  ];

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(ownedFigures, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cardback-collection-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleExportCsv = () => {
    const headers = [t('export.figure_name', 'Figure name'), t('export.line', 'Line'), t('export.franchise', 'Franchise'), t('export.condition', 'Condition'), t('export.purchase_price', 'Purchase price'), t('export.estimated_value', 'Estimated value'), t('export.storage', 'Storage location'), t('export.acquisition_date', 'Acquisition date')];
    const rows = ownedFigures.map(f => [
      `"${f.figureName}"`,
      `"${f.lineName}"`,
      `"${f.franchiseName}"`,
      `"${f.condition}"`,
      f.purchasePrice,
      f.estimatedValue,
      `"${f.storageLocation || 'Unassigned'}"`,
      `"${f.acquisitionDate}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cardback-collection-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Profile Header */}
      <CbCard className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-display font-black text-2xl flex items-center justify-center shadow-md">
              {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : 'CB'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-display">
                  {currentUser ? currentUser.name : t('profile.guest', 'Guest collector')}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono">
                  <Award className="w-3 h-3" /> {t('profile.master_archivist', 'Master archivist')}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {currentUser ? currentUser.email : t('profile.local_session', 'Local device session active')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <CbButton
                variant="outline"
                size="sm"
                icon={<LogOut className="w-4 h-4" />}
                onClick={onLogout}
              >
                {t('auth.sign_out', 'Sign out')}
              </CbButton>
            ) : (
              <CbButton
                variant="amber"
                size="sm"
                icon={<User className="w-4 h-4" />}
                onClick={onOpenAuthModal}
              >
                {t('nav.sign_in', 'Sign in')}
              </CbButton>
            )}
          </div>
        </div>

        {/* Portfolio Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400">{t('dashboard.stats_figures', 'Total figures')}</span>
            <p className="text-lg font-black font-display text-slate-900 dark:text-slate-100">
              {stats.totalFigures}
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400">{t('dashboard.stats_value', 'Portfolio value')}</span>
            <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
              ${stats.totalEstimatedValue}
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400">{t('dashboard.invested', 'Total invested')}</span>
            <p className="text-lg font-black font-mono text-slate-700 dark:text-slate-300">
              ${stats.totalInvested}
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400">{t('dashboard.stats_growth', 'Archival gain (ROI)')}</span>
            <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
              +{stats.gainPercentage}%
            </p>
          </div>
        </div>
      </CbCard>

      {currentUser && <CbCard className="p-6 border-slate-200 dark:border-slate-800 space-y-4">
        <div><h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{t('auth.change_password', 'Change password')}</h2><p className="mt-1 text-xs text-slate-500">{t('auth.password_min', 'Use at least 12 characters for your password.')}</p></div>
        {passwordMessage && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{passwordMessage}</p>}
        {passwordError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{passwordError}</p>}
        <form onSubmit={handlePasswordChange} className="grid gap-3 sm:grid-cols-2">
          <input required type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder={t('auth.current_password', 'Current password')} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:bg-slate-950" />
          <input required type="password" minLength={12} autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t('auth.new_password', 'New password')} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:bg-slate-950" />
          <input required type="password" minLength={12} autoComplete="new-password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder={t('auth.confirm_password', 'Confirm password')} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:bg-slate-950" />
          <div><CbButton variant="outline" size="sm" type="submit" disabled={isChangingPassword}>{isChangingPassword ? t('common.loading', 'Saving...') : t('auth.change_password', 'Change password')}</CbButton></div>
        </form>
      </CbCard>}

      {/* Database Connection Status Card */}
      <CbCard className="p-6 border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('profile.database_connection', 'PostgreSQL database connection')}
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t('profile.connected_neon', 'Connected to Neon')}
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {t('profile.database_description', 'The app is connected to your Neon PostgreSQL database with persistent storage.')}
        </p>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 font-mono text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">{t('profile.provider', 'Provider')}:</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">Neon Serverless PostgreSQL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{t('detail.region', 'Region')}:</span>
            <span className="text-slate-800 dark:text-slate-200">AWS eu-central-1</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{t('profile.host', 'Host')}:</span>
            <span className="text-slate-800 dark:text-slate-200 truncate max-w-[280px]">ep-square-dew-as6xqopr-pooler.c-4.eu-central-1.aws.neon.tech</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{t('profile.database_name', 'Database name')}:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">neondb</span>
          </div>
        </div>
      </CbCard>

      {/* Internet Connection Compliance & Legal Consent */}
      <CbCard className="p-6 border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('consent.title', 'Connection consent and legal notice')}
            </h2>
          </div>
          <Badge variant={isConsentAgreed ? 'emerald' : 'amber'} className="text-xs">
            {isConsentAgreed ? t('profile.connection_authorized', 'Connection authorized') : t('profile.consent_pending', 'Consent pending')}
          </Badge>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {t('profile.consent_description', 'Manage permission for catalogue services, AI image processing, and barcode scanning. You can review or change your choice at any time.')}
        </p>

        {onOpenConsentModal && (
          <div className="pt-1">
            <CbButton
              variant="outline"
              size="sm"
              icon={<ShieldCheck className="w-4 h-4 text-amber-500" />}
              onClick={onOpenConsentModal}
            >
              {t('profile.review_terms', 'Review connection terms')}
            </CbButton>
          </div>
        )}
      </CbCard>

      {/* Language & Regional Settings */}
      <CbCard className="p-6 border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('common.language', 'Language')} / {t('profile.regional_settings', 'Regional settings')}
            </h2>
          </div>
          <LanguageSelector compact={false} />
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          {t('profile.language_description', 'Choose your preferred language. Your choice is saved in this browser.')}
        </p>
      </CbCard>

      {/* Star Wars Historical Catalogue Neon Seed Card */}
      <CbCard className="p-6 border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t('seed.title', 'Sincronització del Catàleg Star Wars a Neon')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('seed.subtitle', 'PostgreSQL Neon Tech (Frankfurt eu-central-1)')}
              </p>
            </div>
          </div>
          <Badge variant="amber" className="text-xs">
            {t('seed.badge', '1977 - 2026 Archive')}
          </Badge>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {t('seed.description', 'Load the historical Star Wars figure catalogue into your Neon PostgreSQL database: 96 classic Kenner figures (1977–1985), later vintage and modern product lines.')}
        </p>

        {seedResult && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs">
            <Check className="w-4 h-4 shrink-0" />
            <span>
              {t('seed.success', 'Catalogue loaded successfully')} ({seedResult.figuresCount} {t('databank.tab_figures', 'figures')}, {seedResult.linesCount} {t('databank.tab_lines', 'lines')}).
            </span>
          </div>
        )}

        {seedError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs">
            {seedError}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <CbButton
            variant="primary"
            size="sm"
            disabled={isSeeding}
            onClick={handleSeedStarWarsDatabase}
            icon={<Database className="w-4 h-4" />}
          >
            {isSeeding ? t('seed.loading', 'Injectant a Neon DB...') : t('seed.btn', 'Carregar Catàleg Històric a Neon DB')}
          </CbButton>

          <span className="text-[11px] text-slate-400">
            {t('seed.quota_note', '* Només ocupa ~4 MB (~1% del teu límit gratuït de 500 MB a Neon).')}
          </span>
        </div>
      </CbCard>

      {/* Storage Locations */}
      <CbCard className="p-6 border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('profile.storage_locations', 'Physical storage locations')}
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {t('profile.locations_configured', '{{count}} locations configured').replace('{{count}}', String(storageLocations.length))}
          </span>
        </div>

        <div className="space-y-2.5">
          {storageLocations.map((loc, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {loc.name}
                </span>
                <p className="text-[11px] text-slate-500">
                  {t('profile.container_type', 'Container type')}: {t(`profile.storage_type_${loc.type}`, loc.type)}
                </p>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                {loc.count} {t('nav.figures', 'Figures')}
              </span>
            </div>
          ))}
        </div>
      </CbCard>

      {/* Data Export & Backup */}
      <CbCard className="p-6 border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('profile.export_title', 'Collection backup and export')}
            </h2>
          </div>
          {downloadSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {t('profile.export_downloaded', 'Export downloaded')}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {t('profile.export_description', 'Export your figure catalogue records, valuation history, and condition notes.')}
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <CbButton
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportJson}
          >
            {t('profile.export_json', 'Export JSON archive')}
          </CbButton>

          <CbButton
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCsv}
          >
            {t('profile.export_csv', 'Export CSV spreadsheet')}
          </CbButton>
        </div>
      </CbCard>

      {/* Demo Collector Persona Switcher */}
      <CbCard className="p-6 border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t('profile.demo_personas', 'Demo collector profiles')}
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          {t('profile.demo_description', 'Switch collector profiles to preview different collections:')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onLogin({ name: 'KennerArchivePro', email: 'vintage.kenner@cardback.io' })}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left hover:border-amber-500 transition-colors"
          >
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
              {t('profile.kenner_specialist', 'Vintage Kenner specialist')}
            </span>
            <span className="text-[11px] text-slate-500">
              vintage.kenner@cardback.io
            </span>
          </button>

          <button
            type="button"
            onClick={() => onLogin({ name: 'MOTUArchivist', email: 'eternia.vault@cardback.io' })}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left hover:border-amber-500 transition-colors"
          >
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
              {t('profile.motu_archivist', 'MOTU and Hasbro archivist')}
            </span>
            <span className="text-[11px] text-slate-500">
              eternia.vault@cardback.io
            </span>
          </button>
        </div>
      </CbCard>
    </div>
  );
};
