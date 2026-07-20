'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import {
  Users, Trophy, Landmark, Receipt, Coins, ShieldAlert,
  ArrowUpRight, ArrowDownLeft, Sparkles, TrendingUp, Target, Flame
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[300px] flex justify-center items-center">
        <Flame className="w-12 h-12 text-ff-orange animate-pulse" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-[300px] flex justify-center items-center text-ff-gray font-mono">
        Failed to load dashboard data.
      </div>
    );
  }

  const statCards = [
    { name: 'TOTAL RECRUITS', value: stats.totalUsers, icon: Users, color: 'text-ff-orange border-ff-orange/20 bg-ff-orange/5' },
    { name: 'TOTAL ZONES', value: stats.totalMatches, icon: Trophy, color: 'text-ff-gold border-ff-gold/20 bg-ff-gold/5' },
    { name: 'ACTIVE DROPS', value: stats.activeTournaments, icon: TrendingUp, color: 'text-ff-success-text border-emerald-400/20 bg-emerald-400/5' },
    { name: 'PENDING PAYOUTS', value: stats.pendingWithdrawals, icon: ShieldAlert, color: 'text-ff-red border-ff-red/20 bg-ff-red/5', alert: stats.pendingWithdrawals > 0 },
    { name: "TODAY'S DEPOSITS", value: `₹${stats.todayCollection.toFixed(2)}`, icon: ArrowDownLeft, color: 'text-ff-orange border-ff-orange/20 bg-ff-orange/5' },
    { name: "TODAY'S PAYOUTS", value: `₹${stats.todayPayout.toFixed(2)}`, icon: ArrowUpRight, color: 'text-ff-red border-ff-red/20 bg-ff-red/5' },
    { name: 'TOTAL REVENUE', value: `₹${stats.totalRevenue.toFixed(2)}`, icon: Receipt, color: 'text-ff-gold border-ff-gold/20 bg-ff-gold/5' },
    { name: 'TOTAL SETTLED', value: `₹${stats.totalPayouts.toFixed(2)}`, icon: Landmark, color: 'text-ff-success-text border-emerald-400/20 bg-emerald-400/5' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-ff-panel ff-card-cut p-6 md:p-8 ff-border shadow-fire-sm">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-ff-orange/10 to-transparent pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-ff-red/15 rounded-full blur-[40px] pointer-events-none"></div>

        <div className="max-w-xl relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-ff-orange text-xs font-bold uppercase tracking-widest font-heading">
            <Target size={14} className="animate-pulse" />
            <span>COMMAND CENTER CONSOLE</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-wide text-ff-text uppercase font-heading">
            HQ OPERATIONS
          </h1>
          <p className="text-ff-gray text-xs md:text-sm leading-relaxed font-mono tracking-wider">
            Monitor overall zone activity, approve payout requests, audit mission reports, and deploy new match lobbies from the admin terminal.
          </p>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.name}
              className={`p-5 ff-card-cut-sm flex flex-col justify-between relative overflow-hidden transition-all ${
                card.alert ? 'border border-ff-red bg-ff-red/10 shadow-[0_0_15px_rgba(204,17,0,0.4)] animate-pulse' : 'bg-ff-panel border border-ff-border'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-bold tracking-widest text-ff-gray leading-tight font-heading">
                  {card.name}
                </span>
                <span className={`p-2 ff-card-cut-sm border ${card.color} flex-shrink-0`}>
                  <Icon size={16} />
                </span>
              </div>
              <span className="text-xl md:text-2xl font-black font-mono mt-4 text-ff-text">
                {card.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Admin Quick Links */}
      <div className="space-y-4">
        <h3 className="text-[11px] uppercase tracking-widest font-bold text-ff-gray font-heading">QUICK GATEWAYS</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/tournaments"
            className="p-4 bg-ff-panel border border-ff-border ff-card-cut text-center hover:border-ff-orange transition-colors group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-ff-orange/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Trophy className="mx-auto mb-2 text-ff-orange relative z-10" size={20} />
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-ff-text transition-colors text-ff-gray font-heading relative z-10">DEPLOY MATCH</span>
          </Link>
          <Link
            href="/rooms"
            className="p-4 bg-ff-panel border border-ff-border ff-card-cut text-center hover:border-emerald-500 transition-colors group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <TrendingUp className="mx-auto mb-2 text-emerald-500 relative z-10" size={20} />
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-ff-text transition-colors text-ff-gray font-heading relative z-10">PUBLISH ROOM</span>
          </Link>
          <Link
            href="/withdrawals"
            className="p-4 bg-ff-panel border border-ff-border ff-card-cut text-center hover:border-ff-red transition-colors group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-ff-red/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Landmark className="mx-auto mb-2 text-ff-red relative z-10" size={20} />
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-ff-text transition-colors text-ff-gray font-heading relative z-10">APPROVE PAYOUTS</span>
          </Link>
          <Link
            href="/results"
            className="p-4 bg-ff-panel border border-ff-border ff-card-cut text-center hover:border-ff-gold transition-colors group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-ff-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Coins className="mx-auto mb-2 text-ff-gold relative z-10" size={20} />
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-ff-text transition-colors text-ff-gray font-heading relative z-10">AUDIT WINNERS</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
