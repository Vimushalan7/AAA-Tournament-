'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '../../../components/ClientWrapper';
import { api } from '../../../utils/api';
import {
  Calendar, Trophy, ShieldAlert, Users, Coins, ChevronLeft,
  Copy, Check, Swords, Star, Lock, Eye, AlertCircle, Flame, Target
} from 'lucide-react';
import Link from 'next/link';

export default function TournamentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, refreshUser } = useUser();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [joinModal, setJoinModal] = useState(false);
  const [joining, setJoining] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPw, setCopiedPw] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regFfName, setRegFfName] = useState('');
  const [regFfUid, setRegFfUid] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);

  const getRequiredMembersCount = (gameMode) => {
    switch (gameMode) {
      case 'Duo': return 2;
      case 'Squad':
      case '4v4': return 4;
      case '5v5': return 5;
      case '6v6': return 6;
      default: return 1;
    }
  };

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/tournaments/${id}`, { userId: user?._id });
      setData(res);
    } catch (err) {
      console.error('Error fetching details:', err);
      setError(err.message || 'Error loading match details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDetails();
    }
  }, [id, user]);

  const handleJoinTournament = async () => {
    if (!regFfUid) {
      setError('Free Fire UID is required');
      setJoinModal(false);
      return;
    }

    setJoining(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post(`/tournaments/${id}/join`, {
        email: regEmail,
        ffName: regFfName,
        freeFireUid: regFfUid,
        teamMembers: teamMembers
      });
      setSuccess(res.message || 'SUCCESSFULLY REGISTERED FOR DROP!');
      setJoinModal(false);
      await fetchDetails();
      await refreshUser();
    } catch (err) {
      setError(err.message || 'FAILED TO JOIN MATCH');
      setJoinModal(false);
    } finally {
      setJoining(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedPw(true);
      setTimeout(() => setCopiedPw(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex justify-center items-center">
        <Flame className="w-12 h-12 text-ff-orange animate-pulse" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-ff-error-bg border border-ff-error-border ff-card-cut text-center text-ff-error-text max-w-md mx-auto">
        <ShieldAlert className="mx-auto mb-2" size={32} />
        <p className="font-bold uppercase font-heading">{error}</p>
        <button onClick={fetchDetails} className="ff-btn mt-4">
          RETRY CONNECTION
        </button>
      </div>
    );
  }

  const { tournament, isRegistered, participantDetails, roomDetails, participants = [] } = data;
  const isFull = tournament.joinedSlots >= tournament.totalSlots;
  const matchEnded = tournament.status === 'completed';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Link href="/tournaments" className="inline-flex items-center gap-1 text-xs text-ff-gray hover:text-ff-text transition-colors font-bold uppercase tracking-wider font-heading mb-2">
        <ChevronLeft size={16} /> BACK TO LOBBIES
      </Link>

      {/* Banner */}
      <div className="bg-ff-panel ff-border ff-card-cut p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-ff-orange/10 to-transparent pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="ff-badge-orange">
                {tournament.matchType === 'Clash Squad' ? 'CS' : 'BR'} - {tournament.gameMode}
              </span>
              <span className="ff-badge-gray">
                {tournament.map}
              </span>
              <span className="ff-badge-red">
                {tournament.status}
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-wide uppercase text-ff-text font-heading">{tournament.title}</h1>
            <p className="text-[11px] text-ff-gray flex items-center gap-2 font-mono uppercase tracking-widest">
              <Calendar size={14} className="text-ff-orange" />
              DROP TIME: {new Date(tournament.matchTime).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-4 sm:border-l border-ff-border sm:pl-6">
            <div className="font-mono bg-background/50 p-2 border border-ff-border ff-card-cut-sm">
              <p className="text-[9px] text-ff-gray uppercase font-bold tracking-[0.2em]">ENTRY FEE</p>
              <p className="text-xl font-black text-ff-orange">{tournament.entryFee === 0 ? 'FREE' : `₹${tournament.entryFee}`}</p>
            </div>
            <div className="font-mono bg-background/50 p-2 border border-ff-border ff-card-cut-sm">
              <p className="text-[9px] text-ff-gray uppercase font-bold tracking-[0.2em]">PRIZE POOL</p>
              <p className="text-xl font-black text-ff-gold">₹{tournament.prizePool}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications block */}
      {success && (
        <div className="p-4 bg-ff-success-bg border border-ff-success-border ff-card-cut-sm text-ff-success-text text-xs flex items-center gap-2 font-bold uppercase tracking-wider font-mono">
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-ff-error-bg border border-ff-error-border ff-card-cut-sm text-ff-error-text text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-bold uppercase tracking-wider font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
          {error.includes('Profile') && (
            <Link href="/profile" className="shrink-0 bg-ff-error-text text-black px-4 py-2 hover:bg-white transition-colors">
              COMPLETE PROFILE
            </Link>
          )}
        </div>
      )}

      {/* Main Grid split */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column (Details and buttons) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Lobby Access Panel */}
          {isRegistered && (
            <div className="bg-gradient-to-r from-ff-panel to-ff-orange/10 ff-border ff-card-cut p-5 space-y-3 relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-10"><Lock size={64} className="text-ff-orange" /></div>
              <h3 className="ff-section-title relative z-10">
                LOBBY CREDENTIALS
              </h3>
              {roomDetails ? (
                <div className="space-y-4 relative z-10">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ff-orange">Drop details acquired. Enter Custom Room immediately.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background/80 p-3 border border-ff-border ff-card-cut-sm flex justify-between items-center font-mono">
                      <div>
                        <span className="text-[9px] text-ff-gray block font-bold tracking-[0.2em]">ROOM ID</span>
                        <span className="font-bold text-lg tracking-wider text-ff-text">{roomDetails.roomId}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(roomDetails.roomId, 'id')}
                        className="text-ff-orange hover:text-ff-text transition-colors"
                      >
                        {copiedId ? <Check size={18} className="text-ff-success-text" /> : <Copy size={18} />}
                      </button>
                    </div>

                    <div className="bg-background/80 p-3 border border-ff-border ff-card-cut-sm flex justify-between items-center font-mono">
                      <div>
                        <span className="text-[9px] text-ff-gray block font-bold tracking-[0.2em]">PASSWORD</span>
                        <span className="font-bold text-lg tracking-wider text-ff-text">{roomDetails.password}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(roomDetails.password, 'pw')}
                        className="text-ff-orange hover:text-ff-text transition-colors"
                      >
                        {copiedPw ? <Check size={18} className="text-ff-success-text" /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-background/50 border border-ff-border ff-card-cut-sm text-[11px] text-ff-gray uppercase tracking-widest font-bold">
                  <Eye size={18} className="text-ff-orange" />
                  <span>ROOM ID & PASSWORD REVEALED 15 MINS BEFORE DROP.</span>
                </div>
              )}
            </div>
          )}

          {/* Join action */}
          {tournament.status === 'upcoming' && !isRegistered && (
            <div className="bg-ff-panel border border-ff-border ff-card-cut p-5 flex items-center justify-between gap-4">
              <div className="text-[11px] text-ff-gray uppercase tracking-wider font-bold">
                <p>SLOTS FILLED: <span className="text-ff-text">{tournament.joinedSlots} / {tournament.totalSlots}</span></p>
                <p className="mt-1">DEDUCTION: <span className="text-ff-orange font-black font-mono tracking-widest">₹{tournament.entryFee}</span></p>
              </div>
              <button
                disabled={isFull}
                onClick={() => {
                  setRegEmail(user?.email || '');
                  setRegFfName(user?.name || '');
                  setRegFfUid(user?.freeFireUid || '');
                  
                  const required = getRequiredMembersCount(tournament.gameMode);
                  if (required > 1) {
                    setTeamMembers(Array.from({ length: required - 1 }, () => ({ ffName: '', freeFireUid: '' })));
                  } else {
                    setTeamMembers([]);
                  }
                  
                  setJoinModal(true);
                }}
                className={`ff-btn px-6 py-3 ${isFull ? 'bg-background border border-ff-border text-ff-gray opacity-50 cursor-not-allowed' : ''}`}
                style={isFull ? {background:'transparent'} : {}}
              >
                {isFull ? 'LOBBY FULL' : 'DEPLOY NOW'}
              </button>
            </div>
          )}

          {/* Joined notification button */}
          {tournament.status === 'upcoming' && isRegistered && (
            <div className="bg-emerald-900/10 border border-emerald-500/30 ff-card-cut-sm p-4 flex items-center justify-between text-[11px] text-ff-success-text font-bold uppercase tracking-wider">
              <span>DEPLOYMENT CONFIRMED! PREPARE YOUR LOADOUT.</span>
              <span className="bg-emerald-900/40 px-3 py-1 border border-ff-success-border ff-card-cut-sm">ENLISTED</span>
            </div>
          )}

          {/* Match rules */}
          <div className="bg-ff-panel border border-ff-border ff-card-cut p-5 space-y-4">
            <h3 className="ff-section-title">
              ZONE SPECIFICATIONS
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-center">
              <div className="bg-background/80 p-3 border border-ff-border ff-card-cut-sm">
                <span className="text-[9px] text-ff-gray block font-bold tracking-[0.1em]">MODE</span>
                <span className="font-bold text-sm text-ff-text uppercase">{tournament.gameMode}</span>
              </div>
              <div className="bg-background/80 p-3 border border-ff-border ff-card-cut-sm">
                <span className="text-[9px] text-ff-gray block font-bold tracking-[0.1em]">MAP</span>
                <span className="font-bold text-sm text-ff-text uppercase">{tournament.map}</span>
              </div>
              <div className="bg-background/80 p-3 border border-ff-border ff-card-cut-sm">
                <span className="text-[9px] text-ff-gray block font-bold tracking-[0.1em]">PER KILL</span>
                <span className="font-bold text-sm text-ff-orange">₹{tournament.prizePoolDetails?.perKill}</span>
              </div>
              <div className="bg-background/80 p-3 border border-ff-border ff-card-cut-sm">
                <span className="text-[9px] text-ff-gray block font-bold tracking-[0.1em]">BOOYAH PRIZE</span>
                <span className="font-bold text-sm text-ff-gold">₹{tournament.prizePoolDetails?.rank1}</span>
              </div>
            </div>

            {tournament.description && (
              <div className="mt-6 pt-4 border-t border-ff-border/50">
                <h4 className="text-[10px] text-ff-orange uppercase font-bold tracking-[0.1em] mb-2 flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  SPECIAL DIRECTIVES (RULES)
                </h4>
                <div className="bg-background/40 border border-ff-border/50 p-4 rounded text-xs text-ff-gray font-mono leading-relaxed whitespace-pre-wrap">
                  {tournament.description}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-ff-border">
              <h4 className="text-[11px] uppercase font-bold text-ff-orange mb-3 tracking-widest">RULES OF ENGAGEMENT:</h4>
              <ul className="space-y-2 text-[11px] text-ff-gray uppercase tracking-wider font-bold">
                {tournament.rules.map((rule, idx) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <Target size={12} className="text-ff-orange flex-shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Registered Participants / Results */}
        <div className="space-y-4">
          
          {/* Top 3 Podium (Only if match ended) */}
          {matchEnded && participants.filter(p => p.rank > 0).length > 0 && (
            <>
              <h3 className="ff-section-title text-ff-gold">
                <Trophy size={18} className="inline-block mr-2 pb-1" />
                MATCH PODIUM
              </h3>
              <div className="flex flex-col gap-3 mb-6">
                {participants
                  .filter(p => p.rank > 0 && p.rank <= 3)
                  .sort((a, b) => a.rank - b.rank)
                  .map((winner) => (
                    <div key={winner._id} className={`p-4 ff-card-cut flex items-center justify-between border ${
                      winner.rank === 1 ? 'bg-amber-500/10 border-amber-500/50' :
                      winner.rank === 2 ? 'bg-slate-300/10 border-slate-400/50' :
                      'bg-orange-800/10 border-orange-700/50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black font-heading text-background ${
                          winner.rank === 1 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
                          winner.rank === 2 ? 'bg-slate-300 shadow-[0_0_10px_rgba(203,213,225,0.5)]' :
                          'bg-orange-700 shadow-[0_0_10px_rgba(194,65,12,0.5)]'
                        }`}>
                          #{winner.rank}
                        </div>
                        <div>
                          <p className="font-bold uppercase tracking-wider text-ff-text text-sm">{winner.ffName || winner.userId?.name}</p>
                          <p className="text-[10px] text-ff-gray font-mono uppercase tracking-widest">{winner.kills} KILLS</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-ff-gray uppercase tracking-widest font-bold">REWARD</p>
                        <p className="text-ff-success-text font-black font-mono">₹{winner.prizeWon}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}

          <h3 className="ff-section-title">
            {matchEnded ? 'FULL LEADERBOARD' : 'ROSTER'}
          </h3>

          <div className="bg-ff-panel border border-ff-border ff-card-cut overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-background border-b border-ff-border text-[9px] text-ff-gray uppercase font-bold tracking-widest font-heading">
                <tr>
                  <th className="p-3 w-12 text-center">Slot</th>
                  <th className="p-3">Player</th>
                  <th className="p-3">FF UID</th>
                  {matchEnded ? (
                    <>
                      <th className="p-3 text-center">Kills</th>
                      <th className="p-3 text-right">Prize</th>
                    </>
                  ) : (
                    <th className="p-3 text-right">Status</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-ff-border">
                {(() => {
                  // Flatten all participants + their team members into individual slot rows
                  const flatSlots = [];
                  participants.forEach((player) => {
                    // Leader row
                    flatSlots.push({
                      type: 'leader',
                      ffName: player.ffName || player.userId?.name || 'SURVIVOR',
                      freeFireUid: player.freeFireUid,
                      kills: player.kills,
                      prizeWon: player.prizeWon,
                      hasTeam: player.teamMembers && player.teamMembers.length > 0,
                      id: player._id,
                    });
                    // Team member rows (each gets their own slot)
                    if (player.teamMembers && player.teamMembers.length > 0) {
                      player.teamMembers.forEach((member, midx) => {
                        flatSlots.push({
                          type: 'member',
                          ffName: member.ffName,
                          freeFireUid: member.freeFireUid,
                          kills: null,
                          prizeWon: null,
                          id: `${player._id}-m${midx}`,
                        });
                      });
                    }
                  });

                  // Fill remaining slots up to totalSlots with empty placeholders
                  const totalSlots = tournament?.totalSlots || 0;
                  const emptyCount = Math.max(0, totalSlots - flatSlots.length);
                  for (let i = 0; i < emptyCount; i++) {
                    flatSlots.push({ type: 'empty', id: `empty-${i}` });
                  }

                  if (flatSlots.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-ff-gray font-mono text-[10px] uppercase font-bold tracking-widest">NO ENLISTMENTS YET</td>
                      </tr>
                    );
                  }

                  return flatSlots.map((slot, idx) => {
                    if (slot.type === 'empty') {
                      return (
                        <tr key={slot.id} className="opacity-30">
                          <td className="p-3 text-center font-mono text-ff-gray font-bold">{idx + 1}</td>
                          <td className="p-3">
                            <span className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-sm bg-ff-border"></span>
                              <span className="text-ff-gray font-mono tracking-widest text-[10px]">— OPEN SLOT —</span>
                            </span>
                          </td>
                          <td className="p-3 font-mono text-ff-gray/40 text-[11px]">———</td>
                          {matchEnded ? (
                            <><td className="p-3"></td><td className="p-3"></td></>
                          ) : (
                            <td className="p-3 text-right">
                              <span className="text-[9px] text-ff-border border border-ff-border/30 px-2 py-0.5 ff-card-cut-sm font-bold tracking-widest uppercase">VACANT</span>
                            </td>
                          )}
                        </tr>
                      );
                    }

                    const isLeader = slot.type === 'leader';
                    return (
                      <tr key={slot.id} className={`hover:bg-ff-orange/5 transition-colors ${!isLeader ? 'bg-background/30' : ''}`}>
                        <td className="p-3 text-center font-mono text-ff-gray font-bold">{idx + 1}</td>
                        <td className="p-3 flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-sm ${isLeader ? 'bg-ff-orange' : 'bg-ff-gray/50'}`}></span>
                          <span className={`font-bold truncate max-w-[120px] uppercase ${isLeader ? 'text-ff-text' : 'text-ff-gray'}`}>
                            {slot.ffName}
                            {isLeader && slot.hasTeam && (
                              <span className="ml-2 text-[8px] bg-ff-orange/20 text-ff-orange px-1.5 py-0.5 rounded border border-ff-orange/30">LEADER</span>
                            )}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-ff-gray text-[11px] font-bold tracking-wider">{slot.freeFireUid}</td>
                        {matchEnded ? (
                          <>
                            <td className="p-3 text-center font-black font-mono text-ff-text">{slot.kills ?? '—'}</td>
                            <td className="p-3 text-right font-black text-ff-success-text font-mono">
                              {slot.prizeWon > 0 ? `₹${slot.prizeWon}` : '—'}
                            </td>
                          </>
                        ) : (
                          <td className="p-3 text-right">
                            <span className={`text-[9px] border px-2 py-0.5 ff-card-cut-sm font-bold tracking-widest uppercase ${isLeader ? 'text-ff-orange border-ff-orange/30' : 'text-ff-gray border-ff-border/30'}`}>
                              {isLeader ? 'READY' : 'SQUAD'}
                            </span>
                          </td>
                        )}
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Drawer */}
      {joinModal && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-ff-panel border border-ff-orange p-6 w-full max-w-sm relative animate-scale-in ff-card-cut shadow-fire">
            <h3 className="text-xl font-black text-ff-text mb-2 uppercase tracking-wide font-heading border-b border-ff-border pb-2 flex items-center gap-2">
               <ShieldAlert size={20} className="text-ff-orange" /> CONFIRM DEPLOYMENT
            </h3>

            <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="bg-background/40 p-3 border border-ff-border ff-card-cut-sm">
                <h4 className="text-[11px] text-ff-orange uppercase font-bold tracking-widest mb-2 border-b border-ff-border/50 pb-1">PLAYER 1 (LEADER)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-ff-gray uppercase tracking-widest font-bold mb-1 block">Email</label>
                    <input type="text" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full bg-background border border-ff-border p-2 text-sm text-ff-text ff-card-cut-sm focus:border-ff-orange focus:outline-none transition-colors" placeholder="Enter Email" />
                  </div>
                  <div>
                    <label className="text-[10px] text-ff-gray uppercase tracking-widest font-bold mb-1 block">Free Fire Name</label>
                    <input type="text" value={regFfName} onChange={(e) => setRegFfName(e.target.value)} className="w-full bg-background border border-ff-border p-2 text-sm text-ff-text ff-card-cut-sm focus:border-ff-orange focus:outline-none transition-colors" placeholder="Enter FF Name" />
                  </div>
                  <div>
                    <label className="text-[10px] text-ff-gray uppercase tracking-widest font-bold mb-1 block">Free Fire UID (Required)</label>
                    <input type="text" value={regFfUid} onChange={(e) => setRegFfUid(e.target.value)} className="w-full bg-background border border-ff-border p-2 text-sm text-ff-text ff-card-cut-sm focus:border-ff-orange focus:outline-none transition-colors" placeholder="Enter FF UID" />
                  </div>
                </div>
              </div>

              {teamMembers.map((member, idx) => (
                <div key={idx} className="bg-background/40 p-3 border border-ff-border ff-card-cut-sm">
                  <h4 className="text-[11px] text-ff-orange uppercase font-bold tracking-widest mb-2 border-b border-ff-border/50 pb-1">PLAYER {idx + 2}</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-ff-gray uppercase tracking-widest font-bold mb-1 block">Free Fire Name</label>
                      <input type="text" value={member.ffName} onChange={(e) => {
                        const newMembers = [...teamMembers];
                        newMembers[idx].ffName = e.target.value;
                        setTeamMembers(newMembers);
                      }} className="w-full bg-background border border-ff-border p-2 text-sm text-ff-text ff-card-cut-sm focus:border-ff-orange focus:outline-none transition-colors" placeholder="Enter FF Name" required />
                    </div>
                    <div>
                      <label className="text-[10px] text-ff-gray uppercase tracking-widest font-bold mb-1 block">Free Fire UID</label>
                      <input type="text" value={member.freeFireUid} onChange={(e) => {
                        const newMembers = [...teamMembers];
                        newMembers[idx].freeFireUid = e.target.value;
                        setTeamMembers(newMembers);
                      }} className="w-full bg-background border border-ff-border p-2 text-sm text-ff-text ff-card-cut-sm focus:border-ff-orange focus:outline-none transition-colors" placeholder="Enter FF UID" required />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-ff-gray uppercase tracking-wider font-bold leading-relaxed mb-6 mt-4">
              Enlisting for <span className="text-ff-text">"{tournament.title}"</span>. <br/><br/>
              A fee of <span className="text-ff-orange text-sm font-black font-mono">₹{tournament.entryFee}</span> will be locked from your funds. Proceed?
            </p>

            <div className="flex gap-4">
              <button
                disabled={joining}
                onClick={() => setJoinModal(false)}
                className="flex-1 py-3 bg-background border border-ff-border ff-card-cut-sm text-xs font-bold uppercase tracking-widest text-ff-gray hover:text-ff-text transition-colors"
              >
                ABORT
              </button>
              <button
                disabled={joining}
                onClick={handleJoinTournament}
                className="flex-1 py-3 ff-btn text-xs"
              >
                {joining ? 'SYNCING...' : 'CONFIRM DROP'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
