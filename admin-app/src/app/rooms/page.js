'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { Radio, KeyRound, Check, Send, ShieldAlert, ArrowRight, Activity, Calendar } from 'lucide-react';

export default function AdminRooms() {
  const [tournaments, setTournaments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(null); // stores tournamentId of dispatch row

  const loadData = async () => {
    try {
      const allTournaments = await api.get('/tournaments');
      // Filter only upcoming & live ones for selection dropdown
      const upcoming = allTournaments.filter(t => t.status === 'upcoming' || t.status === 'live');
      setTournaments(upcoming);

      // In a real system we can query rooms, let's load all matches and we will display room states.
      // Actually we will display the tournaments and their room credentials by checking them.
      // Let's check which tournaments have rooms.
      const roomDetailsPromises = upcoming.map(t =>
        api.get(`/tournaments/${t._id}`).catch(() => null)
      );
      const details = await Promise.all(roomDetailsPromises);
      const validRooms = details
        .filter(d => d && d.roomDetails)
        .map(d => ({
          tournamentId: d.tournament._id,
          title: d.tournament.title,
          status: d.tournament.status,
          matchTime: d.tournament.matchTime,
          roomId: d.roomDetails.roomId,
          password: d.roomDetails.password,
          sentToPlayers: d.tournament.status === 'live' || d.roomDetails.status === 'active'
        }));
      setRooms(validRooms);
    } catch (err) {
      console.error('Failed to load room managers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    if (!selectedTournamentId || !roomId || !password) {
      return setError('Please specify match, Room ID, and Password');
    }
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.post('/admin/rooms', {
        tournamentId: selectedTournamentId,
        roomId,
        password
      });

      setSuccess('Room credentials saved. Ready to dispatch coordinates.');
      setRoomId('');
      setPassword('');
      setSelectedTournamentId('');

      await loadData();
    } catch (err) {
      setError(err.message || 'Error updating room parameters');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendDetails = async (tournamentId) => {
    setError('');
    setSuccess('');
    setSending(tournamentId);

    try {
      const res = await api.post(`/admin/rooms/${tournamentId}/send`);
      setSuccess(res.message || 'Coordinates dispatched to participants! Match is live.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to dispatch coordinates');
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">LOBBY ROOM COORDINATION</h1>
        <p className="text-xs text-esports-gray uppercase tracking-widest mt-1">Assign custom room coordinates and broadcast details to participants</p>
      </div>

      {success && (
        <div className="p-4 bg-ff-success-bg border border-ff-success-border rounded-xl text-ff-success-text text-xs flex items-center gap-2">
          <Check size={16} className="text-ff-success-text" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-ff-error-bg border border-ff-error-border rounded-xl text-ff-error-text text-xs flex items-center gap-2">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid splits */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Update credentials uploader */}
        <div className="md:col-span-1">
          <div className="bg-panel border border-indigo-950/30 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ff-text flex items-center gap-2">
              <KeyRound size={16} className="text-neon-blue" />
              CONFIGURE LOBBY
            </h3>

            {tournaments.length === 0 ? (
              <p className="text-xs text-esports-gray">
                No active or upcoming tournaments found to associate custom rooms.
              </p>
            ) : (
              <form onSubmit={handleUpdateRoom} className="space-y-4">
                <div>
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Select Active Match</label>
                  <select
                    value={selectedTournamentId}
                    onChange={(e) => setSelectedTournamentId(e.target.value)}
                    className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple text-ff-text"
                    required
                  >
                    <option value="">-- Select Tournament --</option>
                    {tournaments.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.title} ({t.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Room ID (Numeric)</label>
                  <input
                    type="text"
                    placeholder="e.g. 59812903"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-esports-gray uppercase font-bold tracking-widest block mb-1">Lobby Password</label>
                  <input
                    type="text"
                    placeholder="e.g. 998811"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background border border-indigo-950 p-2.5 rounded text-xs focus:outline-none focus:border-neon-purple font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 rounded font-bold uppercase tracking-wider text-xs text-ff-text shadow-neon-blue disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'SAVE PARAMETERS'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Dispatch lists directory */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-ff-text flex items-center gap-2">
            <Radio size={16} className="text-neon-purple" />
            LOBBY DISPATCH CONTROLS
          </h3>

          <div className="bg-panel border border-indigo-950/30 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-esports-gray animate-pulse font-mono">LOADING ROOM CODES...</div>
            ) : rooms.length === 0 ? (
              <div className="p-8 text-center text-xs text-esports-gray font-mono">NO ACTIVE ROOM CREDENTIALS CONFIGURED</div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-indigo-950/30 border-b border-indigo-950/50 text-[10px] text-esports-gray uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-3">Tournament</th>
                    <th className="p-3">Credentials</th>
                    <th className="p-3 text-center">Lobby Status</th>
                    <th className="p-3 text-right">Dispatch Core</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-950/20">
                  {rooms.map((room) => (
                    <tr key={room.tournamentId} className="hover:bg-indigo-950/10">
                      <td className="p-3">
                        <span className="font-bold text-ff-text block">{room.title}</span>
                        <span className="text-[10px] text-esports-gray font-mono flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(room.matchTime).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3 font-mono">
                        <p className="text-neon-blue">ID: {room.roomId}</p>
                        <p className="text-neon-purple text-[10px]">Pass: {room.password}</p>
                      </td>
                      <td className="p-3 text-center">
                        {room.sentToPlayers ? (
                          <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-ff-success-bg text-ff-success-text border border-ff-success-border flex items-center gap-1 w-max mx-auto">
                            <Activity size={10} className="animate-pulse" /> DISPATCHED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-yellow-950/20 text-yellow-500 border border-yellow-900/35 w-max mx-auto block">
                            AWAITING SEND
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          disabled={room.sentToPlayers || sending === room.tournamentId}
                          onClick={() => handleSendDetails(room.tournamentId)}
                          className="px-3 py-1.5 bg-gradient-to-r from-neon-purple to-neon-blue disabled:from-indigo-950/40 disabled:to-indigo-950/40 border border-indigo-900/30 hover:opacity-90 rounded font-bold uppercase tracking-wider text-[10px] text-ff-text flex items-center gap-1 ml-auto disabled:opacity-50"
                        >
                          <Send size={10} />
                          {sending === room.tournamentId ? 'Dispatching...' : room.sentToPlayers ? 'Sent' : 'Broadcast to players'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
