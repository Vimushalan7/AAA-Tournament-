'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { Coins, Check, X, ShieldAlert, CheckCircle2, Eye, Calendar, ExternalLink, PlusCircle } from 'lucide-react';

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for verification form modal
  const [activeRes, setActiveRes] = useState(null);
  const [verifiedKills, setVerifiedKills] = useState('');
  const [verifiedRank, setVerifiedRank] = useState('');
  const [remarks, setRemarks] = useState('');

  // States for Manual Entry Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [manTournamentId, setManTournamentId] = useState('');
  const [manUserId, setManUserId] = useState('');
  const [manKills, setManKills] = useState('');
  const [manRank, setManRank] = useState('');

  // Proof screenshot viewer modal
  const [viewScreenshotUrl, setViewScreenshotUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchResults = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/results');
      setResults(data);
    } catch (err) {
      console.error('Error fetching match results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const openVerifyModal = (res) => {
    setActiveRes(res);
    setVerifiedKills(res.submittedKills.toString());
    setVerifiedRank(res.submittedRank.toString());
    setRemarks('');
    setError('');
    setSuccess('');
  };

  const handleVerify = async (status) => {
    if (status === 'approved') {
      if (!verifiedKills || Number(verifiedKills) < 0) return setError('Specify verified kill count');
      if (!verifiedRank || Number(verifiedRank) <= 0) return setError('Specify verified placement rank');
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const endpoint = activeRes.status === 'pending' 
        ? `/admin/results/${activeRes._id}/verify`
        : `/admin/results/${activeRes._id}/edit`;

      const res = await api.post(endpoint, {
        status,
        kills: status === 'approved' ? Number(verifiedKills) : undefined,
        rank: status === 'approved' ? Number(verifiedRank) : undefined,
        adminRemarks: remarks || (status === 'approved' ? 'Verified by Admin' : 'Rejected proof - screenshot invalid')
      });

      setSuccess(res.message || `Proof verification complete (${status})`);
      setActiveRes(null);
      await fetchResults();
    } catch (err) {
      setError(err.message || 'Verification submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openManualModal = async () => {
    setShowManualModal(true);
    setError('');
    setSuccess('');
    setManTournamentId('');
    setManUserId('');
    setManKills('');
    setManRank('');
    try {
      const data = await api.get('/tournaments');
      setTournaments(data.filter(t => t.status === 'upcoming' || t.status === 'live' || t.status === 'completed'));
    } catch (err) {
      setError('Failed to load tournaments');
    }
  };

  const handleTournamentSelect = async (e) => {
    const tid = e.target.value;
    setManTournamentId(tid);
    setManUserId('');
    if (!tid) return setParticipants([]);
    
    try {
      const parts = await api.get(`/admin/tournaments/${tid}/participants`);
      setParticipants(parts);
    } catch (err) {
      setError('Failed to load participants for this tournament');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manTournamentId || !manUserId || !manKills || !manRank) {
      return setError('Please fill all fields for manual entry');
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const res = await api.post('/admin/results/manual', {
        tournamentId: manTournamentId,
        userId: manUserId,
        kills: Number(manKills),
        rank: Number(manRank),
        adminRemarks: remarks
      });
      
      setSuccess(res.message || 'Manual entry processed and credited successfully!');
      setShowManualModal(false);
      await fetchResults();
    } catch (err) {
      setError(err.message || 'Failed to submit manual result');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-ff-success-text border-emerald-400/25 bg-emerald-400/5';
      case 'rejected': return 'text-neon-pink border-neon-pink/25 bg-neon-pink/5';
      case 'hold': return 'text-orange-400 border-orange-400/25 bg-orange-400/5';
      case 'pending': return 'text-yellow-500 border-yellow-500/25 bg-yellow-500/5 animate-pulse';
      default: return 'text-esports-gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">MATCH RESULTS AUDITOR</h1>
          <p className="text-xs text-esports-gray uppercase tracking-widest mt-1">Review user uploaded match results screenshots, verify metrics, and award winnings</p>
        </div>
        <button
          onClick={openManualModal}
          className="px-4 py-2 bg-indigo-950/40 border border-neon-purple rounded-xl text-ff-text text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:bg-neon-purple hover:text-white transition-all shadow-neon-purple"
        >
          <PlusCircle size={16} />
          Manual Entry
        </button>
      </div>

      {success && (
        <div className="p-4 bg-ff-success-bg border border-ff-success-border rounded-xl text-ff-success-text text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-ff-error-bg border border-ff-error-border rounded-xl text-ff-error-text text-xs flex items-center gap-2">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Proof Auditing table */}
      <div className="bg-panel border border-indigo-950/30 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-esports-gray animate-pulse font-mono">LOADING PROOFS...</div>
        ) : results.length === 0 ? (
          <div className="p-12 text-center text-xs text-esports-gray font-mono">NO SUBMITTED MATCH RESULTS DETECTED</div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="bg-indigo-950/30 border-b border-indigo-950/50 text-[10px] text-esports-gray uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3">Player Detail</th>
                <th className="p-3">Tournament Details</th>
                <th className="p-3 text-center">Claimed Kills/Rank</th>
                <th className="p-3">Proof Evidence</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-950/20">
              {results.map((res) => (
                <tr key={res._id} className="hover:bg-indigo-950/10">
                  <td className="p-3">
                    <span className="font-bold text-ff-text block">{res.userId?.name || 'Player'}</span>
                    <span className="text-[10px] text-esports-gray font-mono">UID: {res.userId?.freeFireUid || 'Not Set'}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-ff-text block">{res.tournamentId?.title}</span>
                    <span className="text-[10px] text-esports-gray font-mono uppercase">Map: {res.tournamentId?.map}</span>
                  </td>
                  <td className="p-3 text-center font-mono font-bold">
                    <span className="text-neon-blue">{res.submittedKills} Kills</span> / <span className="text-neon-purple">Rank #{res.submittedRank}</span>
                  </td>
                  <td className="p-3 space-x-2">
                    {res.screenshotUrl === 'Deleted' ? (
                      <span className="text-esports-gray/50 italic">Expired</span>
                    ) : (
                      <button
                        onClick={() => setViewScreenshotUrl(res.screenshotUrl)}
                        className="text-neon-blue hover:underline inline-flex items-center gap-0.5"
                      >
                        Inspect Screen <ExternalLink size={10} />
                      </button>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${getStatusColor(res.status)}`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {res.status === 'pending' ? (
                      <button
                        onClick={() => openVerifyModal(res)}
                        className="px-3 py-1.5 bg-gradient-to-r from-neon-purple to-neon-blue rounded hover:opacity-90 transition-opacity font-bold uppercase tracking-wider text-[9px] text-ff-text shadow-neon-purple ml-auto block"
                      >
                        Audit Proof
                      </button>
                    ) : (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-esports-gray italic block">{res.adminRemarks || 'Verified'}</span>
                        <button
                          onClick={() => openVerifyModal(res)}
                          className="text-[9px] text-neon-blue hover:text-neon-purple uppercase font-bold tracking-wider underline"
                        >
                          Edit Approval
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Audit verification form Modal */}
      {activeRes && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-panel border border-neon-purple rounded-xl p-6 w-full max-w-md relative animate-scale-in text-ff-text shadow-neon-purple max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-ff-text mb-2 uppercase tracking-wider flex items-center gap-1.5 text-neon-purple">
              {activeRes.status === 'pending' ? 'AUDIT RESULTS CLAIM' : 'EDIT PROCESSED AUDIT'}
            </h3>
            <p className="text-xs text-esports-gray leading-normal mb-4">
              {activeRes.status === 'pending' 
                ? "Audit the proof snapshot and fill verified scores. Approving automatically credits the user's wallet based on tournament prize pool multipliers."
                : "Modify an already processed claim. This will automatically deduct or credit the user's wallet based on the changes."}
            </p>

            {error && (
              <div className="p-3 bg-ff-error-bg border border-ff-error-border rounded-lg text-ff-error-text text-xs mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Verified Kills</label>
                  <input
                    type="number"
                    min={0}
                    value={verifiedKills}
                    onChange={(e) => setVerifiedKills(e.target.value)}
                    className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Verified Placement Rank</label>
                  <input
                    type="number"
                    min={1}
                    value={verifiedRank}
                    onChange={(e) => setVerifiedRank(e.target.value)}
                    className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Auditor Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Valid screenshot, scores verified"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple"
                />
              </div>

              <div className="flex gap-2 border-t border-indigo-950/40 pt-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveRes(null)}
                  className="px-3 py-2 bg-indigo-950/40 border border-indigo-900/30 rounded text-xs font-bold uppercase text-esports-gray hover:text-ff-text"
                >
                  Close
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleVerify('hold')}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-700 transition-colors text-ff-text font-bold uppercase rounded text-xs flex-1 shadow-[0_0_10px_rgba(234,88,12,0.3)]"
                >
                  Hold
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleVerify('rejected')}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 transition-colors text-ff-text font-bold uppercase rounded text-xs flex-1 shadow-neon-pink"
                >
                  Reject Proof
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleVerify('approved')}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 transition-colors text-ff-text font-bold uppercase rounded text-xs flex-1 shadow-neon-purple"
                >
                  {submitting ? 'Crediting...' : 'Approve & Credit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-panel border border-neon-purple rounded-xl p-6 w-full max-w-md relative animate-scale-in text-ff-text shadow-neon-purple max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-ff-text mb-2 uppercase tracking-wider flex items-center gap-1.5 text-neon-purple">
              MANUAL RESULT ENTRY
            </h3>
            <p className="text-xs text-esports-gray leading-normal mb-4">
              Bypass screenshot proofs and manually enter rank and kills for a registered player. They will be credited instantly.
            </p>

            {error && (
              <div className="p-3 bg-ff-error-bg border border-ff-error-border rounded-lg text-ff-error-text text-xs mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Select Tournament</label>
                <select
                  value={manTournamentId}
                  onChange={handleTournamentSelect}
                  className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple text-ff-text font-bold"
                  required
                >
                  <option value="">-- Choose Tournament --</option>
                  {tournaments.map(t => (
                    <option key={t._id} value={t._id}>{t.title} ({t.status})</option>
                  ))}
                </select>
              </div>

              {manTournamentId && (
                <div>
                  <label className="text-[9px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Select Registered Player</label>
                  <select
                    value={manUserId}
                    onChange={(e) => setManUserId(e.target.value)}
                    className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple text-ff-text"
                    required
                  >
                    <option value="">-- Select Player --</option>
                    {participants.map(p => (
                      <option key={p.userId._id} value={p.userId._id}>
                        {p.userId.name} (UID: {p.freeFireUid}) {p.prizeClaimed ? '- ALREADY CREDITED' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Total Kills</label>
                  <input
                    type="number"
                    min={0}
                    value={manKills}
                    onChange={(e) => setManKills(e.target.value)}
                    className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Placement Rank</label>
                  <input
                    type="number"
                    min={1}
                    value={manRank}
                    onChange={(e) => setManRank(e.target.value)}
                    className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Admin Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Manual entry approved"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple"
                />
              </div>

              <div className="flex gap-2 border-t border-indigo-950/40 pt-4">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-3 py-2 bg-indigo-950/40 border border-indigo-900/30 rounded text-xs font-bold uppercase text-esports-gray hover:text-ff-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !manUserId}
                  className="px-3 py-2 bg-neon-purple hover:bg-neon-purple/80 transition-colors text-white font-bold uppercase rounded text-xs flex-1 shadow-neon-purple disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Submit Manual Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Screen snapshot viewer modal */}
      {viewScreenshotUrl && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex flex-col justify-center items-center p-4">
          <div className="w-full max-w-3xl overflow-hidden relative border border-indigo-950 rounded-xl bg-panel animate-scale-in">
            <div className="p-3 border-b border-indigo-950 flex justify-between items-center bg-indigo-950/20 text-xs">
              <span className="font-bold tracking-wide">Screenshot Proof Evidence</span>
              <button
                onClick={() => setViewScreenshotUrl('')}
                className="text-esports-gray hover:text-ff-text font-bold font-mono text-sm"
              >
                Close (X)
              </button>
            </div>
            <div className="p-4 bg-background flex justify-center items-center max-h-[75vh] overflow-y-auto">
              <img
                src={viewScreenshotUrl}
                alt="Match proof screenshot upload"
                className="max-h-[65vh] object-contain rounded border border-indigo-950 shadow-neon-blue"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
