'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { Bell, Trophy, ShieldAlert, KeyRound, ArrowRight, Eye, Trash2 } from 'lucide-react';
import { useUser } from '../../components/ClientWrapper';

export default function NotificationsPage() {
  const { user, refreshUser } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voteLoading, setVoteLoading] = useState(null);

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/users/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/users/notifications/${id}/read`);
      await fetchNotifications();
      await refreshUser(); // refresh unread count on layout header
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/notifications/${id}`);
      await fetchNotifications();
      await refreshUser();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Clear all your notifications?')) return;
    try {
      await api.delete('/users/notifications/all');
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const handleVote = async (notificationId, optionIndex) => {
    try {
      setVoteLoading(notificationId);
      const res = await api.post(`/users/notifications/${notificationId}/vote`, { optionIndex });
      
      // Update local state
      setNotifications(notifications.map(n => 
        n._id === notificationId ? res.notification : n
      ));
    } catch (err) {
      alert(err.message || 'Failed to submit vote');
    } finally {
      setVoteLoading(null);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'room_details':
        return <KeyRound className="text-neon-blue" size={18} />;
      case 'winning':
        return <Trophy className="text-ff-success-text animate-bounce" size={18} />;
      case 'withdrawal':
        return <Trophy className="text-neon-pink" size={18} />;
      case 'match_starting':
        return <Bell className="text-yellow-500 animate-pulse" size={18} />;
      case 'system':
      case 'global':
      default:
        return <ShieldAlert className="text-neon-purple" size={18} />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-widest text-ff-text font-heading uppercase flex items-center gap-2">
          <Bell className="text-ff-orange" size={28} /> INBOX
        </h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-ff-gray uppercase tracking-widest font-mono">MISSION BRIEFS AND ALERTS</p>
          {notifications.length > 0 && (
            <button 
              onClick={handleDeleteAll}
              className="text-[10px] bg-ff-error-bg border border-ff-error-border text-ff-error-text px-3 py-1.5 hover:bg-ff-error-text hover:text-black font-bold uppercase tracking-wider flex items-center gap-1 transition-colors rounded"
            >
              <Trash2 size={12} /> CLEAR ALL
            </button>
          )}
        </div>
      </div>

      <div className="bg-panel border border-indigo-950/30 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-esports-gray animate-pulse font-mono">LOADING INBOX...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-esports-gray font-mono">YOUR INBOX IS EMPTY</div>
        ) : (
          <div className="divide-y divide-indigo-950/20">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`p-4 flex gap-4 items-start hover:bg-indigo-950/10 transition-colors ${
                  !n.read ? 'bg-indigo-950/5 border-l-4 border-neon-blue' : 'opacity-70'
                }`}
              >
                <div className="p-2 bg-background rounded-lg border border-indigo-950/65 flex-shrink-0 mt-0.5">
                  {getNotifIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="font-bold text-sm text-ff-text tracking-wide">{n.title}</h4>
                    <span className="text-[10px] text-esports-gray font-mono">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-esports-gray leading-relaxed pr-2 whitespace-pre-line">{n.message}</p>
                  
                  {n.isPoll && n.pollOptions && n.pollOptions.length > 0 && (
                    <div className="mt-3 space-y-2 bg-indigo-950/20 p-3 rounded-lg border border-indigo-950/40">
                      {(() => {
                        const hasVoted = n.pollOptions.some(opt => opt.voters.includes(user?._id));
                        const totalVotes = n.pollOptions.reduce((sum, opt) => sum + opt.votes, 0);

                        return n.pollOptions.map((opt, idx) => {
                          const percent = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                          const userVotedThis = opt.voters.includes(user?._id);

                          return hasVoted ? (
                            <div key={idx} className="relative">
                              <div className="flex justify-between text-[10px] mb-1 relative z-10 font-bold">
                                <span className={userVotedThis ? 'text-neon-blue' : 'text-esports-gray'}>{opt.text} {userVotedThis && '(You)'}</span>
                                <span className="font-mono text-neon-purple">{percent}% ({opt.votes})</span>
                              </div>
                              <div className="w-full bg-background rounded-full h-1.5 border border-indigo-950/50">
                                <div 
                                  className={`h-1.5 rounded-full ${userVotedThis ? 'bg-neon-blue' : 'bg-neon-purple/50'}`}
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <button
                              key={idx}
                              onClick={() => handleVote(n._id, idx)}
                              disabled={voteLoading === n._id}
                              className="w-full text-left p-2 rounded text-xs bg-panel border border-indigo-950/60 hover:bg-indigo-950 hover:border-neon-blue transition-colors text-ff-text flex justify-between items-center"
                            >
                              <span>{opt.text}</span>
                              {voteLoading === n._id && <span className="animate-spin text-neon-blue text-[10px]">↻</span>}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 self-center flex-shrink-0">
                  {!n.read && (
                    <button
                      onClick={() => handleMarkAsRead(n._id)}
                      className="p-1.5 hover:bg-neon-blue/10 text-esports-gray hover:text-neon-blue rounded transition-colors"
                      title="Mark as read"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n._id)}
                    className="p-1.5 hover:bg-red-500/10 text-esports-gray hover:text-red-500 rounded transition-colors"
                    title="Delete Message"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
