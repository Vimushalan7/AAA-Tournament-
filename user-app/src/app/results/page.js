'use client';

import React, { useEffect, useState } from 'react';
import { api, uploadToCloudinary } from '../../utils/api';
import { Upload, CheckCircle2, AlertCircle, FileText, Image as ImageIcon, Video, Swords, Trophy, ExternalLink, Target } from 'lucide-react';

export default function ResultsPage() {
  const [joinedMatches, setJoinedMatches] = useState([]);
  const [submittedResults, setSubmittedResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [kills, setKills] = useState('');
  const [rank, setRank] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      // Get all matches user joined
      const matches = await api.get('/users/matches');
      setJoinedMatches(matches);

      // Get user submitted proofs
      const results = await api.get('/users/results');
      setSubmittedResults(results);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const recentMatches = joinedMatches.filter(m => {
    if (!m.tournamentId?.matchTime) return false;
    const matchDate = new Date(m.tournamentId.matchTime);
    const now = new Date();
    const diffHours = (now - matchDate) / (1000 * 60 * 60);
    // Show matches from up to 24h in the future, and up to 48h in the past
    return diffHours >= -24 && diffHours <= 48;
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setUploadingImage(true);
    try {
      const url = await uploadToCloudinary(file);
      setScreenshotUrl(url);
      setSuccess('COMBAT SCREENSHOT UPLOADED SECURELY');
    } catch (err) {
      setError('UPLINK TO CLOUD FAILED');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!selectedMatchId) return setError('SELECT A ZONE DEPLOYMENT');
    if (!screenshotUrl) return setError('SCREENSHOT EVIDENCE REQUIRED');
    if (!kills || Number(kills) < 0) return setError('SPECIFY A VALID KILL COUNT');
    if (!rank || Number(rank) <= 0) return setError('SPECIFY A VALID PLACEMENT RANK');

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await api.post('/users/results', {
        tournamentId: selectedMatchId,
        screenshotUrl,
        videoUrl,
        submittedKills: Number(kills),
        submittedRank: Number(rank)
      });

      setSuccess('PROOF SUBMITTED FOR HQ AUDIT!');
      setSelectedMatchId('');
      setKills('');
      setRank('');
      setScreenshotUrl('');
      setVideoUrl('');

      await loadData();
    } catch (err) {
      setError(err.message || 'FAILED TO SUBMIT PROOF');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return 'text-ff-success-text bg-ff-success-bg border-ff-success-border';
      case 'rejected': return 'text-ff-error-text bg-ff-error-bg border-ff-error-border';
      case 'hold': return 'text-ff-orange bg-ff-orange/10 border-ff-orange/30';
      case 'pending': return 'text-ff-gold bg-ff-gold/10 border-ff-gold/40 animate-pulse';
      default: return 'text-ff-gray';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-ff-border pb-4">
        <h1 className="text-3xl font-black tracking-widest text-ff-text font-heading uppercase flex items-center gap-2">
          <Upload className="text-ff-orange" size={28} /> MISSION REPORTS
        </h1>
        <p className="text-xs text-ff-gray uppercase tracking-widest mt-1 font-mono">UPLOAD POST-MATCH SCREENS TO CLAIM BOUNTY</p>
      </div>

      {success && (
        <div className="p-4 bg-ff-success-bg border border-ff-success-border ff-card-cut-sm text-ff-success-text text-xs flex items-center gap-2 font-bold uppercase tracking-wider font-mono">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-ff-error-bg border border-ff-error-border ff-card-cut-sm text-ff-error-text text-xs flex items-center gap-2 font-bold uppercase tracking-wider font-mono">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Upload Form Column */}
        <div className="md:col-span-1">
          <div className="bg-ff-panel border border-ff-border ff-card-cut p-5 space-y-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-3 opacity-5 text-ff-orange"><Upload size={60} /></div>
            <h3 className="ff-section-title relative z-10">
              UPLOAD EVIDENCE
            </h3>

            {recentMatches.length === 0 ? (
              <p className="text-[11px] text-ff-gray leading-relaxed uppercase tracking-widest font-bold font-mono">
                YOU HAVE NO ACTIVE DEPLOYMENTS. JOIN A MATCH TO ENABLE PROOF UPLOADS.
              </p>
            ) : (
              <form onSubmit={handleSubmitProof} className="space-y-5 relative z-10">
                {/* Selector */}
                <div>
                  <label className="text-[10px] text-ff-gray uppercase font-bold tracking-[0.2em] block mb-1.5 font-heading">SELECT ZONE DEPLOYMENT</label>
                  <select
                    value={selectedMatchId}
                    onChange={(e) => setSelectedMatchId(e.target.value)}
                    className="w-full bg-panel border border-ff-border p-3 text-sm focus:outline-none focus:border-ff-orange text-ff-text ff-card-cut-sm font-mono tracking-wider appearance-none"
                    required
                  >
                    <option value="" className="bg-panel text-ff-text">-- CHOOSE MATCH LOBBY --</option>
                    {recentMatches.map((m) => {
                      const matchDate = new Date(m.tournamentId.matchTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      return (
                        <option key={m.tournamentId?._id} value={m.tournamentId?._id} className="bg-panel text-ff-text">
                          {m.tournamentId?.title} ({matchDate})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-ff-gray uppercase font-bold tracking-[0.2em] block mb-1.5 font-heading">KILLS SECURED</label>
                    <div className="relative">
                       <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ff-gray"><Target size={14}/></span>
                       <input
                        type="number"
                        placeholder="e.g. 5"
                        min={0}
                        value={kills}
                        onChange={(e) => setKills(e.target.value)}
                        className="w-full bg-panel border border-ff-border p-3 pl-9 text-sm focus:outline-none focus:border-ff-orange text-ff-text ff-card-cut-sm font-mono tracking-wider"
                        required
                       />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-ff-gray uppercase font-bold tracking-[0.2em] block mb-1.5 font-heading">PLACEMENT RANK</label>
                    <div className="relative">
                       <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ff-gray"><Trophy size={14}/></span>
                       <input
                        type="number"
                        placeholder="e.g. 1"
                        min={1}
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                        className="w-full bg-panel border border-ff-border p-3 pl-9 text-sm focus:outline-none focus:border-ff-orange text-ff-text ff-card-cut-sm font-mono tracking-wider"
                        required
                       />
                    </div>
                  </div>
                </div>

                {/* Image uploader */}
                <div>
                  <label className="text-[10px] text-ff-gray uppercase font-bold tracking-[0.2em] block mb-1.5 font-heading">SCREENSHOT EVIDENCE</label>
                  {screenshotUrl ? (
                    <div className="p-3 bg-panel border border-ff-orange/50 ff-card-cut-sm flex items-center justify-between text-[11px] font-bold font-mono tracking-widest uppercase">
                      <span className="truncate max-w-[140px] text-ff-success-text">UPLOAD SECURED</span>
                      <button
                        type="button"
                        onClick={() => setScreenshotUrl('')}
                        className="text-ff-error-text hover:text-ff-text transition-colors"
                      >
                        ABORT
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-full">
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                      />
                      <div className={`w-full py-6 border-2 border-dashed border-ff-border hover:border-ff-orange hover:bg-ff-orange/5 ff-card-cut-sm flex flex-col justify-center items-center gap-2 text-[11px] font-bold tracking-widest uppercase transition-colors pointer-events-none ${uploadingImage ? 'opacity-50' : 'text-ff-gray hover:text-ff-text'}`}>
                        {uploadingImage ? (
                          <>
                            <div className="w-6 h-6 rounded-full border border-t-ff-orange border-transparent animate-spin"></div>
                            <span className="font-mono text-ff-orange">ESTABLISHING UPLINK...</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={24} className="text-ff-orange mb-1" />
                            <span>CLICK TO SELECT FILE</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Link */}
                <div>
                  <label className="text-[10px] text-ff-gray uppercase font-bold tracking-[0.2em] block mb-1.5 font-heading">RECORDING LINK (OPTIONAL)</label>
                  <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ff-gray"><Video size={14}/></span>
                      <input
                        type="url"
                        placeholder="YOUTUBE OR DRIVE LINK"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value.trim())}
                        className="w-full bg-panel border border-ff-border p-3 pl-9 text-sm focus:outline-none focus:border-ff-orange text-ff-text ff-card-cut-sm font-mono tracking-wider placeholder:text-ff-border"
                      />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="ff-btn w-full mt-4"
                >
                  {submitting ? 'TRANSMITTING...' : 'TRANSMIT REPORT TO HQ'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Previous Submissions List */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="ff-section-title">
            MISSION AUDIT LOGS
          </h3>

          <div className="bg-ff-panel border border-ff-border ff-card-cut overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-ff-orange animate-pulse font-mono font-bold tracking-widest">ACCESSING ARCHIVES...</div>
            ) : submittedResults.length === 0 ? (
              <div className="p-8 text-center text-[11px] text-ff-gray font-mono font-bold tracking-widest uppercase">NO MISSION REPORTS FILED</div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-background border-b border-ff-border text-[9px] text-ff-gray uppercase font-bold tracking-widest font-heading">
                  <tr>
                    <th className="p-4">Deployment</th>
                    <th className="p-4 text-center">Reported Kills / Rank</th>
                    <th className="p-4">Intel Link</th>
                    <th className="p-4">HQ Status</th>
                    <th className="p-4">Comms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ff-border">
                  {submittedResults.map((res) => (
                    <tr key={res._id} className="hover:bg-ff-orange/5 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-ff-text block uppercase tracking-wide">{res.tournamentId?.title}</span>
                        <span className="text-[10px] text-ff-gray font-mono uppercase font-bold mt-1 block">ZONE: {res.tournamentId?.map}</span>
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-sm tracking-wider">
                        <span className="text-ff-error-text">{res.submittedKills}</span> / <span className="text-ff-gold">#{res.submittedRank}</span>
                      </td>
                      <td className="p-4 space-x-3 font-mono font-bold uppercase tracking-wider text-[10px]">
                        {res.screenshotUrl === 'Deleted' ? (
                          <span className="text-ff-gray/50 italic">EXPIRED</span>
                        ) : (
                          <a
                            href={res.screenshotUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-ff-orange hover:text-ff-text transition-colors inline-flex items-center gap-1 border-b border-ff-orange/30 hover:border-white pb-0.5"
                          >
                            IMG <ExternalLink size={10} />
                          </a>
                        )}
                        {res.videoUrl && (
                          <a
                            href={res.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-ff-success-text hover:text-ff-text transition-colors inline-flex items-center gap-1 border-b border-emerald-400/30 hover:border-white pb-0.5"
                          >
                            VID <ExternalLink size={10} />
                          </a>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 ff-card-cut-sm text-[9px] font-bold uppercase tracking-widest border ${getStatusStyle(res.status)}`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="p-4 text-[10px] text-ff-gray font-mono font-bold truncate max-w-[120px] uppercase">
                        {res.adminRemarks || 'AWAITING HQ REVIEW'}
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
