'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: decoded.email,
          name: decoded.name,
          googleId: decoded.sub,
          profilePic: decoded.picture
        }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }
      
      if (data.role !== 'admin') {
        setError('Access Denied. Administrator privileges required.');
        return;
      }
      
      localStorage.setItem('admin-token', data.token);
      localStorage.setItem('admin-user', JSON.stringify(data));
      router.push('/');
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f8f0f0 0%, #ffffff 50%, #f0e2e2 100%)',
      }}
    >
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
           style={{ background: 'rgba(204,17,0,0.15)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
           style={{ background: 'rgba(255,107,0,0.10)' }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.1]"
           style={{ backgroundImage: 'linear-gradient(#CC1100 1px, transparent 1px), linear-gradient(90deg, #CC1100 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="w-full max-w-md relative z-10 text-center"
           style={{
             background: 'rgba(255,255,255,0.95)',
             border: '1px solid rgba(204,17,0,0.4)',
             borderRadius: '2px',
             boxShadow: '0 0 40px rgba(204,17,0,0.15), 0 0 80px rgba(0,0,0,0.1)',
             clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
             padding: '40px 36px',
           }}>
        
        <div className="mb-8">
          <img src="/logo.jpeg" alt="Alpha Ace Admin Logo" className="w-24 h-24 object-cover mx-auto mb-6 rounded-full border-2 border-ff-red shadow-[0_0_15px_rgba(204,17,0,0.3)]" />
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '36px', fontWeight: 900, color: '#1a1a1a', letterSpacing: '0.05em', textTransform: 'uppercase', textShadow: '2px 2px 0px rgba(204,17,0,0.2)' }}>
            ALPHA ACE ADMIN
          </h1>
          <p style={{ color: '#CC1100', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', fontFamily: 'Share Tech Mono, monospace', marginTop: '4px' }}>
            SECURE OAUTH LOGIN
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(204,17,0,0.15)', border: '1px solid rgba(204,17,0,0.4)', borderRadius: '2px', padding: '10px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
            <AlertCircle size={16} style={{ color: '#cc1100', flexShrink: 0 }} />
            <p style={{ color: '#ff4433', fontSize: '13px' }}>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center">
            <div style={{ color: '#CC1100', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.2em' }}>VERIFYING...</div>
            <div className="tracer-loader" style={{ width: '150px' }}>
              <div className="tracer-bullet"></div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              theme="outline"
              shape="rectangular"
              size="large"
              text="continue_with"
            />
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col items-center">
          <p className="text-[10px] text-gray-500 mb-1.5 font-mono tracking-widest">NEED ASSISTANCE?</p>
          <a href="mailto:alpha.ace.support@gmail.com" className="inline-flex items-center gap-1.5 text-xs font-bold text-ff-red hover:text-ff-red/80 transition-colors uppercase tracking-wider">
            <AlertCircle size={14} />
            Help & Support
          </a>
        </div>
      </div>
    </div>
  );
}
