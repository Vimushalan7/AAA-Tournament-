'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Trophy, Wallet, Upload, Bell, User as UserIcon, LogOut, ShieldAlert, Flame, Sun, Moon, AlertCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import { api } from '../utils/api';
import RulesContent from './RulesContent';

const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

export default function ClientWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(null);
  const [activeNotification, setActiveNotification] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [isOnline, setIsOnline] = useState(true);
  const [acceptingRules, setAcceptingRules] = useState(false);
  const [rulesTicked, setRulesTicked] = useState(false);

  const isPublicRoute = pathname === '/login' || pathname === '/register';

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      const data = await api.get('/users/profile');
      setUser(data);
      // Fetch notifications separately, don't block on it
      api.get('/users/notifications').then(notifs => {
        const unread = notifs.filter(n => !n.read).length;
        setUnreadNotifications(unread);
      }).catch(() => {});
      return true;
    } catch (err) {
      console.error('Failed to load profile:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
      return false;
    }
  };

  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem('ff-theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light' || isPublicRoute) {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }

    const token = localStorage.getItem('token');
    if (token) {
      // Load profile first, then redirect
      fetchProfile().then(success => {
        setLoading(false);
        if (success && isPublicRoute) router.push('/');
      });
    } else {
      setUser(null);
      setLoading(false);
      if (!isPublicRoute) router.push('/login');
    }

    // Network status listener
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    if (isPublicRoute || !user) return;

    const interval = setInterval(async () => {
      try {
        const notifs = await api.get('/users/notifications');
        const unread = notifs.filter(n => !n.read).length;
        
        setUnreadNotifications(prev => {
          if (prev !== null && unread > prev) {
            const unreadNotifs = notifs.filter(n => !n.read);
            const latest = unreadNotifs[0];
            if (latest) {
              if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
                new window.Notification(latest.title, {
                  body: latest.message,
                  icon: '/logo.jpeg',
                });
              }
              setActiveNotification(latest);
              setTimeout(() => {
                setActiveNotification(current => current?._id === latest._id ? null : current);
              }, 6000);
            }
          }
          return unread;
        });
      } catch (err) {
        console.error('Failed to poll notifications:', err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [user, isPublicRoute]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('ff-theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  };

  const login = () => {
    // Clerk handles login, this is a placeholder if needed elsewhere
    router.push('/');
  };

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => { await fetchProfile(); };

  const handleAcceptRules = async () => {
    if (!rulesTicked) return;
    setAcceptingRules(true);
    try {
      await api.put('/users/accept-rules');
      setUser(prev => ({ ...prev, rulesAccepted: true }));
    } catch (err) {
      alert('Failed to accept rules. Please try again.');
    } finally {
      setAcceptingRules(false);
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div 
        className="min-h-screen flex flex-col justify-center items-center gap-6"
        style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #ffffff 50%, #e2e8f0 100%)' }}
      >
        <div className="text-center">
          <p className="text-ff-orange text-sm font-bold uppercase tracking-[0.3em] font-heading animate-pulse">LOADING BATTLE DATA</p>
          <div className="tracer-loader mt-4">
            <div className="tracer-bullet"></div>
          </div>
          <p className="text-gray-500 text-xs mt-4 tracking-widest font-mono">INITIALIZING ARENA</p>
        </div>
      </div>
    );
  }

  // Banned Screen
  if (user && (user.status === 'temp-banned' || user.status === 'perm-banned') && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center px-6 text-center">
        {/* Diagonal cut warning card */}
        <div className="ff-card-cut bg-ff-error-bg border border-ff-error-border p-8 max-w-md w-full mb-6">
          <ShieldAlert size={56} className="text-ff-error-text mx-auto mb-4" style={{filter:'drop-shadow(0 0 12px rgba(204,17,0,0.6))'}} />
          <h1 className="text-3xl font-bold text-ff-error-text mb-2 uppercase tracking-wider font-heading">ACCOUNT BANNED</h1>
          <p className="text-ff-gray text-sm mb-4">
            Your account has been {user.status === 'temp-banned' ? 'temporarily' : 'permanently'} suspended for violations.
          </p>
          <div className="bg-background/80 border border-ff-border p-4 text-left text-xs font-mono mb-4 space-y-1">
            <p><span className="text-ff-orange">REASON:</span> <span className="text-ff-text">{user.banDetails?.reason || 'Platform violations.'}</span></p>
            {user.status === 'temp-banned' && (
              <p><span className="text-ff-orange">UNBAN:</span> <span className="text-ff-text">{new Date(user.banDetails?.bannedUntil).toLocaleString()}</span></p>
            )}
          </div>
          <button onClick={logout} className="ff-btn w-full py-3">EXIT ARENA</button>
        </div>
      </div>
    );
  }

  const showRulesModal = user && !user.rulesAccepted && !isPublicRoute;

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Matches', icon: Trophy, path: '/tournaments' },
    { name: 'Wallet', icon: Wallet, path: '/wallet' },
    { name: 'Results', icon: Upload, path: '/results' },
    { name: 'Inbox', icon: Bell, path: '/notifications', badge: unreadNotifications },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  if (isPublicRoute || pathname === '/') {
    return (
      <UserContext.Provider value={{ user, login, logout, refreshUser, toggleTheme, theme }}>
        {!isOnline && (
          <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col justify-center items-center p-6 text-center animate-fade-in">
            <div className="ff-card-cut bg-ff-error-bg border border-ff-error-border p-8 max-w-sm w-full">
              <AlertCircle size={56} className="text-ff-error-text mx-auto mb-4 animate-pulse" style={{filter:'drop-shadow(0 0 12px rgba(239,68,68,0.6))'}} />
              <h1 className="text-2xl font-bold text-ff-error-text mb-2 uppercase tracking-wider font-heading">NO INTERNET</h1>
              <p className="text-ff-gray text-sm mb-6">Connection to HQ lost. Please turn on your internet connection to continue.</p>
              <div className="tracer-loader"><div className="tracer-bullet bg-ff-error-text" style={{background:'linear-gradient(to right, transparent 0%, rgba(239,68,68,0.8) 50%, #ff4444 100%)'}}></div></div>
            </div>
          </div>
        )}
        {children}
      </UserContext.Provider>
    );
  }

  return (
    <UserContext.Provider value={{ user, login, logout, refreshUser, toggleTheme, theme }}>
      {/* In-app push notification toast */}
      {activeNotification && (
        <div className="fixed top-4 left-4 right-4 z-[999] bg-ff-panel border border-ff-orange p-4 shadow-[0_0_15px_rgba(255,107,0,0.25)] flex items-start gap-3 ff-card-cut animate-fade-in">
          <div className="w-8 h-8 bg-ff-orange/10 border border-ff-orange flex items-center justify-center ff-card-cut-sm flex-shrink-0">
            <Bell className="text-ff-orange animate-bounce" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-ff-text font-heading uppercase tracking-wider truncate">{activeNotification.title}</h4>
            <p className="text-[10px] text-ff-gray font-mono uppercase mt-0.5 line-clamp-2">{activeNotification.message}</p>
          </div>
          <button 
            onClick={() => setActiveNotification(null)} 
            className="text-[10px] text-ff-gray hover:text-ff-text uppercase font-bold tracking-widest font-mono border border-ff-border px-2 py-1 hover:border-ff-orange transition-colors"
          >
            DISMISS
          </button>
        </div>
      )}
      {showRulesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-ff-panel border border-ff-border shadow-fire w-full max-w-3xl max-h-[90vh] flex flex-col ff-card-cut">
            <div className="p-4 border-b border-ff-border bg-background flex-shrink-0">
              <h2 className="text-xl font-bold font-heading text-ff-orange uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert size={20} /> Action Required: Rules Acceptance
              </h2>
              <p className="text-xs text-ff-gray font-mono uppercase mt-1">
                You must accept the tournament rules before proceeding.
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <RulesContent />
            </div>

            <div className="p-4 border-t border-ff-border bg-background flex-shrink-0 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <input 
                  type="checkbox" 
                  checked={rulesTicked}
                  onChange={(e) => setRulesTicked(e.target.checked)}
                  className="w-5 h-5 accent-ff-orange cursor-pointer"
                />
                <span className="text-sm font-bold font-heading tracking-widest uppercase text-ff-text group-hover:text-ff-orange transition-colors">
                  I have read and agree to the Tournament Rules
                </span>
              </label>

              <button
                onClick={handleAcceptRules}
                disabled={!rulesTicked || acceptingRules}
                className="w-full ff-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {acceptingRules ? 'PROCESSING...' : 'ACCEPT & PROCEED'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!isOnline && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col justify-center items-center p-6 text-center animate-fade-in">
          <div className="ff-card-cut bg-ff-error-bg border border-ff-error-border p-8 max-w-sm w-full">
            <AlertCircle size={56} className="text-ff-error-text mx-auto mb-4 animate-pulse" style={{filter:'drop-shadow(0 0 12px rgba(239,68,68,0.6))'}} />
            <h1 className="text-2xl font-bold text-ff-error-text mb-2 uppercase tracking-wider font-heading">NO INTERNET</h1>
            <p className="text-ff-gray text-sm mb-6">Connection to HQ lost. Please turn on your internet connection to continue.</p>
            <div className="tracer-loader"><div className="tracer-bullet bg-ff-error-text" style={{background:'linear-gradient(to right, transparent 0%, rgba(239,68,68,0.8) 50%, #ff4444 100%)'}}></div></div>
          </div>
        </div>
      )}
      
      <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0 md:pl-64">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden md:flex flex-col w-64 fixed top-0 bottom-0 left-0 z-30 overflow-y-auto bg-panel"
          style={{borderRight:'1px solid var(--border-main)'}}>
          
          {/* Logo */}
          <div className="p-5 border-b" style={{borderColor:'var(--border-main)'}}>
            <div className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="Logo" className="w-10 h-10 object-cover rounded shadow-[0_0_8px_rgba(255,107,0,0.5)] border border-ff-orange" />
              <div>
                <h1 className="text-base font-bold tracking-widest text-ff-text font-heading leading-none">ALPHA ACE</h1>
                <span className="text-[9px] text-ff-orange tracking-[0.2em] font-mono uppercase">TOURNAMENT ARENA</span>
              </div>
            </div>
          </div>

          {/* Player Card */}
          <div className="p-4 border-b mx-3 mt-3 mb-1 bg-background" style={{borderColor:'var(--border-main)', clipPath:'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))'}}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 border border-ff-orange overflow-hidden bg-black/50 flex items-start justify-center" style={{clipPath:'polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px))'}}>
                  <img 
                    src={(user?.profilePic && user.profilePic !== '') ? user.profilePic : '/logo.jpeg'}
                    alt="Avatar" 
                    className="w-full h-full object-cover object-center"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/logo.jpeg'; }}
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-background z-10"></span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate text-ff-text font-heading tracking-wide">{user?.name?.toUpperCase()}</p>
                <p className="text-[10px] text-ff-orange font-mono">UID: {user?.freeFireUid || 'NOT SET'}</p>
                <p className="text-[10px] text-ff-gold font-mono font-bold">₹{user?.walletBalance?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 p-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link key={item.name} href={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 transition-all duration-200 group ${isActive ? 'ff-active bg-background' : 'hover:bg-ff-orange/5'}`}
                  >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={isActive ? 'text-ff-orange' : 'text-ff-gray group-hover:text-ff-orange transition-colors'} />
                    <span className={`text-sm font-bold tracking-wide font-heading uppercase ${isActive ? 'text-ff-text' : 'text-ff-gray group-hover:text-ff-text transition-colors'}`}>
                      {item.name}
                    </span>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-ff-red text-ff-text text-[9px] px-1.5 py-0.5 font-bold font-mono"
                      style={{clipPath:'polygon(0 0,calc(100% - 3px) 0,100% 3px,100% 100%,3px 100%,0 calc(100% - 3px))'}}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Extra bottom space for sidebar if needed */}
          <div className="p-4 border-t flex flex-col gap-2" style={{borderColor:'var(--border-main)'}}>
            <p className="text-center text-[9px] text-ff-gray font-mono uppercase">V1.0 ALPHA ACE</p>
          </div>
        </aside>

        {/* ── Top Header ── */}
        <header className="h-14 sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between bg-panel/90 backdrop-blur-md"
          style={{borderBottom:'1px solid var(--border-main)'}}>
          {/* Desktop: page title */}
          <h2 className="text-base font-bold tracking-widest uppercase hidden md:block font-heading text-ff-text">
            <span className="text-ff-orange">▸</span> {navItems.find(i => i.path === pathname)?.name || 'Arena'}
          </h2>
          {/* Mobile: FF logo */}
          <div className="flex items-center gap-2 md:hidden">
            <img src="/logo.jpeg" alt="Logo" className="w-6 h-6 object-cover rounded shadow-[0_0_8px_rgba(255,107,0,0.5)] border border-ff-orange" />
            <span className="text-base font-bold tracking-widest text-ff-text font-heading">ALPHA ACE</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-1.5 text-ff-gray hover:text-ff-orange transition-colors">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Gold wallet chip */}
            <Link href="/wallet" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-mono text-ff-gold transition-all hover:brightness-110 bg-ff-gold/10 border border-ff-gold/30"
              style={{clipPath:'polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px))'}}>
              <Wallet size={13} />
              ₹{user?.walletBalance?.toFixed(2)}
            </Link>
            {/* Avatar */}
            <Link href="/profile" className="w-8 h-8 border border-ff-orange hover:brightness-110 transition-all overflow-hidden bg-black/50 flex items-start justify-center"
              style={{clipPath:'polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px))'}}>
                <img 
                  src={(user?.profilePic && user.profilePic !== '') ? user.profilePic : '/logo.jpeg'}
                  alt="Avatar" 
                  className="w-full h-full object-cover object-center"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/logo.jpeg'; }}
                />
            </Link>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
          {children}
        </main>

        {/* ── Mobile Bottom Nav ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 flex justify-around items-center px-2 z-30"
          style={{background:'rgba(13,13,11,0.96)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(255,107,0,0.15)'}}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link key={item.name} href={item.path}
                className={`flex flex-col items-center justify-center w-12 h-12 relative transition-all ${isActive ? 'text-ff-orange' : 'text-ff-gray'}`}>
                <Icon size={19} style={isActive ? {filter:'drop-shadow(0 0 6px rgba(255,107,0,0.8))'} : {}} />
                <span className="text-[9px] mt-0.5 font-bold tracking-wide font-heading uppercase">{item.name}</span>
                {item.badge > 0 && (
                  <span className="absolute top-0 right-0 bg-ff-red text-ff-text text-[8px] w-4 h-4 flex items-center justify-center font-bold rounded-none"
                    style={{clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)'}}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </UserContext.Provider>
  );
}
