'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '../components/ClientWrapper';
import { api } from '../utils/api';
import { Shield, Trophy, Users, Swords, ChevronRight, AlertCircle, Flame, Target } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { user, refreshUser } = useUser();
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [stats, setStats] = useState({ joinedCount: 0, totalKills: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await refreshUser();

        const tournaments = await api.get('/tournaments', { status: 'upcoming' });
        setUpcomingMatches(tournaments.slice(0, 3));

        const history = await api.get('/users/matches');
        const joinedCount = history.length;
        const totalKills = history.reduce((acc, curr) => acc + (curr.kills || 0), 0);
        const totalEarnings = history.reduce((acc, curr) => acc + (curr.prizeWon || 0), 0);

        setStats({ joinedCount, totalKills, totalEarnings });
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-ff-panel ff-card-cut p-6 md:p-8 ff-border pulse-glow-blue">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-ff-orange/10 to-transparent pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-ff-red/15 rounded-full blur-[40px] pointer-events-none"></div>

        <div className="max-w-xl relative z-10">
          <div className="flex items-center gap-2 text-ff-orange text-xs font-bold uppercase tracking-[0.2em] mb-3 font-heading">
            <Flame size={16} className="animate-pulse" />
            <span>SQUAD SEASON LIVE</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black tracking-wide mb-2 uppercase text-ff-text font-heading">
            WELCOME TO THE ARENA, <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ff-orange to-ff-gold">
              {user?.name || 'SURVIVOR'}
            </span>
          </h1>
          
          <p className="text-ff-gray text-sm leading-relaxed mb-4 font-medium">
            Verify your FF UID <span className="text-ff-gold font-mono font-bold px-1">{user?.freeFireUid || 'NOT SET'}</span> in profile. 
            Drop into active lobbies, rack up kills, and secure real cash rewards directly to your wallet.
          </p>

          {!user?.freeFireUid && (
            <div className="mt-4 p-3 bg-ff-error-bg border border-ff-error-border ff-card-cut-sm text-xs text-ff-error-text flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span className="uppercase font-bold tracking-wide">UID Required: You must link your Free Fire Game UID in Settings before deploying.</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grids */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Wallet */}
        <div className="bg-ff-panel p-4 ff-card-cut-sm border border-ff-border flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity text-ff-gold"><Target size={40} /></div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-ff-gray font-heading">Combat Funds</span>
          <span className="text-2xl font-black font-mono text-ff-gold mt-2">₹{user?.walletBalance?.toFixed(2)}</span>
          <Link href="/wallet" className="text-[10px] text-ff-orange hover:text-ff-text font-bold mt-2 flex items-center gap-1 uppercase tracking-wider transition-colors">
            DEPLOY FUNDS <ChevronRight size={12} />
          </Link>
        </div>

        {/* Matches */}
        <div className="bg-ff-panel p-4 ff-card-cut-sm border border-ff-border flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity text-ff-text"><Shield size={40} /></div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-ff-gray font-heading">Drops</span>
          <span className="text-2xl font-black font-mono text-ff-text mt-2 flex items-center gap-2">
            {stats.joinedCount}
          </span>
          <Link href="/tournaments" className="text-[10px] text-ff-orange hover:text-ff-text font-bold mt-2 flex items-center gap-1 uppercase tracking-wider transition-colors">
            VIEW RECORD <ChevronRight size={12} />
          </Link>
        </div>

        {/* Kills */}
        <div className="bg-ff-panel p-4 ff-card-cut-sm border border-ff-border flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity text-ff-error-text"><Swords size={40} /></div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-ff-gray font-heading">Total Eliminations</span>
          <span className="text-2xl font-black font-mono text-ff-error-text mt-2 flex items-center gap-2">
            {stats.totalKills}
          </span>
          <span className="text-[10px] text-ff-gray mt-2 block uppercase tracking-wider">Confirmed</span>
        </div>

        {/* Earnings */}
        <div className="bg-ff-panel p-4 ff-card-cut-sm border border-ff-border flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity text-ff-success-text"><Trophy size={40} /></div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-ff-gray font-heading">Bounty Secured</span>
          <span className="text-2xl font-black font-mono text-ff-success-text mt-2">₹{stats.totalEarnings.toFixed(2)}</span>
          <span className="text-[10px] text-ff-gray mt-2 block uppercase tracking-wider">Withdrawable</span>
        </div>

      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Upcoming Matches Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-ff-border pb-2">
            <h3 className="ff-section-title">
              HOT DROPS (UPCOMING)
            </h3>
            <Link href="/tournaments" className="text-xs text-ff-orange hover:text-ff-text font-bold uppercase tracking-wider transition-colors">
              VIEW ALL LOBBIES
            </Link>
          </div>

          {loading ? (
            <div className="bg-ff-panel border border-ff-border ff-card-cut h-48 flex justify-center items-center">
              <Flame className="text-ff-orange animate-pulse" size={32} />
            </div>
          ) : upcomingMatches.length === 0 ? (
            <div className="bg-ff-panel border border-ff-border ff-card-cut p-8 text-center text-ff-gray text-sm uppercase tracking-wider font-heading">
              NO ACTIVE ZONES. WAIT FOR DEPLOYMENT ORDERS.
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingMatches.map((match) => (
                <div
                  key={match._id}
                  className="bg-ff-panel border border-ff-border ff-card-cut-sm p-4 hover:border-ff-orange/50 transition-colors flex flex-col md:flex-row justify-between md:items-center gap-4 relative overflow-hidden group"
                >
                  {/* Subtle red glow on hover */}
                  <div className="absolute inset-0 bg-ff-orange/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                  <div className="space-y-2 z-10">
                    <div className="flex items-center gap-2">
                      <span className="ff-badge-orange">{match.matchType === 'Clash Squad' ? 'CS' : 'BR'} - {match.gameMode}</span>
                      <span className="ff-badge-gray">{match.map}</span>
                    </div>
                    <h4 className="font-bold text-lg tracking-wide text-ff-text font-heading uppercase">{match.title}</h4>
                    <p className="text-[11px] text-ff-gray font-mono uppercase tracking-wider">
                      DROP TIME: <span className="text-ff-text">{new Date(match.matchTime).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-ff-border z-10">
                    <div className="text-left md:text-right font-mono">
                      <p className="text-[9px] text-ff-gray uppercase font-bold tracking-[0.2em]">ENTRY FEE</p>
                      <p className="text-sm font-black text-ff-orange">
                        {match.entryFee === 0 ? 'FREE' : `₹${match.entryFee}`}
                      </p>
                    </div>
                    <div className="text-left md:text-right font-mono">
                      <p className="text-[9px] text-ff-gray uppercase font-bold tracking-[0.2em]">PRIZE POOL</p>
                      <p className="text-sm font-black text-ff-gold">₹{match.prizePool}</p>
                    </div>

                    <Link
                      href={`/tournaments/${match._id}`}
                      className="ff-btn text-[11px] py-2 px-4 shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                    >
                      INSPECT ZONE
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Anti-Cheat / Info Column */}
        <div className="space-y-4">
          <div className="border-b border-ff-border pb-2">
            <h3 className="ff-section-title">
              RULES OF ENGAGEMENT
            </h3>
          </div>
          
          <div className="bg-ff-panel border border-ff-border ff-card-cut p-5 space-y-4 text-[11px] uppercase tracking-wide font-medium leading-relaxed text-ff-gray">
            <div className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-sm bg-ff-orange/10 text-ff-orange border border-ff-orange/30 flex items-center justify-center font-bold font-mono flex-shrink-0">1</span>
              <p>Register using your EXACT Free Fire UID. Spoofing triggers auto-bans.</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-sm bg-ff-orange/10 text-ff-orange border border-ff-orange/30 flex items-center justify-center font-bold font-mono flex-shrink-0">2</span>
              <p>Room ID & Passwords unlock 15 mins before match drop.</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-sm bg-ff-orange/10 text-ff-orange border border-ff-orange/30 flex items-center justify-center font-bold font-mono flex-shrink-0">3</span>
              <p>Upload your BOOYAH or death scorecard screenshot in the Results tab.</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-sm bg-ff-error-bg text-ff-error-text border border-ff-error-border flex items-center justify-center font-bold font-mono flex-shrink-0">4</span>
              <p className="text-ff-error-text">ANTI-CHEAT IS ACTIVE. Hackers or fake screenshots = PERMA-BAN.</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
