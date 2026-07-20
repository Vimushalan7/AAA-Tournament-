'use client';

import React from 'react';
import { useUser } from '../../components/ClientWrapper';
import { User, Sun, Moon, HelpCircle, MessageCircle, PlaySquare, Settings as SettingsIcon, LogOut, ChevronRight, ShieldAlert, Monitor } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { toggleTheme, theme, logout } = useUser();

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div className="border-b border-ff-border pb-4">
        <h1 className="text-3xl font-black tracking-widest text-ff-text font-heading uppercase flex items-center gap-2">
          <SettingsIcon className="text-ff-orange" size={28} /> SYSTEM SETTINGS
        </h1>
        <p className="text-xs text-ff-gray uppercase tracking-widest mt-1 font-mono">MANAGE YOUR APP PREFERENCES AND SUPPORT</p>
      </div>

      <div className="space-y-4">
        
        {/* Profile Link */}
        <div className="bg-ff-panel border border-ff-border ff-card-cut p-4 hover:border-ff-orange transition-colors">
          <Link href="/profile" className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-background flex items-center justify-center border border-ff-border group-hover:border-ff-orange ff-card-cut-sm">
                <User size={18} className="text-ff-gray group-hover:text-ff-orange transition-colors" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-ff-text font-heading tracking-widest uppercase">COMBAT DOSSIER</h3>
                <p className="text-[10px] text-ff-gray font-mono uppercase">Update Call sign, Game UID, and Avatar</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-ff-gray group-hover:text-ff-orange transition-colors" />
          </Link>
        </div>

        {/* Theme Toggle */}
        <div className="bg-ff-panel border border-ff-border ff-card-cut p-4">
          <button onClick={toggleTheme} className="w-full flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-background flex items-center justify-center border border-ff-border group-hover:border-ff-orange ff-card-cut-sm">
                {theme === 'dark' ? (
                  <Moon size={18} className="text-ff-orange transition-colors" />
                ) : (
                  <Sun size={18} className="text-ff-orange transition-colors" />
                )}
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-ff-text font-heading tracking-widest uppercase">APPEARANCE</h3>
                <p className="text-[10px] text-ff-gray font-mono uppercase">Current Mode: {theme.toUpperCase()}</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-background border border-ff-border text-xs font-bold text-ff-text font-mono group-hover:border-ff-orange">
              TOGGLE
            </div>
          </button>
        </div>

        {/* Original Help & Support (Email direct link removed in favor of About Page which has the email) */ }

        {/* Social Links */}
        <h3 className="text-sm font-bold text-ff-orange font-heading tracking-widest uppercase pt-4 pb-1 border-b border-ff-border/50">
          OFFICIAL COMM-CHANNELS
        </h3>

        <div className="bg-ff-panel border border-ff-border ff-card-cut p-4 hover:border-ff-orange transition-colors">
          <button onClick={() => window.open('https://youtube.com/@alphaacearena?si=0C3naB_zLYd_Ugh5', '_blank')} className="w-full flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-background flex items-center justify-center border border-ff-border group-hover:border-ff-orange ff-card-cut-sm">
                <PlaySquare size={18} className="text-ff-gray group-hover:text-ff-orange transition-colors" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-ff-text font-heading tracking-widest uppercase">YOUTUBE</h3>
                <p className="text-[10px] text-ff-gray font-mono uppercase">Subscribe to Alpha Ace Arena</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-ff-gray group-hover:text-ff-orange transition-colors" />
          </button>
        </div>

        <div className="bg-ff-panel border border-ff-border ff-card-cut p-4 hover:border-ff-orange transition-colors">
          <button onClick={() => window.open('https://whatsapp.com/channel/0029VbDMZ4BL7UVeZTSfhb1s', '_blank')} className="w-full flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-background flex items-center justify-center border border-ff-border group-hover:border-ff-orange ff-card-cut-sm">
                <MessageCircle size={18} className="text-ff-gray group-hover:text-ff-orange transition-colors" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-ff-text font-heading tracking-widest uppercase">WHATSAPP</h3>
                <p className="text-[10px] text-ff-gray font-mono uppercase">Follow for instant Intel & Updates</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-ff-gray group-hover:text-ff-orange transition-colors" />
          </button>
        </div>

        {/* About & Contact Us */}
        <div className="bg-ff-panel border border-ff-border ff-card-cut p-4 hover:border-ff-orange transition-colors">
          <Link href="/rules" className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-background flex items-center justify-center border border-ff-border group-hover:border-ff-orange ff-card-cut-sm">
                <ShieldAlert size={18} className="text-ff-gray group-hover:text-ff-orange transition-colors" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-ff-text font-heading tracking-widest uppercase">TOURNAMENT RULES</h3>
                <p className="text-[10px] text-ff-gray font-mono uppercase">Read our official policies and guidelines</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-ff-gray group-hover:text-ff-orange transition-colors" />
          </Link>
        </div>

        <div className="bg-ff-panel border border-ff-border ff-card-cut p-4 hover:border-ff-orange transition-colors">
          <Link href="/about" className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-background flex items-center justify-center border border-ff-border group-hover:border-ff-orange ff-card-cut-sm">
                <HelpCircle size={18} className="text-ff-gray group-hover:text-ff-orange transition-colors" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-ff-text font-heading tracking-widest uppercase">ABOUT & CONTACT US</h3>
                <p className="text-[10px] text-ff-gray font-mono uppercase">Read our mission and policies</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-ff-gray group-hover:text-ff-orange transition-colors" />
          </Link>
        </div>

        {/* Desktop Mode */}
        <div className="bg-ff-panel border border-ff-border ff-card-cut p-4 hover:border-ff-orange transition-colors">
          <button onClick={() => {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
              if (viewport.getAttribute('content') === 'width=1024') {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1');
                alert('Mobile Mode Restored');
              } else {
                viewport.setAttribute('content', 'width=1024');
                alert('Desktop Mode Enabled. Rotate your device for the best experience.');
              }
            }
          }} className="w-full flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-background flex items-center justify-center border border-ff-border group-hover:border-ff-orange ff-card-cut-sm">
                <Monitor size={18} className="text-ff-gray group-hover:text-ff-orange transition-colors" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-ff-text font-heading tracking-widest uppercase">DESKTOP MODE</h3>
                <p className="text-[10px] text-ff-gray font-mono uppercase">Force desktop view on mobile</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-ff-gray group-hover:text-ff-orange transition-colors" />
          </button>
        </div>

        {/* Logout */}
        <div className="pt-8">
          <button onClick={logout} className="w-full py-4 bg-ff-error-bg/20 border border-ff-error-border text-ff-error-text font-bold tracking-widest uppercase font-heading flex items-center justify-center gap-2 hover:bg-ff-error-text hover:text-black transition-colors ff-card-cut-sm">
            <LogOut size={18} /> INITIATE RETREAT (LOG OUT)
          </button>
        </div>

      </div>
    </div>
  );
}
