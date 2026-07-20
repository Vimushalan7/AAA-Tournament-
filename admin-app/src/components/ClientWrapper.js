'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, Trophy, Radio, Users, Landmark,
  FolderLock, ShieldAlert, LogOut, BellRing, Settings, Terminal, Shield, Flame, Sun, Moon, AlertCircle, Monitor
} from 'lucide-react';
import Link from 'next/link';
import { api } from '../utils/api';

const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);

export default function ClientWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [isOnline, setIsOnline] = useState(true);

  const isPublicRoute = pathname === '/login';

  const checkAdminProfile = async () => {
    try {
      const token = localStorage.getItem('admin-token');
      if (!token) return false;
      const data = await api.get('/users/profile');
      if (data.role !== 'admin') {
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        alert('Access Denied: Only the authorised admin account can access this portal.');
        router.push('/login');
        return false;
      }
      setAdmin(data);
      return true;
    } catch (err) {
      console.error('Admin verification failed:', err);
      localStorage.removeItem('admin-token');
      localStorage.removeItem('admin-user');
      router.push('/login');
      return false;
    }
  };

  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem('ff-theme-admin') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light' || isPublicRoute) {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }

    const token = localStorage.getItem('admin-token');
    if (token) {
      checkAdminProfile().then(success => {
        setLoading(false);
        if (success && isPublicRoute) router.push('/');
      });
    } else {
      setAdmin(null);
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

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('ff-theme-admin', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  };

  const login = () => {
    router.push('/');
  };

  const logout = async () => {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-user');
    setAdmin(null);
    router.push('/login');
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center gap-6">
        <div className="text-center">
          <p className="text-ff-orange text-sm font-bold uppercase tracking-[0.3em] font-heading animate-pulse">LOADING SECURE HQ</p>
          <div className="tracer-loader mt-4">
            <div className="tracer-bullet"></div>
          </div>
          <p className="text-ff-gray text-xs mt-4 tracking-widest font-mono">INITIALIZING ADMIN SYSTEMS</p>
        </div>
      </div>
    );
  }

  // Fallback layout if non-admin tries to log in
  if (admin && admin.role !== 'admin' && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center px-6 text-center">
        <div className="ff-card-cut bg-ff-red/10 border border-ff-red/30 p-8 max-w-md w-full mb-6">
          <ShieldAlert size={56} className="text-ff-red mx-auto mb-4" style={{filter:'drop-shadow(0 0 12px rgba(204,17,0,0.6))'}} />
          <h1 className="text-3xl font-bold text-ff-red mb-2 uppercase tracking-wider font-heading">ACCESS DENIED</h1>
          <p className="text-ff-gray text-sm mb-6 font-mono">
            COMMAND CENTER AUTHORIZATION FAILED. YOU ARE NOT CLEARED FOR THIS SECTOR.
          </p>
          <button onClick={logout} className="ff-btn w-full py-3">ABORT & RETURN</button>
        </div>
      </div>
    );
  }

  if (isPublicRoute) {
    return (
      <AdminContext.Provider value={{ admin, login, logout, toggleTheme, theme }}>
        {!isOnline && (
          <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col justify-center items-center p-6 text-center animate-fade-in">
            <div className="ff-card-cut bg-ff-error-bg border border-ff-error-border p-8 max-w-sm w-full">
              <AlertCircle size={56} className="text-ff-error-text mx-auto mb-4 animate-pulse" style={{filter:'drop-shadow(0 0 12px rgba(204,17,0,0.6))'}} />
              <h1 className="text-2xl font-bold text-ff-error-text mb-2 uppercase tracking-wider font-heading">NO INTERNET</h1>
              <p className="text-ff-gray text-sm mb-6">Connection to HQ lost. Please turn on your internet connection to continue.</p>
              <div className="tracer-loader"><div className="tracer-bullet bg-ff-error-text" style={{background:'linear-gradient(to right, transparent 0%, rgba(204,17,0,0.8) 50%, #ff4444 100%)'}}></div></div>
            </div>
          </div>
        )}
        {children}
      </AdminContext.Provider>
    );
  }

  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Tournaments', icon: Trophy, path: '/tournaments' },
    { name: 'User Directory', icon: Users, path: '/users' },
    { name: 'Payout Requests', icon: Landmark, path: '/withdrawals' },
    { name: 'Match Audits', icon: FolderLock, path: '/results' },
    { name: 'Broadcast', icon: BellRing, path: '/notifications' },
    { name: 'Audit Logs', icon: Terminal, path: '/logs' },
  ];

  return (
    <AdminContext.Provider value={{ admin, login, logout, toggleTheme, theme }}>
      {!isOnline && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col justify-center items-center p-6 text-center animate-fade-in">
          <div className="ff-card-cut bg-ff-error-bg border border-ff-error-border p-8 max-w-sm w-full">
            <AlertCircle size={56} className="text-ff-error-text mx-auto mb-4 animate-pulse" style={{filter:'drop-shadow(0 0 12px rgba(204,17,0,0.6))'}} />
            <h1 className="text-2xl font-bold text-ff-error-text mb-2 uppercase tracking-wider font-heading">NO INTERNET</h1>
            <p className="text-ff-gray text-sm mb-6">Connection to HQ lost. Please turn on your internet connection to continue.</p>
            <div className="tracer-loader"><div className="tracer-bullet bg-ff-error-text" style={{background:'linear-gradient(to right, transparent 0%, rgba(204,17,0,0.8) 50%, #ff4444 100%)'}}></div></div>
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
              <img src="/logo.jpeg" alt="Logo" className="w-10 h-10 object-cover rounded shadow-[0_0_8px_rgba(204,17,0,0.5)] border border-ff-red" />
              <div>
                <h1 className="text-base font-bold tracking-widest text-ff-text font-heading leading-none uppercase">ALPHA ACE</h1>
                <span className="text-[9px] text-ff-red tracking-[0.2em] font-mono uppercase font-bold">ADMIN ACCESS</span>
              </div>
            </div>
          </div>

          {/* Admin Profile Brief */}
          <div className="p-4 border-b mx-3 mt-3 mb-1 bg-background" style={{borderColor:'var(--border-main)', clipPath:'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))'}}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={admin?.profilePic || '/logo.jpeg'}
                  alt="Avatar" className="w-11 h-11 object-cover border border-ff-red" style={{clipPath:'polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px))'}} />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-ff-red rounded-full border border-background"></span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate text-ff-text font-heading tracking-wide uppercase">{admin?.name}</p>
                <span className="ff-badge-red text-[8px] mt-1 inline-block">SYS ADMIN</span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 p-3 space-y-1 mt-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link key={item.name} href={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 transition-all duration-200 group ${isActive ? 'ff-active border-l-3 border-ff-red bg-background' : 'hover:bg-ff-orange/5'}`}
                  style={isActive ? {borderLeftColor: '#CC1100'} : {}}>
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={isActive ? 'text-ff-red' : 'text-ff-gray group-hover:text-ff-orange transition-colors'} />
                    <span className={`text-sm font-bold tracking-wide font-heading uppercase ${isActive ? 'text-ff-text' : 'text-ff-gray group-hover:text-ff-text transition-colors'}`}>
                      {item.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Support & Logout */}
          <div className="p-4 border-t flex flex-col gap-2" style={{borderColor:'var(--border-main)'}}>
            <a href="mailto:alpha.ace.support@gmail.com"
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-ff-gray hover:text-ff-red transition-colors font-heading font-bold uppercase tracking-wider border border-transparent">
              <AlertCircle size={15} />
              <span>SUPPORT</span>
            </a>
            <button onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-ff-gray hover:text-ff-red transition-colors font-heading font-bold uppercase tracking-wider border border-ff-red/20">
              <LogOut size={15} />
              <span>TERMINATE SESSION</span>
            </button>
          </div>
        </aside>

        {/* ── Top Header ── */}
        <header className="h-14 sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between md:ml-0 bg-panel/90 backdrop-blur-md"
          style={{borderBottom:'1px solid var(--border-main)'}}>
          
          <h2 className="text-base font-bold tracking-widest uppercase hidden md:block font-heading text-ff-text">
            <span className="text-ff-red">▸</span> {sidebarItems.find(i => i.path === pathname)?.name || 'Admin HQ'}
          </h2>
          
          <h2 className="text-base font-bold tracking-widest text-ff-red font-heading md:hidden flex items-center gap-2 uppercase">
            <img src="/logo.jpeg" alt="Logo" className="w-6 h-6 object-cover rounded shadow-[0_0_8px_rgba(204,17,0,0.5)] border border-ff-red" />
            ALPHA ACE ADMIN
          </h2>

          <div className="flex items-center gap-4">
            <button onClick={() => {
              const viewport = document.querySelector('meta[name="viewport"]');
              if (viewport) {
                if (viewport.getAttribute('content') === 'width=1024') {
                  viewport.setAttribute('content', 'width=device-width, initial-scale=1');
                } else {
                  viewport.setAttribute('content', 'width=1024');
                }
              }
            }} className="p-1.5 text-ff-gray hover:text-ff-orange transition-colors" title="Toggle Desktop Mode">
              <Monitor size={18} />
            </button>
            <button onClick={toggleTheme} className="p-1.5 text-ff-gray hover:text-ff-orange transition-colors">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <span className="ff-badge-orange text-[10px] animate-pulse">
              SYS STATUS: ACTIVE
            </span>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
          {children}
        </main>

        {/* ── Mobile Bottom Nav ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 flex justify-around items-center px-2 z-30 overflow-x-auto"
          style={{background:'rgba(13,13,11,0.96)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(204,17,0,0.15)'}}>
          {sidebarItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link key={item.name} href={item.path}
                className={`flex flex-col items-center justify-center w-12 h-12 relative transition-all ${isActive ? 'text-ff-red' : 'text-ff-gray'}`}>
                <Icon size={19} style={isActive ? {filter:'drop-shadow(0 0 6px rgba(204,17,0,0.8))'} : {}} />
                <span className="text-[9px] mt-0.5 font-bold tracking-wide font-heading uppercase whitespace-nowrap overflow-hidden text-ellipsis w-14 text-center">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </AdminContext.Provider>
  );
}
