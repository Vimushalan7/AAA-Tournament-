'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { Terminal, Shield, Clock, User, Filter } from 'lucide-react';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.get('/admin/logs');
        setLogs(data);
      } catch (err) {
        console.error('Error loading logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionColor = (action) => {
    if (action.includes('BAN')) return 'text-ff-error-text bg-ff-error-bg border-ff-error-border';
    if (action.includes('CANCEL') || action.includes('DELETE')) return 'text-neon-pink bg-neon-pink/5 border-neon-pink/20';
    if (action.includes('APPROVE') || action.includes('VERIFY')) return 'text-ff-success-text bg-ff-success-bg border-ff-success-border';
    if (action.includes('REJECT')) return 'text-yellow-500 bg-yellow-950/20 border-yellow-900/30';
    if (action.includes('CREATE')) return 'text-neon-blue bg-neon-blue/5 border-neon-blue/20';
    return 'text-esports-gray bg-indigo-950/20 border-indigo-950/40';
  };

  const filteredLogs = filter
    ? logs.filter(l =>
        l.action.toLowerCase().includes(filter.toLowerCase()) ||
        l.details.toLowerCase().includes(filter.toLowerCase()) ||
        l.adminId?.name?.toLowerCase().includes(filter.toLowerCase())
      )
    : logs;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">AUDIT LOG TERMINAL</h1>
        <p className="text-xs text-esports-gray uppercase tracking-widest mt-1">Complete audit trail of all admin actions, security events and platform activity</p>
      </div>

      {/* Search filter */}
      <div className="relative max-w-sm">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-esports-gray">
          <Filter size={14} />
        </span>
        <input
          type="text"
          placeholder="Filter by action, admin, or detail..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-panel border border-indigo-950/30 pl-9 pr-4 py-2 rounded text-xs focus:outline-none focus:border-neon-purple text-ff-text"
        />
      </div>

      {/* Logs table */}
      <div className="bg-panel border border-indigo-950/30 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-esports-gray animate-pulse font-mono">LOADING AUDIT TRAIL...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Terminal className="mx-auto text-esports-gray opacity-30 mb-2" size={32} />
            <p className="text-xs text-esports-gray font-mono uppercase">NO LOG ENTRIES FOUND</p>
          </div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="bg-indigo-950/30 border-b border-indigo-950/50 text-[10px] text-esports-gray uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Admin Operator</th>
                <th className="p-3">Action Code</th>
                <th className="p-3">Target Ref</th>
                <th className="p-3">Incident Details</th>
                <th className="p-3">Client IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-950/20 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-indigo-950/10">
                  <td className="p-3 text-esports-gray">
                    <p>{new Date(log.createdAt).toLocaleDateString()}</p>
                    <p className="text-[9px] opacity-60">{new Date(log.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center">
                        <Shield size={12} className="text-neon-purple" />
                      </div>
                      <span className="text-ff-text font-bold">{log.adminId?.name || 'Admin'}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-esports-gray text-[10px] truncate max-w-[90px]">
                    {log.targetId || '—'}
                  </td>
                  <td className="p-3 text-esports-gray max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="p-3 text-esports-gray text-[10px]">
                    {log.ipAddress || '::1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 text-[10px] text-esports-gray font-mono">
        <span>Total Entries: <span className="text-ff-text font-bold">{logs.length}</span></span>
        <span>•</span>
        <span>Filtered: <span className="text-neon-blue font-bold">{filteredLogs.length}</span></span>
        <span>•</span>
        <span>Bans: <span className="text-ff-error-text font-bold">{logs.filter(l => l.action.includes('BAN')).length}</span></span>
        <span>•</span>
        <span>Verified Results: <span className="text-ff-success-text font-bold">{logs.filter(l => l.action.includes('VERIFY')).length}</span></span>
      </div>
    </div>
  );
}
