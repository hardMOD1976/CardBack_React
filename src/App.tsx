import React, { useState, useEffect, useCallback } from 'react';
import { EntityType, FigureDetailResponseDto, OwnedFigure } from './types/domain';
import { ApiService } from './services/apiService';
import { CollectionService } from './services/collectionService';
import { Header } from './components/shell/Header';
import { Sidebar, MainNavView } from './components/shell/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { DatabankView } from './components/databank/DatabankView';
import { CollectionView } from './components/collection/CollectionView';
import { AiIdentifyView } from './components/ai/AiIdentifyView';
import { ScanBarcodeView } from './components/scanner/ScanBarcodeView';
import { ProfileView } from './components/profile/ProfileView';
import { GlobalSearchResults } from './components/search/GlobalSearchResults';
import { TransversalDetailView } from './components/detail/TransversalDetailView';
import { AddFigureModal } from './components/collection/AddFigureModal';
import { AuthModal } from './components/auth/AuthModal';
import { LoginView } from './components/auth/LoginView';
import { ConnectionConsentModal } from './components/auth/ConnectionConsentModal';
import { useTheme } from './contexts/ThemeContext';
import { useLanguage } from './contexts/LanguageContext';
import { 
  LayoutDashboard, 
  Bookmark, 
  Database, 
  Heart, 
  Cpu, 
  ScanBarcode, 
  User 
} from 'lucide-react';

export type AppViewMode = MainNavView | 'search' | 'detail';

export default function App() {
  // Navigation & Routing State - Default to 'dashboard' as per Cardback architecture
  const [currentView, setCurrentView] = useState<AppViewMode>('dashboard');
  const [detailTarget, setDetailTarget] = useState<{ type: EntityType; id: string } | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<{ view: AppViewMode; target?: { type: EntityType; id: string } }[]>([]);

  // Search State (Driven exclusively from the Header Search Bar)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<EntityType | 'all'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetFigureForAdd, setTargetFigureForAdd] = useState<FigureDetailResponseDto | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [selectedReleaseId, setSelectedReleaseId] = useState<string | undefined>(undefined);
  const [editingOwnedItem, setEditingOwnedItem] = useState<OwnedFigure | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Internet Connection & Cloud Services Compliance State
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [consentDeclineNotice, setConsentDeclineNotice] = useState<string | null>(null);
  const [consentActivationError, setConsentActivationError] = useState<string | null>(null);
  const [authFlowError, setAuthFlowError] = useState<string | null>(null);
  const [isConsentAgreed, setIsConsentAgreed] = useState<boolean>(() => {
    return localStorage.getItem('cb_connection_consent') === 'true' || sessionStorage.getItem('cb_connection_consent') === 'true';
  });
  // Pending authentication state waiting for user's connection consent before entering Dashboard
  const [pendingAuth, setPendingAuth] = useState<{ user: any; authTicket: string; rememberMe: boolean } | null>(null);

  // User State - Checked against JWT, local storage, AND connection consent agreement
  const [currentUser, setCurrentUser] = useState<{ id?: string; name: string; email: string; displayName?: string; role?: string } | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const hasConsented = localStorage.getItem('cb_connection_consent') === 'true' || sessionStorage.getItem('cb_connection_consent') === 'true';
    if (!hasConsented) { setIsCheckingSession(false); return; }
    const legacyToken = localStorage.getItem('cb_token');
    fetch('/api/auth/me', { credentials: 'same-origin', headers: legacyToken ? { Authorization: `Bearer ${legacyToken}` } : {} })
      .then(async response => { if (!response.ok) throw new Error('No active session'); return response.json(); })
      .then(data => {
        const u = data.user;
        const formatted = { id: u.id, name: u.displayName || u.username || u.name || 'Collector', email: u.email || '', role: u.role || 'USER' };
        setCurrentUser(formatted); localStorage.setItem('cb_user', JSON.stringify(formatted)); localStorage.removeItem('cb_token');
        CollectionService.setUserId(u.id);
      })
      .catch(() => { localStorage.removeItem('cb_token'); localStorage.removeItem('cb_user'); CollectionService.setUserId(undefined); })
      .finally(() => setIsCheckingSession(false));
  }, []);

  // Translation & Theme from context
  const { t } = useLanguage();
  const { skin, mode, toggleMode } = useTheme();

  // Collection summary counters
  const [collectionStats, setCollectionStats] = useState(() => CollectionService.getCollectionStats());
  const [wishlistCount, setWishlistCount] = useState(() => CollectionService.getWishlist().length);

  // Subscribe to collection service mutations
  useEffect(() => {
    const unsubscribe = CollectionService.subscribe(() => {
      setCollectionStats(CollectionService.getCollectionStats());
      setWishlistCount(CollectionService.getWishlist().length);
    });
    return unsubscribe;
  }, []);

  // Sync hash routing with application state
  const parseHashRoute = useCallback(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (!hash || hash === 'dashboard') {
      setCurrentView('dashboard');
      setDetailTarget(null);
    } else if (hash === 'collection') {
      setCurrentView('collection');
      setDetailTarget(null);
    } else if (hash === 'databank') {
      setCurrentView('databank');
      setDetailTarget(null);
    } else if (hash === 'wishlist') {
      setCurrentView('wishlist');
      setDetailTarget(null);
    } else if (hash === 'ai-identify' || hash === 'ai_identify') {
      setCurrentView('ai_identify');
      setDetailTarget(null);
    } else if (hash === 'scan-barcode' || hash === 'scan_barcode') {
      setCurrentView('scan_barcode');
      setDetailTarget(null);
    } else if (hash === 'profile') {
      setCurrentView('profile');
      setDetailTarget(null);
    } else if (hash.startsWith('search')) {
      setCurrentView('search');
      setDetailTarget(null);
      const params = new URLSearchParams(hash.split('?')[1] || '');
      const q = params.get('q');
      if (q) setSearchQuery(q);
    } else if (hash.startsWith('detail/')) {
      const parts = hash.split('/');
      const entityType = parts[1] as EntityType;
      const entityId = parts[2];
      if (entityType && entityId) {
        setCurrentView('detail');
        setDetailTarget({ type: entityType, id: entityId });
      }
    }
  }, []);

  useEffect(() => {
    parseHashRoute();
    window.addEventListener('hashchange', parseHashRoute);
    return () => window.removeEventListener('hashchange', parseHashRoute);
  }, [parseHashRoute]);

  // Navigation handlers
  const handleNavigateEntity = (type: EntityType, id: string) => {
    setNavigationHistory(prev => [...prev, { view: currentView, target: detailTarget || undefined }]);
    setDetailTarget({ type, id });
    setCurrentView('detail');
    window.location.hash = `detail/${type}/${id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectView = (view: MainNavView | 'search') => {
    setDetailTarget(null);
    setCurrentView(view);
    window.location.hash = view === 'search' && searchQuery ? `search?q=${encodeURIComponent(searchQuery)}` : view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (navigationHistory.length > 0) {
      const prev = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(h => h.slice(0, -1));
      if (prev.view === 'detail' && prev.target) {
        handleNavigateEntity(prev.target.type, prev.target.id);
      } else {
        handleSelectView(prev.view as any);
      }
    } else {
      handleSelectView('dashboard');
    }
  };

  // Search Action Handlers (triggered from the top Header search bar)
  const handleSearchSubmit = (q: string) => {
    setSearchQuery(q);
    setCurrentView('search');
    window.location.hash = `search?q=${encodeURIComponent(q)}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    if (currentView === 'search') {
      window.location.hash = 'search';
    }
  };

  // Collection modal handlers
  const handleOpenAddFigure = async (figureId?: string) => {
    setEditingOwnedItem(null);
    setSelectedVariantId(undefined);
    setSelectedReleaseId(undefined);

    if (figureId) {
      let fig = ApiService.getFigureDetail(figureId);
      if (!fig) {
        fig = await ApiService.fetchEntityDetail('figure', figureId);
      }
      setTargetFigureForAdd(fig);
    } else {
      const allFigs = ApiService.getFigures({ limit: 1 });
      if (allFigs.items.length > 0) {
        let fig = ApiService.getFigureDetail(allFigs.items[0].id);
        if (!fig) {
          fig = await ApiService.fetchEntityDetail('figure', allFigs.items[0].id);
        }
        setTargetFigureForAdd(fig);
      }
    }
    setIsAddModalOpen(true);
  };

  const handleAddToCollectionWithContext = (
    figure: FigureDetailResponseDto,
    variantId?: string,
    releaseId?: string
  ) => {
    setEditingOwnedItem(null);
    setTargetFigureForAdd(figure);
    setSelectedVariantId(variantId);
    setSelectedReleaseId(releaseId);
    setIsAddModalOpen(true);
  };

  const handleEditOwnedItem = async (item: OwnedFigure) => {
    setEditingOwnedItem(item);
    let fig = ApiService.getFigureDetail(item.figureId);
    if (!fig) {
      fig = await ApiService.fetchEntityDetail('figure', item.figureId);
    }
    setTargetFigureForAdd(fig);
    setSelectedVariantId(item.variantId);
    setSelectedReleaseId(item.productReleaseId);
    setIsAddModalOpen(true);
  };

  const handleSaveToCollection = (data: Omit<OwnedFigure, 'id' | 'addedAt'>) => {
    if (editingOwnedItem) {
      CollectionService.updateFigure(editingOwnedItem.id, data);
    } else {
      CollectionService.addFigure(data);
    }
  };

  // Auth Handlers
  const handleLogin = (user: { id?: string; name: string; email: string; displayName?: string; role?: string }) => {
    setConsentDeclineNotice('Inicia la sessió amb les teves credencials verificades. No es permet iniciar sessió amb un perfil de demostració.');
  };

  const handleLoginSuccess = (user: any, authTicket: string, rememberMe: boolean) => {
    const formatted = {
      id: user.id,
      name: user.displayName || user.username || user.name || 'Collector',
      email: user.email,
      role: user.role || 'USER',
    };
    setConsentDeclineNotice(null);
    setAuthFlowError(null);
    setConsentActivationError(null);

    const hasConsented = localStorage.getItem('cb_connection_consent') === 'true' || sessionStorage.getItem('cb_connection_consent') === 'true';
    if (hasConsented) {
      fetch('/api/auth/session', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ authTicket, rememberMe }) })
        .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Could not start session'); return data; })
        .then(() => { setCurrentUser(formatted); localStorage.setItem('cb_user', JSON.stringify(formatted)); CollectionService.setUserId(user.id); setCurrentView('dashboard'); window.location.hash = 'dashboard'; })
        .catch(() => setAuthFlowError(t('consent.session_activation_failed', 'Could not activate the session. Please make sure the server is running and try again.')));
    } else {
      // Flow: Login > Connection Consent Gate > (Dashboard if agreed, Login if cancelled)
      setPendingAuth({ user: formatted, authTicket, rememberMe });
      setIsConsentModalOpen(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPendingAuth(null);
    localStorage.removeItem('cb_user');
    localStorage.removeItem('cb_token');
    CollectionService.setUserId(undefined);
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  // Connection compliance handlers
  const handleAgreeConsent = async (remember: boolean) => {
    setConsentActivationError(null);
    // Create the session first. Keep the consent dialog open if activation fails,
    // so the user can retry and doesn't get mislabeled as having declined.
    if (pendingAuth) {
      try {
        const response = await fetch('/api/auth/session', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ authTicket: pendingAuth.authTicket, rememberMe: pendingAuth.rememberMe }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not start session');
        setCurrentUser(pendingAuth.user);
        localStorage.setItem('cb_user', JSON.stringify(pendingAuth.user));
        CollectionService.setUserId(pendingAuth.user.id);
        setPendingAuth(null);
      } catch {
        setConsentActivationError(t('consent.session_activation_failed', 'Could not activate the session. Please make sure the server is running and try again.'));
        return;
      }
    }

    if (remember) localStorage.setItem('cb_connection_consent', 'true');
    else sessionStorage.setItem('cb_connection_consent', 'true');
    setIsConsentAgreed(true);
    setIsConsentModalOpen(false);
    setConsentDeclineNotice(null);
    setConsentActivationError(null);

    // Direct transition into the Dashboard
    setCurrentView('dashboard');
    window.location.hash = 'dashboard';
  };

  const handleCancelConsent = () => {
    localStorage.removeItem('cb_connection_consent');
    sessionStorage.removeItem('cb_connection_consent');
    localStorage.removeItem('cb_user');
    localStorage.removeItem('cb_token');
    setIsConsentAgreed(false);
    setIsConsentModalOpen(false);
    setPendingAuth(null);
    setConsentActivationError(null);
    setCurrentUser(null);
    setConsentDeclineNotice(
      "Has cancel·lat la conformitat de connexió a internet. L'accés a Cardback requereix acceptar la connexió per utilitzar els serveis."
    );
    setAuthFlowError(null);
  };

  // Compute Search Results
  const searchResponse = ApiService.globalSearch(searchQuery);

  // If unauthenticated or awaiting connection consent, stay on the login screen with the consent modal
  if (!currentUser) {
    if (isCheckingSession) return <div className="min-h-screen bg-slate-950" aria-label="Carregant sessió" />;
    return (
      <>
        <LoginView 
          onLoginSuccess={handleLoginSuccess}
          declineNotice={consentDeclineNotice}
          authError={authFlowError}
          onClearDeclineNotice={() => setConsentDeclineNotice(null)}
        />
        {/* Connection compliance dialog presented right after login credentials */}
        <ConnectionConsentModal
          isOpen={isConsentModalOpen}
          userName={pendingAuth?.user?.name}
          onAgree={handleAgreeConsent}
          onCancel={handleCancelConsent}
          errorMessage={consentActivationError}
        />
      </>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 ${mode === 'dark' ? 'dark' : ''}`}>
      {/* Platform Header with Global Search Bar */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onSearchClear={handleSearchClear}
        onNavigate={handleNavigateEntity}
        onOpenView={handleSelectView}
        theme={mode}
        onToggleTheme={toggleMode}
        collectionCount={collectionStats.totalFigures}
        collectionValue={collectionStats.totalEstimatedValue}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex w-full min-h-[calc(100vh-4rem)]">
        {/* Navigation Sidebar matching exact requested feature list */}
        <Sidebar
          currentView={currentView}
          onSelectView={handleSelectView}
          onNavigateEntity={handleNavigateEntity}
          collectionCount={collectionStats.totalFigures}
          wishlistCount={wishlistCount}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 pb-20 md:pb-8">
          {/* 1. Dashboard View */}
          {currentView === 'dashboard' && (
            <DashboardView
              onNavigateEntity={handleNavigateEntity}
              onSelectView={handleSelectView}
              onOpenAddModal={() => handleOpenAddFigure()}
              currentUser={currentUser}
            />
          )}

          {/* 2. Collection View */}
          {currentView === 'collection' && (
            <CollectionView
              onNavigate={handleNavigateEntity}
              onOpenAddModal={() => handleOpenAddFigure()}
              onEditItem={handleEditOwnedItem}
              isWishlistView={false}
            />
          )}

          {/* 3. Databank View */}
          {currentView === 'databank' && (
            <DatabankView
              onNavigate={handleNavigateEntity}
              onAddFigure={handleOpenAddFigure}
            />
          )}

          {/* 4. Wishlist View */}
          {currentView === 'wishlist' && (
            <CollectionView
              onNavigate={handleNavigateEntity}
              onOpenAddModal={() => handleOpenAddFigure()}
              onEditItem={handleEditOwnedItem}
              isWishlistView={true}
            />
          )}

          {/* 5. AI Identify View */}
          {currentView === 'ai_identify' && (
            <AiIdentifyView
              onNavigateEntity={handleNavigateEntity}
              onAddToCollection={handleAddToCollectionWithContext}
            />
          )}

          {/* 6. Scan Barcode View */}
          {currentView === 'scan_barcode' && (
            <ScanBarcodeView
              onNavigateEntity={handleNavigateEntity}
              onAddToCollection={handleAddToCollectionWithContext}
            />
          )}

          {/* 7. Profile View */}
          {currentView === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              onLogin={handleLogin}
              onLogout={handleLogout}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onOpenConsentModal={() => setIsConsentModalOpen(true)}
              isConsentAgreed={isConsentAgreed}
            />
          )}

          {/* Header Global Search Results View (opened when searching from the top header) */}
          {currentView === 'search' && (
            <GlobalSearchResults
              searchResponse={searchResponse}
              query={searchQuery}
              onQueryChange={setSearchQuery}
              onClear={handleSearchClear}
              onNavigate={handleNavigateEntity}
              selectedCategory={searchCategory}
              onCategoryChange={setSearchCategory}
            />
          )}

          {/* Transversal Detail View */}
          {currentView === 'detail' && detailTarget && (
            <TransversalDetailView
              target={detailTarget}
              onNavigate={handleNavigateEntity}
              onBack={handleBack}
              onAddToCollection={handleAddToCollectionWithContext}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Including Barcode Scanner prominently) */}
      <nav aria-label={t('nav.mobile_label', 'Mobile navigation')} className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-1 px-1 shadow-lg">
        {[
          { id: 'dashboard', label: t('nav.dashboard', 'Dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'collection', label: t('nav.collection', 'Collection'), icon: <Bookmark className="w-4 h-4" /> },
          { id: 'databank', label: t('nav.databank', 'Databank'), icon: <Database className="w-4 h-4" /> },
          { 
            id: 'scan_barcode', 
            label: t('nav.quick_scan', 'Scan'), 
            icon: <ScanBarcode className="w-5 h-5" />,
            isPrimary: true
          },
          { id: 'ai_identify', label: t('nav.ai_identify', 'AI Identify'), icon: <Cpu className="w-4 h-4" /> },
          { id: 'profile', label: t('nav.profile', 'Profile'), icon: <User className="w-4 h-4" /> }
        ].map(item => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              id={`mobile-nav-${item.id}`}
              onClick={() => handleSelectView(item.id as any)}
              className={`flex flex-col items-center gap-0.5 p-1 rounded-xl text-[10px] font-semibold transition-all relative ${
                item.isPrimary
                  ? active
                    ? 'text-amber-500 dark:text-amber-400 font-bold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400'
                  : active
                  ? 'text-amber-500 dark:text-amber-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {item.isPrimary ? (
                <div className={`p-1 rounded-full transition-colors ${active ? 'bg-amber-500/20 ring-2 ring-amber-500' : ''}`}>
                  {item.icon}
                </div>
              ) : (
                item.icon
              )}
              <span className="truncate max-w-[50px] text-center leading-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Add / Edit Figure to Collection Modal */}
      <AddFigureModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingOwnedItem(null);
        }}
        figure={targetFigureForAdd}
        selectedVariantId={selectedVariantId}
        selectedReleaseId={selectedReleaseId}
        initialData={editingOwnedItem}
        onSave={handleSaveToCollection}
      />

      {/* Collector Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Internet Connection & Cloud Services Compliance Modal */}
      <ConnectionConsentModal
        isOpen={isConsentModalOpen}
        userName={currentUser?.name}
        onAgree={handleAgreeConsent}
        onCancel={handleCancelConsent}
        errorMessage={consentActivationError}
      />
    </div>
  );
}
