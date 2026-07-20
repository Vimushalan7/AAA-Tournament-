'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { Landmark, Check, X, AlertCircle, CheckCircle2, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [remarks, setRemarks] = useState('');
  const [activeModalId, setActiveModalId] = useState(null); // stores withdrawalId for rejection remarks input
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/withdrawals');
      setWithdrawals(data);
    } catch (err) {
      console.error('Failed to load withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleProcess = async (id, status, comments = '') => {
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await api.post(`/admin/withdrawals/${id}/process`, {
        status,
        remarks: comments || undefined
      });

      setSuccess(res.message || `Payout request processed successfully (${status})`);
      setActiveModalId(null);
      setRemarks('');
      await fetchWithdrawals();
    } catch (err) {
      setError(err.message || 'Error processing payout request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-ff-success-text border-emerald-400/25 bg-emerald-400/5';
      case 'rejected': return 'text-neon-pink border-neon-pink/25 bg-neon-pink/5';
      case 'pending': return 'text-yellow-500 border-yellow-500/25 bg-yellow-500/5 animate-pulse';
      default: return 'text-esports-gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div>
        <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">PAYOUT AUDITOR PANEL</h1>
        <p className="text-xs text-esports-gray uppercase tracking-widest mt-1">Review pending player withdrawal requests, approve UPI transfers, or reject with details</p>
      </div>

      {success && (
        <div className="p-4 bg-ff-success-bg border border-ff-success-border rounded-xl text-ff-success-text text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-ff-error-bg border border-ff-error-border rounded-xl text-ff-error-text text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Payouts list table */}
      <div className="bg-panel border border-indigo-950/30 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-esports-gray animate-pulse font-mono">LOADING PAYOUT LISTS...</div>
        ) : withdrawals.length === 0 ? (
          <div className="p-12 text-center text-xs text-esports-gray font-mono">NO PAYOUT REQUESTS FILED</div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="bg-indigo-950/30 border-b border-indigo-950/50 text-[10px] text-esports-gray uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3">Player Detail</th>
                <th className="p-3 font-mono text-center">Wallet Size</th>
                <th className="p-3 font-mono text-center">UPI Phone Number</th>
                <th className="p-3 font-mono text-center">Amount (₹)</th>
                <th className="p-3 text-center">Request Date</th>
                <th className="p-3 text-center">State</th>
                <th className="p-3 text-right">Process Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-950/20">
              {withdrawals.map((req) => (
                <tr key={req._id} className="hover:bg-indigo-950/10">
                  <td className="p-3">
                    <span className="font-bold text-ff-text block">{req.userId?.name || 'Player'}</span>
                    <Link href={`/users?uid=${req.userId?._id}`} className="text-[10px] text-esports-gray hover:text-neon-blue transition-colors font-mono block cursor-pointer">
                      Email: {req.userId?.email || 'N/A'}
                    </Link>
                    <span className="text-[10px] text-neon-blue font-mono block">FF ID: {req.userId?.freeFireUid || 'N/A'}</span>
                  </td>
                  <td className="p-3 text-center font-mono text-esports-gray">
                    ₹{req.userId?.walletBalance.toFixed(2)}
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-neon-blue">
                    {req.upiId}
                  </td>
                  <td className="p-3 text-center font-mono font-black text-ff-text text-sm">
                    ₹{req.amount}
                  </td>
                  <td className="p-3 text-center font-mono text-esports-gray">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {req.status === 'pending' ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setActiveModalId(req._id); setError(''); setSuccess(''); }}
                          className="p-1.5 bg-red-950/35 hover:bg-red-900/35 text-ff-error-text rounded border border-ff-error-border"
                          title="Reject Request"
                        >
                          <X size={12} />
                        </button>
                        <button
                          onClick={() => handleProcess(req._id, 'approved')}
                          className="p-1.5 bg-emerald-950/35 hover:bg-emerald-900/35 text-ff-success-text rounded border border-ff-success-border"
                          title="Approve Payout"
                        >
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-esports-gray italic">{req.remarks || 'Closed'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reject Remarks Modal Drawer */}
      {activeModalId && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-panel border border-neon-pink rounded-xl p-6 w-full max-w-sm relative animate-scale-in text-ff-text shadow-neon-pink">
            <h3 className="text-sm font-bold text-ff-text mb-2 uppercase tracking-wider flex items-center gap-1.5 text-neon-pink">
              REJECT PAYOUT REQUEST
            </h3>
            <p className="text-xs text-esports-gray leading-normal mb-4">
              Please specify the rejection comments below. The money will automatically be refunded back to the user's wallet.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[8px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Reason for Rejection</label>
                <input
                  type="text"
                  placeholder="e.g. Invalid UPI Phone Number / suspicious activity"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-pink"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setActiveModalId(null)}
                  className="flex-1 py-2 bg-indigo-950/40 border border-indigo-900/30 rounded text-xs font-bold uppercase text-esports-gray hover:text-ff-text"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleProcess(activeModalId, 'rejected', remarks)}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 transition-colors rounded text-xs font-bold uppercase text-ff-text shadow-neon-pink"
                >
                  {submitting ? 'Rejecting...' : 'Reject & Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
