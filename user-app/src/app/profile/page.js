'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '../../components/ClientWrapper';
import { api, uploadToCloudinary } from '../../utils/api';
import { User, Mail, Crosshair, AlertTriangle, ShieldCheck, Flame, Settings, Target } from 'lucide-react';



export default function ProfilePage() {
  const { user, refreshUser } = useUser();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [freeFireUid, setFreeFireUid] = useState(user?.freeFireUid || '');
  const [selectedAvatar, setSelectedAvatar] = useState('/logo.jpeg');

  // Sync avatar when user data is available
  useEffect(() => {
    if (user?.profilePic && user.profilePic !== '') {
      setSelectedAvatar(user.profilePic);
    } else {
      setSelectedAvatar('/logo.jpeg');
    }
  }, [user?.profilePic]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSocialVerify = async (platform, url) => {
    // Open in new tab
    window.open(url, '_blank');
    
    // Verify on backend
    try {
      await api.post('/users/social/verify', { platform });
      await refreshUser();
    } catch (err) {
      console.error('Failed to verify social:', err);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setUploadingImage(true);
    try {
      const url = await uploadToCloudinary(file);
      setSelectedAvatar(url);
    } catch (err) {
      setError('FAILED TO SECURE CUSTOM AVATAR');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name || !freeFireUid) {
      return setError('CALLSIGN AND FF UID ARE MANDATORY FOR DEPLOYMENT');
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.put('/users/profile', {
        name,
        email: email || undefined,
        freeFireUid,
        profilePic: selectedAvatar
      });

      setSuccess('COMBAT PROFILE UPDATED AND SECURED!');
      await refreshUser();
    } catch (err) {
      setError(err.message || 'PROFILE UPDATE FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div className="border-b border-ff-border pb-4">
        <h1 className="text-3xl font-black tracking-widest text-ff-text font-heading uppercase flex items-center gap-2">
          <Target className="text-ff-orange" size={28} /> COMBAT DOSSIER
        </h1>
        <p className="text-xs text-ff-gray uppercase tracking-widest mt-1 font-mono">CONFIGURE YOUR GAMER TAG AND DEPLOYMENT DETAILS</p>
      </div>

      {success && (
        <div className="p-4 bg-ff-success-bg border border-ff-success-border ff-card-cut-sm text-ff-success-text text-xs flex items-center gap-2 font-bold uppercase tracking-wider font-mono">
          <ShieldCheck size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-ff-error-bg border border-ff-error-border ff-card-cut-sm text-ff-error-text text-xs flex items-center gap-2 font-bold uppercase tracking-wider font-mono">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-ff-panel border border-ff-border ff-card-cut p-6 space-y-6">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Avatar selector */}
          <div className="space-y-3">
            <label className="text-[10px] text-ff-gray uppercase font-bold tracking-[0.2em] block font-heading">SELECT TACTICAL AVATAR</label>
            <div className="flex flex-wrap gap-4 items-center bg-background/50 p-4 border border-ff-border ff-card-cut-sm">
              <div
                className="w-16 h-16 border-2 border-ff-orange shadow-fire-sm overflow-hidden flex items-start justify-center bg-black/50"
                style={{clipPath:'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))'}}
              >
                <img
                  src={selectedAvatar || '/logo.jpeg'}
                  alt="Selected"
                  className="w-full h-full object-cover object-center"
                  onError={(e) => { e.target.src = '/logo.jpeg'; }}
                />
              </div>
              <div className="flex gap-2 border-l border-ff-border pl-4">

                <div className="relative ml-2">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={handleAvatarUpload}
                    className="absolute inset-0 w-10 h-10 opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                    title="Upload Custom Avatar"
                  />
                  <div className={`w-10 h-10 border-2 border-ff-border border-dashed flex items-center justify-center text-ff-orange hover:border-ff-orange hover:bg-ff-orange/10 transition-all ${uploadingImage ? 'opacity-50' : ''}`}
                    style={{clipPath:'polygon(0 0,calc(100% - 4px) 0,100% 4px,100% 100%,4px 100%,0 calc(100% - 4px))'}}>
                    {uploadingImage ? (
                      <div className="w-4 h-4 rounded-full border border-t-ff-orange border-transparent animate-spin"></div>
                    ) : (
                      <span className="text-lg font-bold pb-1">+</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] text-ff-gray uppercase font-bold tracking-[0.2em] block mb-1.5 font-heading">CALLSIGN (IN-GAME NAME)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ff-gray">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  placeholder="ENTER CALLSIGN"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-ff-border pl-9 p-3 text-sm focus:outline-none focus:border-ff-orange text-ff-text ff-card-cut-sm uppercase font-mono tracking-wider"
                  required
                />
              </div>
            </div>



            <div>
              <label className="text-[10px] text-ff-gray uppercase font-bold tracking-[0.2em] block mb-1.5 font-heading">FREE FIRE GAME UID <span className="text-ff-error-text">*</span></label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ff-gray">
                  <Crosshair size={14} />
                </span>
                <input
                  type="text"
                  placeholder="ENTER FF UID"
                  value={freeFireUid}
                  onChange={(e) => setFreeFireUid(e.target.value.trim())}
                  className="w-full bg-background border border-ff-border pl-9 p-3 text-sm focus:outline-none focus:border-ff-orange text-ff-text ff-card-cut-sm font-mono tracking-wider"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-ff-gray uppercase font-bold tracking-[0.2em] block mb-1.5 font-heading">BACKUP COMM-LINK (EMAIL)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ff-gray">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  placeholder="ENTER EMAIL (OPTIONAL)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-ff-border pl-9 p-3 text-sm focus:outline-none focus:border-ff-orange text-ff-text ff-card-cut-sm font-mono uppercase tracking-wider placeholder:text-ff-border placeholder:tracking-normal"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-ff-border flex flex-col sm:flex-row justify-end items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="ff-btn py-3 px-8 w-full sm:w-auto"
            >
              {loading ? 'SYNCING...' : 'UPDATE PROFILE'}
            </button>
          </div>
        </form>
      </div>

      {/* Social Verification Block */}
      <div className="bg-ff-panel border border-ff-border ff-card-cut p-6 space-y-6">
        <div>
          <h3 className="text-xl font-bold font-heading tracking-widest uppercase text-ff-orange flex items-center gap-2 mb-1">
             SOCIAL CLEARANCE
          </h3>
          <p className="text-xs text-ff-gray font-mono uppercase">You must verify your social connections to deploy in official matches.</p>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <button
             type="button"
             onClick={() => handleSocialVerify('youtube', 'https://youtube.com/@alphaacearena?si=0C3naB_zLYd_Ugh5')}
             className={`flex items-center justify-between p-4 border ${user?.subscribedYoutube ? 'border-ff-success-border bg-ff-success-bg/20' : 'border-ff-border bg-background'} ff-card-cut-sm hover:border-ff-orange transition-colors group`}
          >
            <div className="flex items-center gap-3">
              <span className="text-ff-orange font-bold text-xl uppercase font-heading tracking-wider flex items-center gap-2">
                <span className="bg-ff-orange text-black px-2 py-0.5 rounded-sm">YT</span>
              </span>
              <div className="text-left">
                <span className="block text-sm font-bold tracking-widest text-ff-text">YOUTUBE HQ</span>
                <span className="block text-[10px] text-ff-gray font-mono uppercase">Subscribe to unlock</span>
              </div>
            </div>
            {user?.subscribedYoutube ? (
              <span className="text-ff-success-text text-[10px] font-bold font-mono border border-ff-success-border px-2 py-1 bg-ff-success-bg flex items-center gap-1"><ShieldCheck size={12}/> VERIFIED</span>
            ) : (
              <span className="text-ff-orange text-[10px] font-bold font-mono border border-ff-orange/50 px-2 py-1 group-hover:bg-ff-orange group-hover:text-black transition-colors">VERIFY</span>
            )}
          </button>

          <button
             type="button"
             onClick={() => handleSocialVerify('whatsapp', 'https://whatsapp.com/channel/0029VbDMZ4BL7UVeZTSfhb1s')}
             className={`flex items-center justify-between p-4 border ${user?.followedWhatsapp ? 'border-ff-success-border bg-ff-success-bg/20' : 'border-ff-border bg-background'} ff-card-cut-sm hover:border-ff-orange transition-colors group`}
          >
            <div className="flex items-center gap-3">
               <span className="text-ff-orange font-bold text-xl uppercase font-heading tracking-wider flex items-center gap-2">
                <span className="bg-ff-orange text-black px-2 py-0.5 rounded-sm">WA</span>
              </span>
              <div className="text-left">
                <span className="block text-sm font-bold tracking-widest text-ff-text">WHATSAPP COMM</span>
                <span className="block text-[10px] text-ff-gray font-mono uppercase">Follow for Intel</span>
              </div>
            </div>
            {user?.followedWhatsapp ? (
              <span className="text-ff-success-text text-[10px] font-bold font-mono border border-ff-success-border px-2 py-1 bg-ff-success-bg flex items-center gap-1"><ShieldCheck size={12}/> VERIFIED</span>
            ) : (
              <span className="text-ff-orange text-[10px] font-bold font-mono border border-ff-orange/50 px-2 py-1 group-hover:bg-ff-orange group-hover:text-black transition-colors">VERIFY</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
