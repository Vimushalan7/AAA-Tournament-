'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import {
  Users, Search, ShieldAlert, ShieldCheck, Clock, AlertTriangle,
  History, Coins, Check, Landmark, Crosshair
} from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected User inspection state
  const [selectedUser, setSelectedUser] = useState(null);
  const [inspectData, setInspectData] = useState(null);
  const [loadingInspect, setLoadingInspect] = useState(false);

  // Ban Form states
  const [banType, setBanType] = useState('temporary');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('3');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [banSubmitting, setBanSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/users', { search });
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const initialSearch = params.get('search');
      if (initialSearch && !search) {
        setSearch(initialSearch);
      }
      
      const targetUid = params.get('uid');
      if (targetUid && users.length > 0 && !selectedUser) {
        const u = users.find(user => user._id === targetUid);
        if (u) {
          inspectUser(u);
        }
      }
    }
  }, [users]);

  const inspectUser = async (user) => {
    setSelectedUser(user);
    setLoadingInspect(true);
    setInspectData(null);
    setError('');
    setSuccess('');
    try {
      const data = await api.get(`/admin/users/${user._id}`);
      setInspectData(data);
    } catch (err) {
      console.error('Error inspecting user:', err);
    } finally {
      setLoadingInspect(false);
    }
  };

  const handleBanUser = async (e) => {
    e.preventDefault();
    if (!banReason) return setError('Reason for suspension is required');

    setError('');
    setSuccess('');
    setBanSubmitting(true);

    try {
      const res = await api.post(`/admin/users/${selectedUser._id}/ban`, {
        banType,
        reason: banReason,
        durationDays: Number(banDuration)
      });

      setSuccess(res.message || 'Player suspended successfully.');
      setBanReason('');

      // Refresh data
      await inspectUser(res.user);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Suspension request failed');
    } finally {
      setBanSubmitting(false);
    }
  };

  const handleUnbanUser = async () => {
    setError('');
    setSuccess('');

    try {
      const res = await api.post(`/admin/users/${selectedUser._id}/unban`);
      setSuccess(res.message || 'Suspension lifted successfully.');
      await inspectUser(res.user);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to lift suspension');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div>
        <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">USER AUDIT & SUSPENSIONS</h1>
        <p className="text-xs text-esports-gray uppercase tracking-widest mt-1">Audit player registrations, check ledger entries, and restrict/ban users</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left lists directory */}
        <div className="md:col-span-1 space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-esports-gray">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search Name, Mobile, UID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-panel border border-indigo-950/30 pl-10 pr-4 py-2.5 rounded text-xs focus:outline-none focus:border-neon-purple text-ff-text"
            />
          </div>

          <div className="bg-panel border border-indigo-950/30 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-esports-gray animate-pulse font-mono">LOADING PLAYERS...</div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-xs text-esports-gray font-mono">NO CONTENDERS FOUND</div>
            ) : (
              <div className="divide-y divide-indigo-950/20">
                {users.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => inspectUser(u)}
                    className={`p-4 hover:bg-indigo-950/10 transition-colors flex items-center justify-between cursor-pointer ${
                      selectedUser?._id === u._id ? 'bg-indigo-950/20 border-l-4 border-neon-purple' : ''
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-xs text-ff-text">{u.name}</h4>
                      <p className="text-[10px] text-esports-gray font-mono uppercase">UID: {u.freeFireUid || 'Not Set'}</p>
                    </div>

                    <div>
                      {u.status === 'active' ? (
                        <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-ff-success-bg text-ff-success-text border border-ff-success-border">ACTIVE</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-ff-error-bg text-ff-error-text border border-red-900/35 animate-pulse">SUSPENDED</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right inspections panel */}
        <div className="md:col-span-2">
          {!selectedUser ? (
            <div className="h-96 border-2 border-dashed border-indigo-950/50 rounded-xl flex flex-col justify-center items-center text-esports-gray">
              <Users size={32} className="opacity-40 mb-2 animate-bounce" />
              <p className="text-xs uppercase tracking-wider">Select a player from directory to audit details</p>
            </div>
          ) : (
            <div className="bg-panel border border-indigo-950/30 rounded-xl p-6 space-y-6 animate-scale-in">
              {/* Header profile details */}
              <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-indigo-950/50">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedUser.profilePic || '/logo.jpeg'}
                    alt="Pic"
                    className="w-12 h-12 rounded-full border border-neon-purple"
                  />
                  <div>
                    <h2 className="font-bold text-base text-ff-text">{selectedUser.name}</h2>
                    <p className="text-xs text-esports-gray font-mono">
                      UID: {selectedUser.freeFireUid || 'Not Associated'} | {selectedUser.mobile?.startsWith('google_') ? `Email: ${selectedUser.email || 'N/A'}` : `Mobile: ${selectedUser.mobile}`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-esports-gray block">WALLET BALANCE</span>
                  <span className="text-xl font-bold font-mono text-neon-blue">₹{selectedUser.walletBalance.toFixed(2)}</span>
                </div>
              </div>

              {/* Notifications */}
              {success && (
                <div className="p-3 bg-ff-success-bg border border-ff-success-border rounded-lg text-ff-success-text text-xs flex items-center gap-2">
                  <Check size={14} />
                  <span>{success}</span>
                </div>
              )}

              {error && (
                <div className="p-3 bg-ff-error-bg border border-ff-error-border rounded-lg text-ff-error-text text-xs flex items-center gap-2">
                  <AlertTriangle size={14} />
                  <span>{error}</span>
                </div>
              )}

              {/* Sub grid */}
              {loadingInspect ? (
                <div className="p-12 text-center text-xs text-esports-gray animate-pulse font-mono">LOADING LEDGER AND AUDITS...</div>
              ) : !inspectData ? (
                <div className="p-12 text-center text-xs text-esports-gray">Failed to load data</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Ledger / History Column */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ff-text flex items-center gap-1.5">
                      <History size={14} className="text-neon-blue" />
                      RECENT REGISTRATIONS
                    </h3>
                    <div className="bg-background/40 border border-indigo-950/50 rounded-lg max-h-[160px] overflow-y-auto text-[11px] p-2 space-y-2">
                      {inspectData.matches.length === 0 ? (
                        <p className="text-esports-gray text-center p-4">No tournament matches joined.</p>
                      ) : (
                        inspectData.matches.map(m => (
                          <div key={m._id} className="p-2 bg-indigo-950/15 rounded flex justify-between items-center border border-indigo-950/40">
                            <div>
                              <p className="font-bold text-ff-text truncate max-w-[130px]">{m.tournamentId?.title}</p>
                              <span className="text-[9px] text-esports-gray font-mono">{m.tournamentId?.gameMode}</span>
                            </div>
                            <div className="text-right font-mono text-[10px]">
                              {m.tournamentId?.status === 'completed' ? (
                                <span className="text-ff-success-text font-bold">Winnings: ₹{m.prizeWon}</span>
                              ) : (
                                <span className="text-neon-blue">Joined</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <h3 className="text-xs font-bold uppercase tracking-wider text-ff-text flex items-center gap-1.5">
                      <Coins size={14} className="text-neon-purple" />
                      TRANSACTION LEDGER
                    </h3>
                    <div className="bg-background/40 border border-indigo-950/50 rounded-lg max-h-[160px] overflow-y-auto text-[11px] p-2 space-y-2 font-mono">
                      {inspectData.transactions.length === 0 ? (
                        <p className="text-esports-gray text-center p-4">No transaction entries found.</p>
                      ) : (
                        inspectData.transactions.map(tx => (
                          <div key={tx._id} className="p-2 bg-indigo-950/15 rounded flex justify-between items-center border border-indigo-950/40">
                            <div>
                              <span className="text-ff-text uppercase font-bold">{tx.type}</span>
                              <span className="text-[9px] text-esports-gray block">{new Date(tx.createdAt).toLocaleDateString()}</span>
                            </div>
                            <span className={tx.status === 'success' ? 'text-ff-success-text' : 'text-neon-pink'}>
                              {tx.type === 'deposit' || tx.type === 'winning' || tx.type === 'refund' ? '+' : '-'}₹{tx.amount}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Suspensions Controls Column */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ff-text flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-neon-pink" />
                      SUSPENSION PANEL
                    </h3>

                    {selectedUser.status !== 'active' ? (
                      <div className="bg-red-950/15 border border-ff-error-border rounded-lg p-4 space-y-3 text-xs">
                        <div className="flex gap-2 text-ff-error-text">
                          <AlertTriangle size={18} className="flex-shrink-0" />
                          <div>
                            <p className="font-bold uppercase">ACCOUNT IS BLOCKED ({selectedUser.status === 'temp-banned' ? 'TEMPORARY' : 'PERMANENT'})</p>
                            <p className="mt-1 opacity-80">Reason: {selectedUser.banDetails?.reason || 'Violations of terms'}</p>
                            {selectedUser.status === 'temp-banned' && (
                              <p className="mt-1 font-mono text-[10px]">Unbans on: {new Date(selectedUser.banDetails?.bannedUntil).toLocaleString()}</p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={handleUnbanUser}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 transition-colors text-ff-text font-bold uppercase rounded text-[10px]"
                        >
                          LIFT SUSPENSION IMMEDIATELY
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleBanUser} className="space-y-3 bg-indigo-950/10 p-4 border border-indigo-950 rounded-lg text-xs">
                        <div>
                          <label className="text-[9px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Ban Type</label>
                          <select
                            value={banType}
                            onChange={(e) => setBanType(e.target.value)}
                            className="w-full bg-background border border-indigo-950 p-2 rounded text-xs focus:outline-none focus:border-neon-pink text-ff-text"
                          >
                            <option value="temporary">Temporary Block</option>
                            <option value="permanent">Permanent Block</option>
                          </select>
                        </div>

                        {banType === 'temporary' && (
                          <div>
                            <label className="text-[9px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Duration (Days)</label>
                            <input
                              type="number"
                              min={1}
                              value={banDuration}
                              onChange={(e) => setBanDuration(e.target.value)}
                              className="w-full bg-background border border-indigo-950 p-2 rounded text-xs focus:outline-none focus:border-neon-pink font-mono"
                            />
                          </div>
                        )}

                        <div>
                          <label className="text-[9px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Suspension Reason</label>
                          <input
                            type="text"
                            placeholder="e.g. Forged screenshots / Multi-accounts"
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            className="w-full bg-background border border-indigo-950 p-2 rounded text-xs focus:outline-none focus:border-neon-pink"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={banSubmitting}
                          className="w-full py-2 bg-red-600 hover:bg-red-700 transition-colors text-ff-text font-bold uppercase rounded text-[10px]"
                        >
                          {banSubmitting ? 'Blocking...' : 'SUBMIT BAN RESTRICTION'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
