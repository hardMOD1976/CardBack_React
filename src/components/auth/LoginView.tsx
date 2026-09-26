import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2, ArrowUpRight, ArrowRight, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LanguageSelector } from '../shell/LanguageSelector';

const AuthThemeToggle: React.FC = () => {
  const { mode, toggleMode } = useTheme();
  const { t } = useLanguage();
  const label = mode === 'dark' ? t('common.theme_light', 'Switch to light mode') : t('common.theme_dark', 'Switch to dark mode');
  return (
    <button type="button" onClick={toggleMode} aria-label={label} title={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
      {mode === 'dark' ? <Sun className="h-4 w-4 text-amber-500 dark:text-amber-300" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};

interface LoginViewProps {
  onLoginSuccess: (user: { id: string; username: string; email: string; displayName?: string; role?: string }, authTicket: string, rememberMe: boolean) => void;
  declineNotice?: string | null;
  authError?: string | null;
  onClearDeclineNotice?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ 
  onLoginSuccess,
  declineNotice,
  authError,
  onClearDeclineNotice
}) => {
  const { t } = useLanguage();
  const { mode } = useTheme();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(Boolean(declineNotice));
  const [screen, setScreen] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    if (declineNotice) setShowLogin(true);
  }, [declineNotice]);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('reset');
    if (token) { setResetToken(token); setScreen('reset'); setShowLogin(true); }
  }, []);

  const submitAuthForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setNoticeMessage(null);
    if (screen === 'register') {
      if (password !== confirmPassword) { setErrorMessage(t('auth.password_mismatch', 'Passwords do not match.')); return; }
      if (password.length < 12) { setErrorMessage(t('auth.password_min', 'Use at least 12 characters for your password.')); return; }
    }
    if (screen === 'reset' && password !== confirmPassword) { setErrorMessage(t('auth.password_mismatch', 'Passwords do not match.')); return; }
    setIsLoading(true);
    try {
      const endpoint = screen === 'register' ? '/api/auth/register' : screen === 'reset' ? '/api/auth/password/reset' : '/api/auth/login';
      const payload = screen === 'register'
        ? { username, email, displayName, password }
        : screen === 'reset' ? { token: resetToken, password } : { usernameOrEmail: usernameOrEmail.trim(), password };
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t('auth.login_failed', 'Sign-in failed. Please try again.'));
      if (screen === 'reset') {
        window.history.replaceState({}, '', window.location.pathname + window.location.hash);
        setScreen('login'); setPassword(''); setConfirmPassword(''); setNoticeMessage(t('auth.reset_success', 'Password updated. You can now sign in.'));
      } else {
        onLoginSuccess(data.user, data.authTicket, rememberMe);
      }
    } catch (err: any) {
      setErrorMessage(err.message || t('auth.login_failed', 'Sign-in failed. Please try again.'));
    } finally { setIsLoading(false); }
  };

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMessage(null); setNoticeMessage(null); setIsLoading(true);
    try {
      const response = await fetch('/api/auth/password/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(response.status === 503 ? t('auth.recovery_unavailable', 'Password recovery email is not configured yet.') : (data.error || 'Could not process the recovery request.'));
      setNoticeMessage(t('auth.recovery_sent', 'If an account exists for that email, a reset link will be sent shortly.'));
    } catch (err: any) { setErrorMessage(err.message || 'Could not process the recovery request.'); }
    finally { setIsLoading(false); }
  };

  if (!showLogin) {
    return (
      <main className="min-h-screen min-h-[100svh] w-full bg-white text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 md:grid md:grid-cols-[1.05fr_0.95fr]">
        <section
          className="relative hidden min-h-screen overflow-hidden bg-slate-950 bg-cover bg-center md:flex md:flex-col md:justify-between md:p-10 lg:p-14"
          style={{
            backgroundImage: "linear-gradient(180deg, rgba(4,8,18,0.18) 0%, rgba(4,8,18,0.07) 22%, transparent 48%), linear-gradient(180deg, rgba(4,8,18,0.14) 0%, rgba(4,8,18,0.18) 36%, rgba(4,8,18,0.88) 100%), url('/bg.jpeg')",
            backgroundPosition: 'center 52%',
          }}
        >
          <img
            src="/Logo_v1_var6_POS_color.png"
            alt="Cardback"
            className="relative z-10 h-auto w-[min(82%,440px)] object-contain drop-shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
          />
          <div className="relative z-10 max-w-xl pb-3 text-white">
            <div className="mb-5 h-1 w-16 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 shadow-[0_0_18px_rgba(34,211,238,0.8)]" />
            <h1 className="text-4xl font-black leading-tight tracking-tight lg:text-5xl xl:text-6xl">
              {t('auth.slogan', 'Where your collection lives!')}
            </h1>
          </div>
        </section>

        <section className="relative flex min-h-[100svh] flex-col bg-white px-5 py-5 transition-colors dark:bg-slate-950 sm:px-8 md:min-h-screen md:bg-slate-50 md:px-10 dark:md:bg-slate-900 lg:px-14">
          <header className="flex items-center justify-end gap-2">
            <LanguageSelector showName />
            <AuthThemeToggle />
          </header>

          <div className="flex flex-1 items-center justify-center py-10 md:py-12">
            <div className="w-full max-w-[470px] text-center md:text-left">
              <img
                src={mode === 'dark' ? '/Logo_v1_var6_POS_color.png' : '/Logo_v1_var6_POS_blue.png'}
                alt="Cardback"
                className="mx-auto mb-7 h-auto w-[min(78%,320px)] object-contain md:hidden"
              />
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#000B76] dark:text-amber-400">
                {t('auth.collector_profile', 'Collector profile')}
              </p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
                {t('auth.slogan', 'Where your collection lives!')}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base md:mx-0">
                {t('dashboard.welcome_subtitle', 'Your home for action figure archiving. Track condition, inspect variants, scan barcodes, and get AI visual appraisals.')}
              </p>
              <button
                type="button"
                onClick={() => setShowLogin(true)}
                className={`mx-auto mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold shadow-sm transition active:scale-[0.99] sm:w-auto md:mx-0 ${mode === 'dark' ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-[#000B76] text-white hover:bg-[#111d91]'}`}
              >
                {t('nav.sign_in', 'Sign in')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
      <main className="min-h-screen min-h-[100svh] w-full bg-white text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 md:grid md:grid-cols-[1.05fr_0.95fr] select-none">
      {/* Desktop brand panel: hidden completely on mobile */}
      <section
        className="relative hidden min-h-screen overflow-hidden bg-slate-950 bg-cover bg-center md:flex md:flex-col md:justify-between md:p-10 lg:p-14"
        style={{
          backgroundImage: "linear-gradient(180deg, rgba(4,8,18,0.16) 0%, rgba(4,8,18,0.28) 38%, rgba(4,8,18,0.91) 100%), url('/bg.jpeg')",
          backgroundPosition: 'center 52%',
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_18%,rgba(34,211,238,0.15),transparent_38%)]" />
        <img
          src="/Logo_v1_var6_POS_color.png"
          alt="Cardback"
          className="relative z-10 h-auto w-[min(82%,440px)] object-contain drop-shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
        />
        <div className="relative z-10 max-w-xl pb-3 text-white">
          <div className="mb-5 h-1 w-16 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 shadow-[0_0_18px_rgba(34,211,238,0.8)]" />
          <h1 className="text-4xl font-black leading-tight tracking-tight lg:text-5xl xl:text-6xl">
            {t('auth.slogan', 'Where your collection lives!')}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/80 lg:text-lg">
            {t('auth.private_access', 'Private access to your collector inventory')}
          </p>
        </div>
      </section>

      {/* Clean, centered sign-in panel */}
      <section className="relative flex min-h-[100svh] flex-col bg-slate-50 px-5 py-5 transition-colors dark:bg-slate-950 sm:px-8 md:min-h-screen md:px-10 dark:md:bg-slate-900 lg:px-14">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowLogin(false)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('detail.back', 'Back')}
          </button>
          <div className="flex items-center gap-3">
            <LanguageSelector showName />
            <AuthThemeToggle />
          <a
            href="/api-docs/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white sm:text-xs"
            title={t('auth.api_docs', 'Open API documentation')}
          >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Swagger API
              <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center py-8 md:py-10">
          <div className="w-full max-w-[400px]">
            <div className="mb-8 flex flex-col items-center text-center md:items-start md:text-left">
              <img src={mode === 'dark' ? '/Logo_v1_var6_POS_color.png' : '/Logo_v1_var6_POS_blue.png'} alt="Cardback" className="mb-6 h-auto w-[min(78%,320px)] object-contain md:hidden" />
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
                {t(screen === 'register' ? 'auth.create_account' : screen === 'forgot' ? 'auth.forgot_password' : screen === 'reset' ? 'auth.reset_password' : 'auth.signin_title', screen === 'register' ? 'Create your account' : screen === 'forgot' ? 'Forgot password?' : screen === 'reset' ? 'Choose a new password' : 'Collector sign in')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                <span className="md:hidden">{t('auth.slogan', 'Where your collection lives!')} · </span>
                {t('auth.private_access', 'Private access to your collector inventory')}
              </p>
            </div>

            {declineNotice && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="space-y-1 text-left">
                  <span className="block font-bold">{t('auth.consent_declined', 'Connection consent declined')}</span>
                  <p className="leading-relaxed text-amber-800 dark:text-amber-300">{declineNotice}</p>
                </div>
              </div>
            )}

            {authError && (
              <div role="alert" className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-300" />
                <span>{authError}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {noticeMessage && <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{noticeMessage}</div>}

            {screen === 'forgot' ? <form onSubmit={submitForgot} className="space-y-4">
              <p className="text-sm leading-relaxed text-slate-600">{t('auth.recovery_help', 'Enter the email address linked to your account. If recovery email is configured, we will send a one-time link.')}</p>
              <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.email', 'Email address')} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-[#000B76] focus:ring-4 focus:ring-[#000B76]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-amber-400" />
              <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#000B76] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#111d91] disabled:opacity-60 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{t('auth.send_reset', 'Send reset link')}</button>
            </form> : <>
            <form onSubmit={submitAuthForm} className="space-y-4">
              {screen === 'register' && <>
                <input required maxLength={80} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder={t('auth.display_name', 'Display name')} autoComplete="name" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-[#000B76] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-amber-400" />
                <input required minLength={3} maxLength={24} pattern="[A-Za-z0-9._-]+" value={username} onChange={e => setUsername(e.target.value)} placeholder={t('auth.username', 'Username (3–24 characters)')} autoComplete="username" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-[#000B76] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-amber-400" />
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.email', 'Email address')} autoComplete="email" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-[#000B76] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-amber-400" />
                <p className="text-xs leading-relaxed text-slate-500">{t('auth.email_recovery_note', 'Use an email address you can access. Password recovery email is not enabled yet.')}</p>
              </>}
              {screen === 'login' && <div>
              <div>
                <label htmlFor="login-username-or-email" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('auth.username_or_email', 'Username or email')}
                </label>
                <input
                  id="login-username-or-email"
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder={t('auth.username_or_email', 'Username or email')}
                  autoComplete="username"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#000B76] focus:ring-4 focus:ring-[#000B76]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-amber-400 dark:focus:ring-amber-400/10"
                />
              </div>
              </div>}

              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('auth.password', 'Password')}
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password', 'Password')}
                  autoComplete={screen === 'login' ? 'current-password' : 'new-password'}
                  minLength={screen === 'login' ? undefined : 12}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#000B76] focus:ring-4 focus:ring-[#000B76]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-amber-400 dark:focus:ring-amber-400/10"
                />
              </div>

              {(screen === 'register' || screen === 'reset') && <div>
                <label htmlFor="login-confirm-password" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">{t('auth.confirm_password', 'Confirm password')}</label>
                <input id="login-confirm-password" type="password" required minLength={12} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-[#000B76] focus:ring-4 focus:ring-[#000B76]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-amber-400" />
              </div>}

              {screen === 'login' && <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"><input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#000B76] dark:border-slate-600 dark:bg-slate-900" />{t('auth.remember_session', 'Keep me signed in on this device')}</label>}

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#000B76] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#111d91] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>{isLoading ? t('auth.entering', 'Please wait...') : screen === 'register' ? t('auth.create_account', 'Create account') : screen === 'reset' ? t('auth.save_password', 'Save new password') : t('nav.sign_in', 'Sign in')}</span>
              </button>
            </form>
            <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-semibold text-[#000B76] dark:text-amber-400 md:justify-start">
              {screen === 'login' ? <>
                <button type="button" onClick={() => { setScreen('forgot'); setErrorMessage(null); setNoticeMessage(null); }} className="hover:underline">{t('auth.forgot_password', 'Forgot password?')}</button>
                <button type="button" onClick={() => { setScreen('register'); setErrorMessage(null); setNoticeMessage(null); }} className="hover:underline">{t('auth.create_account', 'Create account')}</button>
              </> : <button type="button" onClick={() => { setScreen('login'); setErrorMessage(null); setNoticeMessage(null); }} className="hover:underline">{t('auth.back_to_login', 'Back to sign in')}</button>}
            </div>
            </>}
          </div>
        </div>

        <footer className="mx-auto w-full max-w-[520px] border-t border-slate-200 pt-3 text-center text-[10px] leading-relaxed text-slate-500 dark:border-slate-700 dark:text-slate-400 sm:text-[11px]">
          <details className="group">
            <summary className="cursor-pointer list-none font-semibold text-slate-600 outline-none hover:text-slate-900 focus-visible:underline dark:text-slate-300 dark:hover:text-white">
              <span>{t('auth.legal_title', 'Legal disclaimer')}</span>
              <span className="mx-1.5 text-slate-400" aria-hidden="true">·</span>
              <span className="text-[#000B76] underline underline-offset-2 dark:text-amber-400">{t('auth.legal_expand', 'Read full notice')}</span>
            </summary>
            <div className="mt-2 max-h-36 space-y-1 overflow-y-auto rounded-lg bg-slate-100/80 p-3 text-left text-[10px] leading-relaxed text-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:text-[11px]">
              <p className="font-medium">{t('auth.legal_short', 'Cardback is an independent collector tool. Brands and content belong to their respective rights holders.')}</p>
              <p>{t('auth.legal_1', 'This is an unofficial, fan-made collection tracking tool for informational and educational purposes only.')}</p>
              <p>{t('auth.legal_2', 'All product names, logos, brands, images, characters, and references belong to their respective owners and rights holders.')}</p>
              <p>{t('auth.legal_3', 'Those owners are not affiliated with or endorsing this application or its developers.')}</p>
              <p>{t('auth.legal_4', 'Star Wars and related names, characters, and marks are trademarks and/or copyrighted material of their respective rights holders.')}</p>
              <p>{t('auth.legal_5', 'This application claims no ownership of intellectual property displayed on the platform.')}</p>
              <p>{t('auth.legal_6', 'All rights remain with their respective owners.')}</p>
              <p className="font-semibold text-slate-600 dark:text-slate-200">CardBack 2026 ©</p>
            </div>
          </details>
        </footer>
      </section>
    </main>
  );
};
