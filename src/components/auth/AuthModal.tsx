import React, { useState } from 'react';
import { CbInput } from '../shared/CbInput';
import { CbButton } from '../shared/CbButton';
import { X, Lock, Mail, User, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; email: string; id?: string; displayName?: string; role?: string } | null;
  onLogin: (user: { name: string; email: string }) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout
}) => {
  const { t } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const demoProfiles = [
    { name: 'KennerArchivePro', email: 'vintage.kenner@cardback.io', roleKey: 'auth.demo_role_vintage' },
    { name: 'EterniaCollector', email: 'motu.grail@cardback.io', roleKey: 'auth.demo_role_archivist' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onLogin({
        name: name.trim() || email.split('@')[0],
        email: email.trim()
      });
      onClose();
    }
  };

  const handleSelectDemo = (p: { name: string; email: string }) => {
    onLogin(p);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {currentUser ? t('auth.collector_profile', 'Collector profile') : isRegister ? t('auth.join_title', 'Join Cardback') : t('auth.signin_title', 'Collector sign in')}
              </h2>
              <span className="text-[11px] text-slate-500">
                {currentUser ? t('auth.private_access', 'Private inventory access') : t('auth.sync_collection', 'Sync your collection across devices')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {currentUser ? (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {currentUser.name}
                </h3>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('auth.verified_session', 'Verified collector session active')}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between gap-3">
              <CbButton variant="outline" size="sm" className="w-full" onClick={onClose}>
                {t('common.close', 'Close')}
              </CbButton>
              <CbButton
                variant="danger"
                size="sm"
                className="w-full"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
              >
                {t('auth.sign_out', 'Sign out')}
              </CbButton>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Demo Quick Sign-in */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                {t('auth.demo_profiles', 'One-click demo profiles')}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoProfiles.map(p => (
                  <button
                    key={p.email}
                    type="button"
                    onClick={() => handleSelectDemo(p)}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-500/60 bg-slate-50/50 dark:bg-slate-800/50 text-left transition-colors cursor-pointer group"
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-500 block truncate">
                      {p.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {t(p.roleKey, p.roleKey === 'auth.demo_role_vintage' ? 'Vintage Star Wars Specialist' : 'MOTU & Hasbro Archivist')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="shrink mx-3 text-[11px] text-slate-400 uppercase font-mono">{t('auth.or_credentials', 'Or use credentials')}</span>
              <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t('auth.collector_alias', 'Collector alias')}
                  </label>
                  <CbInput
                    value={name}
                    onChange={setName}
                  placeholder={t('auth.alias_placeholder', 'e.g. CardbackHunter')}
                    size="sm"
                    icon={<User className="w-4 h-4" />}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {t('auth.email', 'Email address')}
                </label>
                <CbInput
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder={t('auth.email', 'Email address')}
                  size="sm"
                  icon={<Mail className="w-4 h-4" />}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {t('auth.password', 'Password')}
                </label>
                <CbInput
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  size="sm"
                  icon={<Lock className="w-4 h-4" />}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500 w-3.5 h-3.5"
                  />
                  <span>{t('auth.remember_me', 'Stay signed in')}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                >
                  {isRegister ? t('auth.have_account', 'Already have an account?') : t('auth.create_account', 'Create account')}
                </button>
              </div>

              <CbButton variant="amber" size="md" type="submit" className="w-full font-bold">
              {isRegister ? t('auth.register', 'Create collector account') : t('nav.sign_in', 'Sign in')}
              </CbButton>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
