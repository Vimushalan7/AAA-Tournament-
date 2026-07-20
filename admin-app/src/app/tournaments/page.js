'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import {
  Trophy, Plus, Trash2, XOctagon, Edit2,
  AlertCircle, CheckCircle2, Play, Flag, Loader2, Info
} from 'lucide-react';

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedTournamentInfo, setSelectedTournamentInfo] = useState(null);
  const [tournamentParticipants, setTournamentParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Create form states
  const [title, setTitle] = useState('');
  const [matchType, setMatchType] = useState('Battle Royale');
  const [gameMode, setGameMode] = useState('Solo');
  const [map, setMap] = useState('Bermuda');
  const [description, setDescription] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [perKillPrize, setPerKillPrize] = useState('');
  const [rank1Prize, setRank1Prize] = useState('');
  const [rank2Prize, setRank2Prize] = useState('');
  const [rank3Prize, setRank3Prize] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [totalSlots, setTotalSlots] = useState('48');

  // Edit form states
  const [editTitle, setEditTitle] = useState('');
  const [editMatchType, setEditMatchType] = useState('Battle Royale');
  const [editGameMode, setEditGameMode] = useState('Solo');
  const [editMap, setEditMap] = useState('Bermuda');
  const [editDescription, setEditDescription] = useState('');
  const [editEntryFee, setEditEntryFee] = useState('');
  const [editPrizePool, setEditPrizePool] = useState('');
  const [editPerKillPrize, setEditPerKillPrize] = useState('');
  const [editRank1Prize, setEditRank1Prize] = useState('');
  const [editRank2Prize, setEditRank2Prize] = useState('');
  const [editRank3Prize, setEditRank3Prize] = useState('');
  const [editMatchTime, setEditMatchTime] = useState('');
  const [editTotalSlots, setEditTotalSlots] = useState('48');
  const [editStatus, setEditStatus] = useState('upcoming');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const data = await api.get('/tournaments');
      setTournaments(data);
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  // Helper: convert ISO date to datetime-local input value
  const toLocalDatetimeInput = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    if (!title || !matchTime) return setError('Title and Schedule match time are required');

    setError(''); setSuccess(''); setSubmitting(true);

    const prizePoolDetails = {
      perKill: Number(perKillPrize || 0),
      rank1: Number(rank1Prize || 0),
      rank2: Number(rank2Prize || 0),
      rank3: Number(rank3Prize || 0),
    };

    try {
      await api.post('/admin/tournaments', {
        title, matchType, gameMode, map, description,
        entryFee: Number(entryFee || 0),
        prizePool: Number(prizePool || 0),
        prizePoolDetails, matchTime,
        totalSlots: Number(totalSlots || 48)
      });

      setSuccess('Match created successfully!');
      setShowCreateModal(false);
      setTitle(''); setEntryFee(''); setPrizePool('');
      setDescription('');
      setPerKillPrize(''); setRank1Prize(''); setRank2Prize('');
      setRank3Prize(''); setMatchTime('');
      await fetchTournaments();
    } catch (err) {
      setError(err.message || 'Error creating match');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (tournament) => {
    setEditingTournament(tournament);
    setEditTitle(tournament.title);
    setEditMatchType(tournament.matchType || 'Battle Royale');
    setEditGameMode(tournament.gameMode);
    setEditMap(tournament.map);
    setEditDescription(tournament.description || '');
    setEditEntryFee(String(tournament.entryFee));
    setEditPrizePool(String(tournament.prizePool));
    setEditPerKillPrize(String(tournament.prizePoolDetails?.perKill || 0));
    setEditRank1Prize(String(tournament.prizePoolDetails?.rank1 || 0));
    setEditRank2Prize(String(tournament.prizePoolDetails?.rank2 || 0));
    setEditRank3Prize(String(tournament.prizePoolDetails?.rank3 || 0));
    setEditMatchTime(toLocalDatetimeInput(tournament.matchTime));
    setEditTotalSlots(String(tournament.totalSlots));
    setEditStatus(tournament.status);
    setError(''); setSuccess('');
    setShowEditModal(true);
  };

  const handleEditTournament = async (e) => {
    e.preventDefault();
    if (!editTitle || !editMatchTime) return setError('Title and schedule time are required');
    setError(''); setSuccess(''); setSubmitting(true);
    const prizePoolDetails = {
      perKill: Number(editPerKillPrize || 0),
      rank1: Number(editRank1Prize || 0),
      rank2: Number(editRank2Prize || 0),
      rank3: Number(editRank3Prize || 0),
    };
    try {
      await api.put(`/admin/tournaments/${editingTournament._id}`, {
        title: editTitle, matchType: editMatchType, gameMode: editGameMode, map: editMap, description: editDescription,
        entryFee: Number(editEntryFee || 0),
        prizePool: Number(editPrizePool || 0),
        prizePoolDetails,
        matchTime: editMatchTime,
        totalSlots: Number(editTotalSlots || 48),
        status: editStatus,
      });
      setSuccess('Tournament updated successfully!');
      setShowEditModal(false);
      setEditingTournament(null);
      await fetchTournaments();
    } catch (err) {
      setError(err.message || 'Error updating tournament');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusUpdate = async (tournament, newStatus) => {
    if (!confirm(`Set "${tournament.title}" to ${newStatus.toUpperCase()}?`)) return;
    setError(''); setSuccess('');
    setStatusUpdating(tournament._id);
    try {
      await api.put(`/admin/tournaments/${tournament._id}`, { status: newStatus });
      setSuccess(`Tournament marked as ${newStatus}.`);
      await fetchTournaments();
    } catch (err) {
      setError(err.message || 'Status update failed');
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleCancelTournament = async (id) => {
    if (!confirm('CANCEL this tournament? All entry fees will be automatically refunded.')) return;
    setError(''); setSuccess('');
    try {
      const res = await api.post(`/admin/tournaments/${id}/cancel`);
      setSuccess(res.message || 'Tournament cancelled and refunds processed.');
      await fetchTournaments();
    } catch (err) {
      setError(err.message || 'Failed to cancel match');
    }
  };

  const handleDeleteTournament = async (id) => {
    if (!confirm('Permanently DELETE this tournament from the database?')) return;
    setError(''); setSuccess('');
    try {
      const res = await api.delete(`/admin/tournaments/${id}`);
      setSuccess(res.message || 'Tournament deleted.');
      await fetchTournaments();
    } catch (err) {
      setError(err.message || 'Failed to delete tournament');
    }
  };

  const handleOpenInfo = async (tournament) => {
    setSelectedTournamentInfo(tournament);
    setShowInfoModal(true);
    setLoadingParticipants(true);
    setTournamentParticipants([]);
    setError('');
    
    try {
      const res = await api.get(`/admin/tournaments/${tournament._id}/participants`);
      setTournamentParticipants(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch participants');
    } finally {
      setLoadingParticipants(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'upcoming': return 'text-neon-blue bg-neon-blue/5 border-neon-blue/20';
      case 'live': return 'text-red-500 bg-red-500/5 border-red-500/20 animate-pulse';
      case 'completed': return 'text-ff-success-text bg-emerald-400/5 border-emerald-400/20';
      case 'cancelled': return 'text-esports-gray bg-indigo-950/20 border-indigo-950/40';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">MATCH MANAGEMENT</h1>
          <p className="text-xs text-esports-gray uppercase tracking-widest mt-1">Deploy, monitor, edit, cancel or delete gaming division rooms</p>
        </div>
        <button
          onClick={() => { setShowCreateModal(true); setError(''); setSuccess(''); }}
          className="px-4 py-2 bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity text-xs font-bold uppercase tracking-wider rounded text-ff-text flex items-center gap-1.5 shadow-neon-purple"
        >
          <Plus size={16} /> Add Tournament
        </button>
      </div>

      {success && (
        <div className="p-4 bg-ff-success-bg border border-ff-success-border rounded-xl text-ff-success-text text-xs flex items-center gap-2">
          <CheckCircle2 size={16} /><span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-ff-error-bg border border-ff-error-border rounded-xl text-ff-error-text text-xs flex items-center gap-2">
          <AlertCircle size={16} /><span>{error}</span>
        </div>
      )}

      {/* Tournaments table */}
      <div className="bg-panel border border-indigo-950/30 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-esports-gray animate-pulse font-mono">LOADING DIRECTORY...</div>
        ) : tournaments.length === 0 ? (
          <div className="p-12 text-center text-xs text-esports-gray font-mono">NO TOURNAMENTS RECORDED</div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="bg-indigo-950/30 border-b border-indigo-950/50 text-[10px] text-esports-gray uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3">Tournament Details</th>
                <th className="p-3">Schedule Time</th>
                <th className="p-3 text-center">Entry/Pool</th>
                <th className="p-3 text-center">Slots</th>
                <th className="p-3 text-center">State</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-950/20">
              {tournaments.map((match) => (
                <tr key={match._id} className="hover:bg-indigo-950/10">
                  <td className="p-3">
                    <span className="font-bold text-ff-text block">{match.title}</span>
                    <span className="text-[10px] text-esports-gray font-mono uppercase tracking-wider">{match.matchType || 'Battle Royale'} • {match.gameMode} • Map: {match.map}</span>
                  </td>
                  <td className="p-3 font-mono text-esports-gray">{new Date(match.matchTime).toLocaleString()}</td>
                  <td className="p-3 text-center font-mono font-bold">
                    <span className="text-neon-blue">Fee: ₹{match.entryFee}</span>
                    <span className="text-esports-gray block text-[10px]">Pool: ₹{match.prizePool}</span>
                  </td>
                  <td className="p-3 text-center font-mono font-semibold">{match.joinedSlots} / {match.totalSlots}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${getStatusStyle(match.status)}`}>
                      {match.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Quick: Upcoming → Live */}
                      {match.status === 'upcoming' && (
                        <button onClick={() => handleQuickStatusUpdate(match, 'live')}
                          disabled={statusUpdating === match._id}
                          className="p-1.5 hover:bg-red-500/15 text-esports-gray hover:text-ff-error-text border border-transparent hover:border-red-500/30 rounded transition-colors"
                          title="Set LIVE">
                          {statusUpdating === match._id ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                        </button>
                      )}
                      {/* Quick: Live → Completed */}
                      {match.status === 'live' && (
                        <button onClick={() => handleQuickStatusUpdate(match, 'completed')}
                          disabled={statusUpdating === match._id}
                          className="p-1.5 hover:bg-emerald-500/15 text-esports-gray hover:text-ff-success-text border border-transparent hover:border-emerald-500/30 rounded transition-colors"
                          title="Set COMPLETED">
                          {statusUpdating === match._id ? <Loader2 size={14} className="animate-spin" /> : <Flag size={14} />}
                        </button>
                      )}
                      {/* Info */}
                      <button onClick={() => handleOpenInfo(match)}
                        className="p-1.5 hover:bg-indigo-950/50 text-esports-gray hover:text-ff-amber border border-transparent hover:border-ff-amber/30 rounded transition-colors"
                        title="View Participants Info">
                        <Info size={14} />
                      </button>
                      {/* Edit */}
                      {match.status !== 'cancelled' && (
                        <button onClick={() => openEditModal(match)}
                          className="p-1.5 hover:bg-indigo-950/50 text-esports-gray hover:text-neon-blue border border-transparent hover:border-neon-blue/30 rounded transition-colors"
                          title="Edit Tournament">
                          <Edit2 size={14} />
                        </button>
                      )}
                      {/* Cancel & Refund */}
                      {match.status === 'upcoming' && (
                        <button onClick={() => handleCancelTournament(match._id)}
                          className="p-1.5 hover:bg-red-950/35 text-esports-gray hover:text-ff-error-text border border-transparent hover:border-red-900/40 rounded transition-colors"
                          title="Cancel & Refund Match">
                          <XOctagon size={14} />
                        </button>
                      )}
                      {/* Delete */}
                      <button onClick={() => handleDeleteTournament(match._id)}
                        className="p-1.5 hover:bg-red-950/35 text-esports-gray hover:text-neon-pink border border-transparent hover:border-red-900/40 rounded transition-colors"
                        title="Delete Tournament">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── CREATE MODAL ──────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-panel border border-neon-purple rounded-xl p-6 w-full max-w-lg relative animate-scale-in text-ff-text shadow-neon-purple max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-ff-text mb-4 uppercase tracking-wider flex items-center gap-2">
              <Trophy size={18} className="text-neon-purple" />
              DEPLOY TOURNAMENT
            </h3>
            <form onSubmit={handleCreateTournament} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Match Title</label>
                  <input type="text" placeholder="e.g. Free Fire Weekly Brawl Solo" value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple" required />
                </div>
                <div>
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Match Type</label>
                  <select value={matchType} onChange={(e) => {
                    setMatchType(e.target.value);
                    setGameMode(e.target.value === 'Battle Royale' ? 'Solo' : '4v4');
                  }} className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple">
                    <option value="Battle Royale">Battle Royale</option>
                    <option value="Clash Squad">Clash Squad</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Game Mode</label>
                  <select value={gameMode} onChange={(e) => setGameMode(e.target.value)} className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple">
                    {matchType === 'Battle Royale' ? (
                      <><option value="Solo">Solo</option><option value="Duo">Duo</option><option value="Squad">Squad</option></>
                    ) : (
                      <><option value="4v4">4v4</option><option value="5v5">5v5</option><option value="6v6">6v6</option></>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Map</label>
                  <select value={map} onChange={(e) => setMap(e.target.value)} className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple">
                    <option value="Bermuda">Bermuda</option><option value="Purgatory">Purgatory</option><option value="Kalahari">Kalahari</option><option value="Alpine">Alpine</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Entry Fee (₹)</label>
                  <input type="number" placeholder="e.g. 50" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Total Prize Pool (₹)</label>
                  <input type="number" placeholder="e.g. 1000" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple font-mono" />
                </div>
                <div className="col-span-2 border-t border-indigo-950/60 pt-3">
                  <h4 className="text-[10px] text-neon-purple uppercase font-bold tracking-widest mb-3">Prize Distribution Breakdown</h4>
                  <div className="grid grid-cols-4 gap-2 font-mono">
                    {[{l:'PER KILL',v:perKillPrize,s:setPerKillPrize,p:'5'},{l:'RANK #1',v:rank1Prize,s:setRank1Prize,p:'500'},{l:'RANK #2',v:rank2Prize,s:setRank2Prize,p:'250'},{l:'RANK #3',v:rank3Prize,s:setRank3Prize,p:'100'}].map(f=>
                      <div key={f.l}>
                        <label className="text-[8px] text-esports-gray block mb-1">{f.l}</label>
                        <input type="number" placeholder={f.p} value={f.v} onChange={e=>f.s(e.target.value)} className="w-full bg-background border border-indigo-950 p-2 rounded text-xs text-center" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Match Time</label>
                  <input type="datetime-local" value={matchTime} onChange={(e) => setMatchTime(e.target.value)} className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple font-mono" required />
                </div>
                <div>
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Total Slots</label>
                  <input type="number" placeholder="48" value={totalSlots} onChange={(e) => setTotalSlots(e.target.value)} className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple font-mono" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Rules & Description</label>
                  <textarea rows={3} placeholder="Add custom rules or tournament description..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple text-ff-text leading-relaxed" />
                </div>
              </div>
              <div className="flex gap-4 border-t border-indigo-950/60 pt-4 mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-indigo-950/40 border border-indigo-900/30 rounded text-xs font-bold uppercase text-esports-gray hover:text-ff-text">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-neon-purple to-neon-blue rounded text-xs font-bold uppercase text-ff-text shadow-neon-purple disabled:opacity-50">
                  {submitting ? 'Deploying...' : 'Deploy Lobby'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ────────────────────────────────────────────────────────── */}
      {showEditModal && editingTournament && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-panel border border-neon-blue rounded-xl p-6 w-full max-w-lg relative animate-scale-in text-ff-text shadow-neon-blue max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-ff-text mb-1 uppercase tracking-wider flex items-center gap-2">
              <Edit2 size={18} className="text-neon-blue" />
              EDIT TOURNAMENT
            </h3>
            <p className="text-[10px] text-esports-gray font-mono mb-4 truncate">ID: {editingTournament._id}</p>
            <form onSubmit={handleEditTournament} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Match Title</label>
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-blue" required />
                </div>
                <div>
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Match Type</label>
                  <select value={editMatchType} onChange={(e) => {
                    setEditMatchType(e.target.value);
                    setEditGameMode(e.target.value === 'Battle Royale' ? 'Solo' : '4v4');
                  }} className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-blue">
                    <option value="Battle Royale">Battle Royale</option>
                    <option value="Clash Squad">Clash Squad</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Game Mode</label>
                  <select value={editGameMode} onChange={(e) => setEditGameMode(e.target.value)} className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-blue">
                    {editMatchType === 'Battle Royale' ? (
                      <><option value="Solo">Solo</option><option value="Duo">Duo</option><option value="Squad">Squad</option></>
                    ) : (
                      <><option value="4v4">4v4</option><option value="5v5">5v5</option><option value="6v6">6v6</option></>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Map</label>
                  <select value={editMap} onChange={(e) => setEditMap(e.target.value)} className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-blue">
                    <option value="Bermuda">Bermuda</option><option value="Purgatory">Purgatory</option><option value="Kalahari">Kalahari</option><option value="Alpine">Alpine</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Entry Fee (₹)</label>
                  <input type="number" value={editEntryFee} onChange={(e) => setEditEntryFee(e.target.value)} className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-blue font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Total Prize Pool (₹)</label>
                  <input type="number" value={editPrizePool} onChange={(e) => setEditPrizePool(e.target.value)} className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-blue font-mono" />
                </div>
                <div className="col-span-2 border-t border-indigo-950/60 pt-3">
                  <h4 className="text-[10px] text-neon-blue uppercase font-bold tracking-widest mb-3">Prize Distribution Breakdown</h4>
                  <div className="grid grid-cols-4 gap-2 font-mono">
                    {[{l:'PER KILL',v:editPerKillPrize,s:setEditPerKillPrize,p:'5'},{l:'RANK #1',v:editRank1Prize,s:setEditRank1Prize,p:'500'},{l:'RANK #2',v:editRank2Prize,s:setEditRank2Prize,p:'250'},{l:'RANK #3',v:editRank3Prize,s:setEditRank3Prize,p:'100'}].map(f=>
                      <div key={f.l}>
                        <label className="text-[8px] text-esports-gray block mb-1">{f.l}</label>
                        <input type="number" placeholder={f.p} value={f.v} onChange={e=>f.s(e.target.value)} className="w-full bg-background border border-indigo-950 p-2 rounded text-xs text-center" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Match Time</label>
                  <input type="datetime-local" value={editMatchTime} onChange={(e) => setEditMatchTime(e.target.value)} className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-blue font-mono" required />
                </div>
                <div>
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Total Slots</label>
                  <input type="number" value={editTotalSlots} onChange={(e) => setEditTotalSlots(e.target.value)} className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-blue font-mono" required />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Rules & Description</label>
                  <textarea rows={3} placeholder="Add custom rules or tournament description..." value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-blue text-ff-text leading-relaxed" />
                </div>
                {/* Status Selector - Edit Only */}
                <div className="col-span-2 border-t border-indigo-950/60 pt-3">
                  <label className="text-[10px] text-neon-pink uppercase font-bold tracking-widest block mb-2">Tournament Status</label>
                  <div className="flex gap-2 flex-wrap">
                    {['upcoming','live','completed','cancelled'].map(s => (
                      <button key={s} type="button" onClick={() => setEditStatus(s)}
                        className={`px-3 py-1.5 rounded text-[9px] font-extrabold uppercase border transition-all ${
                          editStatus === s
                            ? s==='live' ? 'bg-red-500/20 border-red-500 text-ff-error-text'
                              : s==='completed' ? 'bg-emerald-500/20 border-emerald-400 text-ff-success-text'
                              : s==='cancelled' ? 'bg-indigo-950/40 border-indigo-600 text-esports-gray'
                              : 'bg-neon-blue/10 border-neon-blue text-neon-blue'
                            : 'bg-transparent border-indigo-950/50 text-esports-gray hover:border-indigo-700'
                        }`}>{s}</button>
                    ))}
                  </div>
                  <p className="text-[9px] text-esports-gray mt-2 font-mono">⚠ Setting to <span className="text-ff-error-text">cancelled</span> via edit does not auto-refund — use the Cancel (⊗) button for that.</p>
                </div>
              </div>
              <div className="flex gap-4 border-t border-indigo-950/60 pt-4 mt-6">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingTournament(null); }}
                  className="flex-1 py-2.5 bg-indigo-950/40 border border-indigo-900/30 rounded text-xs font-bold uppercase text-esports-gray hover:text-ff-text">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-neon-blue to-neon-purple rounded text-xs font-bold uppercase text-ff-text shadow-neon-blue disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && selectedTournamentInfo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-panel border border-ff-border w-full max-w-3xl rounded-xl shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-ff-border flex justify-between items-center bg-ff-card rounded-t-xl shrink-0">
              <h2 className="text-sm font-bold text-ff-text uppercase tracking-wider flex items-center gap-2">
                <Info className="text-ff-amber" size={18} /> ENLISTED SURVIVORS - {selectedTournamentInfo.title}
              </h2>
              <button onClick={() => setShowInfoModal(false)} className="text-esports-gray hover:text-ff-text transition-colors">
                <XOctagon size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {loadingParticipants ? (
                <div className="p-8 text-center text-xs text-esports-gray animate-pulse font-mono flex justify-center items-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> FETCHING REGISTRY...
                </div>
              ) : tournamentParticipants.length === 0 ? (
                <div className="p-12 text-center text-xs text-esports-gray font-mono">NO SURVIVORS REGISTERED YET</div>
              ) : (
                <div className="bg-panel border border-indigo-950/30 rounded overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-indigo-950/30 border-b border-indigo-950/50 text-[10px] text-esports-gray uppercase font-bold tracking-wider">
                      <tr>
                        <th className="p-3">Player Name (Profile)</th>
                        <th className="p-3">Mobile (Profile)</th>
                        <th className="p-3">Email (Form)</th>
                        <th className="p-3">FF Name (Form)</th>
                        <th className="p-3">FF UID (Form)</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ff-border">
                      {tournamentParticipants.map(p => (
                        <React.Fragment key={p._id}>
                          <tr className={`hover:bg-ff-card ${p.teamMembers && p.teamMembers.length > 0 ? 'bg-indigo-950/10' : ''}`}>
                            <td className="p-3 text-ff-text font-bold">
                              {p.userId?.name || 'Unknown'}
                              {p.teamMembers && p.teamMembers.length > 0 && (
                                <span className="ml-2 text-[8px] bg-neon-purple/20 text-neon-purple px-1.5 py-0.5 rounded border border-neon-purple/30">LEADER</span>
                              )}
                            </td>
                            <td className="p-3 font-mono text-esports-gray">
                              {p.userId?.mobile?.startsWith('clerk_') ? 'Not Provided' : (p.userId?.mobile || 'N/A')}
                            </td>
                            <td className="p-3 text-esports-gray">{p.email || '-'}</td>
                            <td className="p-3 text-esports-gray">{p.ffName || '-'}</td>
                            <td className="p-3 text-neon-blue font-bold font-mono">{p.freeFireUid}</td>
                            <td className="p-3 text-esports-gray text-[10px] uppercase">{p.status}</td>
                          </tr>
                          {p.teamMembers && p.teamMembers.length > 0 && p.teamMembers.map((member, idx) => (
                            <tr key={`${p._id}-member-${idx}`} className="bg-indigo-950/5 border-b border-indigo-950/20 last:border-b-0">
                              <td className="p-3 pl-8 text-[10px] text-esports-gray uppercase font-bold flex items-center gap-2">
                                ↳ PLAYER {idx + 2}
                              </td>
                              <td className="p-3"></td>
                              <td className="p-3"></td>
                              <td className="p-3 text-esports-gray">{member.ffName}</td>
                              <td className="p-3 text-neon-blue/80 font-bold font-mono">{member.freeFireUid}</td>
                              <td className="p-3"></td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
