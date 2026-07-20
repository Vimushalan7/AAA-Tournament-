'use client';

import React from 'react';
import RulesContent from '../../components/RulesContent';
import { ShieldAlert } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="border-b border-ff-border pb-4">
        <h1 className="text-3xl font-black tracking-widest text-ff-text font-heading uppercase flex items-center gap-2">
          <ShieldAlert className="text-ff-orange" size={28} /> TOURNAMENT RULES
        </h1>
        <p className="text-xs text-ff-gray uppercase tracking-widest mt-1 font-mono">OFFICIAL POLICIES AND GUIDELINES</p>
      </div>

      <div className="bg-ff-panel border border-ff-border p-6 sm:p-8 ff-card-cut shadow-fire-sm">
        <RulesContent />
      </div>
    </div>
  );
}
