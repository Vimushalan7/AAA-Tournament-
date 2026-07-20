'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Info, ShieldCheck, Mail, AlertTriangle, Target, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-ff-border pb-4 flex items-center gap-4">
        <Link href="/settings" className="p-2 bg-ff-panel border border-ff-border ff-card-cut-sm hover:border-ff-orange transition-colors">
          <ChevronLeft className="text-ff-text" size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-widest text-ff-text font-heading uppercase flex items-center gap-2">
            <Info className="text-ff-orange" size={28} /> ABOUT US
          </h1>
          <p className="text-xs text-ff-gray uppercase tracking-widest mt-1 font-mono">Mission Statement & Contact</p>
        </div>
      </div>

      <div className="space-y-8 text-sm text-ff-text leading-relaxed">
        
        {/* Intro */}
        <div className="bg-ff-panel border border-ff-border p-6 ff-card-cut">
          <p className="mb-4">Welcome to <strong className="text-ff-orange font-heading tracking-wide">ALPHA ACE ARENA</strong>, your ultimate destination for competitive Free Fire tournaments.</p>
          <p>Our mission is to provide a fair, secure, and exciting platform where players can compete, showcase their skills, and win rewards through professionally organized tournaments. Whether you're a casual player looking for fun or a serious competitor aiming for victory, <strong className="text-ff-orange font-heading tracking-wide">ALPHA ACE ARENA</strong> is built to deliver a smooth, transparent, and enjoyable tournament experience.</p>
        </div>

        {/* What We Offer */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-heading uppercase text-ff-orange flex items-center gap-2">
            <Target size={20} /> What We Offer
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3 font-mono text-xs text-ff-gray">
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-ff-orange rotate-45"></div>Daily, weekly, and special Free Fire tournaments</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-ff-orange rotate-45"></div>Secure player registration and entry management</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-ff-orange rotate-45"></div>Transparent match schedules and room details</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-ff-orange rotate-45"></div>Fair play with strict anti-cheat policies</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-ff-orange rotate-45"></div>Fast and reliable prize distribution</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-ff-orange rotate-45"></div>Real-time tournament updates and notifications</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-ff-orange rotate-45"></div>User-friendly interface for seamless gaming</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-ff-orange rotate-45"></div>Dedicated customer support</li>
          </ul>
        </div>

        {/* Our Commitment */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-heading uppercase text-ff-orange flex items-center gap-2">
            <Users size={20} /> Our Commitment
          </h2>
          <div className="bg-background border border-ff-border p-5 rounded-lg space-y-3 font-mono text-xs">
            <p>At <strong className="text-ff-text">ALPHA ACE ARENA</strong>, we are committed to:</p>
            <ul className="space-y-2 text-ff-gray ml-2">
              <li>• Providing a fair and competitive environment for every player.</li>
              <li>• Ensuring transparency in tournament management and prize distribution.</li>
              <li>• Protecting user privacy and personal information.</li>
              <li>• Continuously improving our platform based on player feedback.</li>
              <li>• Delivering a reliable and enjoyable esports experience.</li>
            </ul>
          </div>
        </div>

        {/* Fair Play */}
        <div className="bg-ff-error-bg/20 border-l-4 border-ff-error-border p-5 rounded-r">
          <h2 className="text-lg font-bold font-heading uppercase text-ff-error-text flex items-center gap-2 mb-2">
            <ShieldCheck size={20} /> Fair Play Comes First
          </h2>
          <p className="text-xs font-mono text-ff-gray">
            We maintain a zero-tolerance policy against cheating, hacking, account sharing, exploiting game bugs, or any other unfair practices. Players who violate our Fair Play Policy may face warnings, disqualification, suspension, or permanent account bans.
          </p>
        </div>

        {/* Independent Platform */}
        <div className="space-y-2 border-t border-ff-border/50 pt-6">
          <h2 className="text-lg font-bold font-heading uppercase text-ff-text flex items-center gap-2">
            <AlertTriangle size={20} className="text-yellow-500" /> Independent Platform
          </h2>
          <p className="text-xs text-ff-gray font-mono leading-relaxed">
            <strong className="text-ff-text">ALPHA ACE ARENA</strong> is an independent esports tournament platform created for the gaming community. We are <strong>not affiliated with, endorsed by, sponsored by, or officially associated with Garena or Free Fire</strong>. All trademarks, logos, and game-related assets belong to their respective owners.
          </p>
          <p className="text-xs text-ff-gray font-mono leading-relaxed pt-2">
            Thank you for choosing ALPHA ACE ARENA. We are dedicated to creating an exciting, fair, and rewarding tournament experience for every player.
          </p>
        </div>

        {/* Contact Us */}
        <div className="bg-ff-panel border border-ff-orange p-6 ff-card-cut mt-8 text-center">
          <h2 className="text-2xl font-black font-heading uppercase text-ff-orange flex items-center justify-center gap-2 mb-4">
            <Mail size={24} /> Contact Us
          </h2>
          <p className="text-sm font-mono text-ff-gray mb-6">
            If you have any questions, suggestions, or need assistance, we're here to help.
          </p>
          <a 
            href="mailto:alpha.ace.support@gmail.com" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-ff-orange text-black font-bold font-heading uppercase tracking-widest hover:bg-white transition-colors ff-card-cut-sm"
          >
            <Mail size={18} /> Email Support
          </a>
          <p className="text-xs text-ff-gray mt-4 font-mono">alpha.ace.support@gmail.com</p>
        </div>

      </div>
    </div>
  );
}
