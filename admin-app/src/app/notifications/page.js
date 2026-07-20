'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { BellRing, Send, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, Trash2, Eye, X } from 'lucide-react';

export default function AdminNotifications() {
  const [tournaments, setTournaments] = useState([]);
  const [targetType, setTargetType] = useState('global'); // global, tournament, maintenance, individual
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [targetUserEmail, setTargetUserEmail] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState(
    "⚠️ IMPORTANT MATCH RULES:\n1. Do NOT invite others to the lobby. Violators will receive a PERMANENT BAN.\n2. Do NOT use hacks, scripts, or panels. Instant PERMANENT BAN if detected.\n\nGood luck & Play fair!"
  );
  const [isPoll, setIsPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [allNotifications, setAllNotifications] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchTournamentsAndNotifications = async () => {
      try {
        const [tData, nData, uData] = await Promise.all([
          api.get('/tournaments'),
          api.get('/admin/notifications'),
          api.get('/admin/users')
        ]);
        setTournaments(tData.filter(t => t.status === 'upcoming' || t.status === 'live'));
        setAllNotifications(nData);
        setUsers(uData);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentsAndNotifications();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      return setError('Title and message are required');
    }
    if (isPoll) {
      const validOptions = pollOptions.filter(opt => opt.trim() !== '');
      if (validOptions.length < 2) {
        return setError('A poll requires at least 2 valid options');
      }
    }
    if (targetType === 'tournament' && !selectedTournamentId) {
      return setError('Select a tournament lobby target');
    }
    if (targetType === 'individual' && !targetUserEmail) {
      return setError('Provide an Email Address for the target');
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const validPollOptions = isPoll ? pollOptions.filter(opt => opt.trim() !== '') : [];
      const res = await api.post('/admin/notifications', {
        title,
        message,
        targetType,
        tournamentId: targetType === 'tournament' ? selectedTournamentId : undefined,
        targetUserEmail: targetType === 'individual' ? targetUserEmail : undefined,
        isPoll,
        pollOptions: validPollOptions
      });

      setSuccess(res.message || 'Notification broadcast dispatched successfully!');
      setTitle('');
      setMessage('');
      setSelectedTournamentId('');
      setTargetUserEmail('');
      setIsPoll(false);
      setPollOptions(['', '']);
      
      // refresh list
      const nData = await api.get('/admin/notifications');
      setAllNotifications(nData);
    } catch (err) {
      setError(err.message || 'Failed to dispatch broadcast');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this notification?')) return;
    try {
      await api.delete(`/admin/notifications/${id}`);
      setAllNotifications(allNotifications.filter(n => n._id !== id));
      setSuccess('Notification deleted.');
    } catch (err) {
      setError(err.message || 'Failed to delete notification');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Are you SURE you want to permanently delete ALL notifications? This cannot be undone.')) return;
    try {
      await api.delete('/admin/notifications/all');
      setAllNotifications([]);
      setSuccess('All notifications have been cleared.');
    } catch (err) {
      setError(err.message || 'Failed to delete all notifications');
    }
  };

  return (
    <div className="space-y-6 w-full animate-fade-in">
      <div>
        <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">GLOBAL BROADCAST DESK</h1>
        <p className="text-xs text-esports-gray uppercase tracking-widest mt-1">Compose notifications and dispatch system-wide warnings or tournament start alerts</p>
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

      <div className="bg-panel border border-indigo-950/30 rounded-xl p-6">
        <form onSubmit={handleBroadcast} className="space-y-6 text-xs">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Target Scope</label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple text-ff-text font-bold"
              >
                <option value="global">Global Broadcast (All Users)</option>
                <option value="tournament">Tournament Lobby (Registered Only)</option>
                <option value="maintenance">Maintenance Notice (Global System)</option>
                <option value="individual">Individual Player (Specific User)</option>
              </select>
            </div>

            {targetType === 'tournament' && (
              <div>
                <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Select Tournament Lobby</label>
                {loading ? (
                  <div className="p-2.5 bg-background border border-indigo-950 rounded text-esports-gray animate-pulse">Loading list...</div>
                ) : (
                  <select
                    value={selectedTournamentId}
                    onChange={(e) => setSelectedTournamentId(e.target.value)}
                    className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple text-ff-text"
                    required
                  >
                    <option value="">-- Choose Lobby --</option>
                    {tournaments.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {targetType === 'individual' && (
              <div>
                <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Target User Email</label>
                <input
                  type="text"
                  list="user-emails"
                  placeholder="Search by Email, Name, or FF UID..."
                  value={targetUserEmail}
                  onChange={(e) => setTargetUserEmail(e.target.value)}
                  className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple text-ff-text"
                  required
                />
                <datalist id="user-emails">
                  {users.map(u => {
                    const searchParts = [
                      u.name && `Name: ${u.name}`,
                      u.email && `Email: ${u.email}`,
                      u.freeFireUid && `FF UID: ${u.freeFireUid}`
                    ].filter(Boolean).join(' | ');
                    return <option key={u._id} value={u.email}>{searchParts}</option>;
                  })}
                </datalist>
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Broadcast Title</label>
            <input
              type="text"
              placeholder="e.g. Server Maintenance Schedule or Tournament starting soon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple"
              required
            />
          </div>

          <div>
            <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Alert Message</label>
            <textarea
              rows={4}
              placeholder="Type message content here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple leading-relaxed text-ff-text"
              required
            />
          </div>

          <div className="border border-indigo-950/50 p-4 rounded-lg bg-background/50">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="isPoll"
                checked={isPoll}
                onChange={(e) => setIsPoll(e.target.checked)}
                className="accent-neon-purple w-4 h-4 cursor-pointer"
              />
              <label htmlFor="isPoll" className="text-xs text-ff-text font-bold cursor-pointer tracking-wider uppercase">Attach Poll Options</label>
            </div>
            {isPoll && (
              <div className="space-y-3">
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...pollOptions];
                        newOpts[idx] = e.target.value;
                        setPollOptions(newOpts);
                      }}
                      className="w-full bg-panel border border-indigo-950 p-2 rounded text-xs focus:outline-none focus:border-neon-purple text-ff-text"
                    />
                    {idx >= 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newOpts = pollOptions.filter((_, i) => i !== idx);
                          setPollOptions(newOpts);
                        }}
                        className="px-2 py-1 bg-red-500/20 text-red-500 rounded border border-red-500/30 hover:bg-red-500/40"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ''])}
                    className="text-[10px] text-neon-blue font-bold uppercase tracking-widest hover:underline"
                  >
                    + Add Option
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-indigo-950/30 flex justify-between items-center">
            <span className="text-[9px] text-esports-gray uppercase font-bold tracking-widest flex items-center gap-1 font-mono">
              <Sparkles size={12} className="text-neon-purple" />
              Direct Push Broadcast
            </span>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 rounded font-bold uppercase tracking-wider text-xs text-ff-text shadow-neon-purple flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send size={12} />
              {submitting ? 'Dispatching...' : 'DISPATCH BROADCAST'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-ff-text uppercase tracking-widest">Notification History</h2>
          {allNotifications.length > 0 && (
            <button 
              onClick={handleDeleteAll}
              className="text-[10px] bg-ff-error-bg border border-ff-error-border text-ff-error-text px-3 py-1.5 hover:bg-ff-error-text hover:text-black font-bold uppercase tracking-wider flex items-center gap-1 transition-colors rounded"
            >
              <Trash2 size={12} /> CLEAR ALL
            </button>
          )}
        </div>
        <div className="bg-panel border border-indigo-950/30 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-indigo-950/30 border-b border-indigo-950/50 text-[10px] text-esports-gray uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">Target User</th>
                <th className="p-3">Title & Message</th>
                <th className="p-3 text-center">Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-950/20">
              {allNotifications.map((n) => (
                <tr key={n._id} className="hover:bg-indigo-950/10">
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border border-neon-purple/30 text-neon-purple">
                      {n.type}
                    </span>
                  </td>
                  <td className="p-3 text-ff-gray font-mono">
                    {n.userId ? n.userId.name : <span className="text-ff-amber">GLOBAL</span>}
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-ff-text">{n.title}</p>
                    <p className="text-esports-gray text-[11px] truncate max-w-xs">{n.message}</p>
                  </td>
                  <td className="p-3 text-center font-mono text-esports-gray">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteNotification(n._id)}
                      className="p-1.5 hover:bg-red-500/10 text-esports-gray hover:text-red-500 rounded transition-colors"
                      title="Delete Notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {allNotifications.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-esports-gray font-mono">NO HISTORY</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
