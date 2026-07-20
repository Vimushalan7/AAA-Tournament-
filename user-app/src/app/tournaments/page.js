'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { Trophy, Users, Swords, Calendar, Timer, CheckCircle, Flame } from 'lucide-react';
import Link from 'next/link';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [filter, setFilter] = useState('upcoming'); // upcoming, live, completed
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      try {
        const data = await api.get('/tournaments', { status: filter });
        setTournaments(data);
      } catch (err) {
        console.error('Failed to load tournaments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [filter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'text-ff-orange border-ff-orange/30 bg-ff-orange/5';
      case 'live': return 'text-ff-error-text border-ff-error-border bg-ff-red/5 animate-pulse';
      case 'completed': return 'text-ff-success-text border-emerald-400/30 bg-emerald-400/5';
      default: return 'text-ff-gray border-ff-border';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-ff-border pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-widest text-ff-text font-heading uppercase flex items-center gap-2">
            <Flame className="text-ff-orange" size={28} /> MATCH LOBBIES
          </h1>
          <p className="text-xs text-ff-gray uppercase tracking-widest mt-1 font-mono">Select and deploy into competitive divisions</p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-background p-1 border border-ff-border self-start ff-card-cut-sm">
          {['upcoming', 'live', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ff-card-cut-sm ${
                filter === status
                  ? 'bg-ff-orange text-ff-text shadow-[0_0_10px_rgba(255,107,0,0.4)]'
                  : 'text-ff-gray hover:text-ff-text hover:bg-ff-orange/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="min-h-[300px] flex justify-center items-center">
          <Flame className="w-12 h-12 text-ff-orange animate-pulse" />
        </div>
      ) : tournaments.length === 0 ? (
        <div className="bg-ff-panel/40 border border-ff-border ff-card-cut p-12 text-center text-ff-gray uppercase font-heading tracking-widest">
          NO MATCHES FOUND UNDER "{filter}" DIVISION.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((match) => {
            const slotsPercent = Math.min(100, Math.round((match.joinedSlots / match.totalSlots) * 100));
            const isFull = match.joinedSlots >= match.totalSlots;

            return (
              <div
                key={match._id}
                className="bg-ff-panel border border-ff-border hover:border-ff-orange/50 transition-all ff-card-cut-sm p-5 flex flex-col justify-between relative group overflow-hidden"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-ff-orange/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                {/* Floating status tag */}
                <span className={`absolute top-4 right-4 px-2 py-0.5 ff-card-cut-sm text-[9px] font-bold uppercase border ${getStatusColor(match.status)} z-10`}>
                  {match.status}
                </span>

                <div className="space-y-4 relative z-10">
                  {/* Game specs */}
                  <div className="flex gap-2">
                    <span className="ff-badge-orange">
                      {match.matchType === 'Clash Squad' ? 'CS' : 'BR'} - {match.gameMode}
                    </span>
                    <span className="ff-badge-gray">
                      {match.map}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-xl text-ff-text group-hover:text-ff-orange transition-colors leading-tight font-heading uppercase tracking-wide pr-16">
                    {match.title}
                  </h3>

                  {/* Datetime */}
                  <div className="flex items-center gap-2 text-[11px] text-ff-gray font-mono uppercase">
                    <Calendar size={14} className="text-ff-orange" />
                    <span>
                      {new Date(match.matchTime).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Fee vs Pool */}
                  <div className="grid grid-cols-2 gap-4 bg-background/50 p-3 border border-ff-border ff-card-cut-sm text-center">
                    <div>
                      <p className="text-[9px] text-ff-gray uppercase font-bold tracking-[0.2em] font-mono">Entry Fee</p>
                      <p className="text-base font-black text-ff-orange mt-0.5 font-heading">
                        {match.entryFee === 0 ? 'FREE' : `₹${match.entryFee}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-ff-gray uppercase font-bold tracking-[0.2em] font-mono">Prize Pool</p>
                      <p className="text-base font-black text-ff-gold mt-0.5 font-heading">₹{match.prizePool}</p>
                    </div>
                  </div>

                  {/* Slots Tracker */}
                  {match.status === 'upcoming' && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[10px] text-ff-gray font-mono uppercase font-bold">
                        <span className="flex items-center gap-1">
                          <Users size={12} className="text-ff-orange" />
                          SLOTS FILLED
                        </span>
                        <span className="text-ff-text">{match.joinedSlots} / {match.totalSlots}</span>
                      </div>
                      <div className="h-1.5 w-full bg-background rounded-none border border-ff-border overflow-hidden">
                        <div
                          className="h-full bg-ff-orange transition-all duration-300"
                          style={{ width: `${slotsPercent}%`, filter: 'drop-shadow(0 0 4px rgba(255,107,0,0.8))' }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-ff-border relative z-10">
                  <Link
                    href={`/tournaments/${match._id}`}
                    className={`w-full py-2.5 font-bold uppercase tracking-[0.2em] text-xs block text-center transition-all ff-card-cut font-heading ${
                      match.status === 'completed'
                        ? 'bg-ff-success-bg border border-emerald-500/30 text-ff-success-text hover:bg-emerald-900/40'
                        : isFull && match.status === 'upcoming'
                        ? 'bg-background border border-ff-border text-ff-gray cursor-not-allowed'
                        : 'bg-ff-orange text-ff-text shadow-[0_0_15px_rgba(255,107,0,0.3)] hover:shadow-[0_0_20px_rgba(255,107,0,0.6)] hover:bg-ff-orange/90'
                    }`}
                  >
                    {match.status === 'completed' ? 'VIEW LEADERBOARD' : match.status === 'live' ? 'VIEW LIVE LOBBY' : isFull ? 'LOBBY FULL' : 'INSPECT & JOIN'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
