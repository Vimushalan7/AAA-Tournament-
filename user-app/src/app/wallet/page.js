'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '../../components/ClientWrapper';
import { api } from '../../utils/api';
import {
  Wallet, ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock,
  XCircle, Coins, ShieldAlert, Sparkles, Target, Flame
} from 'lucide-react';

export default function WalletPage() {
  const { user, refreshUser } = useUser();

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawUpi, setWithdrawUpi] = useState('');

  const [transactions, setTransactions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const txs = await api.get('/users/transactions');
      setTransactions(txs);
    } catch (err) {
      console.error('Error loading transactions:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDepositInit = async (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) {
      return setError('ENTER VALID FUNDS TO DEPLOY');
    }
    setError('');
    setSuccess('');

    try {
      const order = await api.post('/payments/razorpay-order', { amount: Number(depositAmount) });
      
      const options = {
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency,
        name: "FF Tournament Arena",
        description: "Combat Funds Deposit",
        order_id: order.orderId,
        handler: async function (response) {
          try {
            setProcessingPayment(true);
            const verify = await api.post('/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            setSuccess('FUNDS SECURED. WALLET UPDATED.');
            setDepositAmount('');
            await refreshUser();
            await loadHistory();
          } catch (err) {
            setError(err.message || 'PAYMENT VERIFICATION FAILED');
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.mobile
        },
        theme: {
          color: "#FF6B00" // ff-orange
        }
      };

      if (!window.Razorpay) {
        throw new Error('Payment gateway offline');
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError('DEPLOYMENT ABORTED: ' + response.error.description);
      });
      rzp.open();

    } catch (err) {
      setError(err.message || 'FAILED TO INIT DEPOSIT ORDER');
    }
  };

  const handleWithdrawalRequest = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      return setError('ENTER A VALID WITHDRAWAL AMOUNT');
    }
    if (!withdrawUpi || withdrawUpi.length < 10) {
      return setError('10-DIGIT PAYMENT PHONE NUMBER IS REQUIRED');
    }

    setError('');
    setSuccess('');

    try {
      const res = await api.post('/payments/withdraw', {
        amount: Number(withdrawAmount),
        upiId: withdrawUpi
      });

      setShowWithdrawalModal(true);
      setWithdrawAmount('');
      setWithdrawUpi('');

      await refreshUser();
      await loadHistory();
    } catch (err) {
      setError(err.message || 'FAILED TO LOG PAYOUT REQUEST');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle2 size={16} className="text-ff-success-text" />;
      case 'pending': return <Clock size={16} className="text-ff-gold animate-pulse" />;
      case 'failed': return <XCircle size={16} className="text-ff-error-text" />;
      default: return null;
    }
  };

  const getTxTypeLabel = (type) => {
    switch (type) {
      case 'deposit': return { label: 'DEPOSIT', style: 'text-ff-orange bg-ff-orange/10 border-ff-orange/30' };
      case 'withdrawal': return { label: 'WITHDRAW', style: 'text-ff-error-text bg-ff-error-bg border-ff-error-border' };
      case 'entry_fee': return { label: 'ENTRY FEE', style: 'text-ff-text bg-white/10 border-white/30' };
      case 'winning': return { label: 'WINNING', style: 'text-ff-success-text bg-emerald-400/10 border-emerald-400/30' };
      case 'refund': return { label: 'REFUND', style: 'text-ff-gold bg-ff-gold/10 border-ff-gold/30' };
      default: return { label: 'TRANSFER', style: 'text-ff-gray border-ff-border' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {showWithdrawalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white border border-gray-300 p-8 max-w-sm w-full mx-4 shadow-[0_0_40px_rgba(255,255,255,0.2)] ff-card-cut relative animate-[pulse_1s_ease-in-out_1]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-ff-orange to-transparent animate-pulse"></div>
            <div className="flex flex-col items-center text-center space-y-5">
              
              {/* Icon Animation */}
              <div className="relative">
                <div className="absolute inset-0 bg-ff-orange/20 rounded-full animate-[ping_1.5s_ease-in-out_infinite]"></div>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-ff-orange/30 relative z-10 text-ff-orange shadow-[0_0_15px_rgba(255,107,0,0.2)]">
                  <Clock size={36} className="animate-[spin_4s_linear_infinite]" />
                </div>
              </div>
              
              <h2 className="text-2xl font-heading font-black text-gray-900 tracking-[0.2em] uppercase">
                PROCESSING
              </h2>
              
              <div className="bg-gray-50 p-5 border border-gray-200 w-full relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-ff-orange animate-pulse"></div>
                <div className="absolute -right-6 -bottom-6 text-gray-200 group-hover:scale-110 transition-transform duration-500">
                  <ShieldAlert size={80} />
                </div>
                <p className="text-xs font-bold text-gray-800 tracking-widest leading-loose uppercase relative z-10">
                  YOUR REQUEST HAS BEEN INITIATED.
                  <br/><br/>
                  THE AMOUNT WILL BE <span className="text-ff-orange">AUTOMATICALLY TRANSACTED</span> TO YOUR ACCOUNT WITHIN <span className="text-amber-600">A WEEK</span>.
                </p>
              </div>

              <button 
                onClick={() => setShowWithdrawalModal(false)}
                className="ff-btn w-full mt-2 relative overflow-hidden group"
              >
                <span className="relative z-10">ACKNOWLEDGE</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="border-b border-ff-border pb-4">
        <h1 className="text-3xl font-black tracking-widest text-ff-text font-heading uppercase flex items-center gap-2">
          <Wallet className="text-ff-orange" size={28} /> VAULT & ASSETS
        </h1>
        <p className="text-xs text-ff-gray uppercase tracking-widest mt-1 font-mono">MANAGE COMBAT FUNDS AND PAYOUTS</p>
      </div>

      {success && (
        <div className="p-4 bg-ff-success-bg border border-ff-success-border ff-card-cut-sm text-ff-success-text text-xs flex items-center gap-2 font-bold uppercase tracking-wider font-mono">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-ff-error-bg border border-ff-error-border ff-card-cut-sm text-ff-error-text text-xs flex items-center gap-2 font-bold uppercase tracking-wider font-mono">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column (Forms and Quick card) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Main Balance Card */}
          <div className="bg-gradient-to-br from-ff-panel to-[#2D1F12] border border-ff-gold/40 shadow-gold ff-card-cut p-6 relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-ff-gold/10 to-transparent pointer-events-none"></div>
            <div className="absolute -right-4 -bottom-4 text-ff-gold/10 group-hover:scale-110 transition-transform"><Target size={120} /></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-ff-gold block mb-1 font-heading">AVAILABLE COMBAT FUNDS</span>
                <span className="text-4xl font-black font-mono text-ff-text tracking-wider filter drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">₹{user?.walletBalance.toFixed(2)}</span>
              </div>
              <div className="p-3 bg-ff-gold/20 text-ff-gold border border-ff-gold/40 ff-card-cut-sm shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                <Wallet size={28} />
              </div>
            </div>

            <div className="flex gap-4 border-t border-ff-gold/20 pt-4 text-[10px] font-mono text-ff-gray font-bold uppercase tracking-widest relative z-10">
              <span className="flex items-center gap-1.5 text-ff-gold">
                <ShieldAlert size={12} /> SECURE GATEWAY
              </span>
              <span>|</span>
              <span className="flex items-center gap-1.5">
                <Flame size={12} className="text-ff-orange" /> INSTANT SETTLEMENT
              </span>
            </div>
          </div>

          {/* Forms Split */}
          <div className="grid sm:grid-cols-2 gap-6">
            
            {/* Deposit Box */}
            <div className="bg-ff-panel border border-ff-border ff-card-cut p-5 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-5 text-ff-orange"><ArrowDownLeft size={40} /></div>
              <h3 className="ff-section-title relative z-10">
                ADD FUNDS
              </h3>
              <form onSubmit={handleDepositInit} className="space-y-4 relative z-10">
                <div>
                  <label className="text-[10px] text-ff-gray uppercase font-bold tracking-[0.2em] block mb-1.5 font-heading">DEPOSIT AMOUNT (₹)</label>
                  <input
                    type="number"
                    placeholder="ENTER AMOUNT"
                    min={1}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-background/80 border border-ff-border focus:border-ff-orange focus:outline-none p-3 ff-card-cut-sm font-mono text-sm tracking-wider text-ff-text placeholder:text-ff-border"
                    required
                  />
                </div>
                <button type="submit" disabled={processingPayment} className="ff-btn w-full">
                  {processingPayment ? 'CONNECTING...' : 'INITIATE DEPOSIT'}
                </button>
              </form>
            </div>

            {/* Withdraw Box */}
            <div className="bg-ff-panel border border-ff-border ff-card-cut p-5 space-y-4 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-5 text-ff-error-text"><ArrowUpRight size={40} /></div>
              <h3 className="text-lg font-bold uppercase tracking-widest text-ff-text flex items-center gap-2 font-heading relative z-10">
                 <span style={{display:'inline-block',width:'4px',height:'18px',background:'linear-gradient(180deg,#CC1100,#7A0A00)'}}></span>
                 PAYOUT REQUEST
              </h3>
              <form onSubmit={handleWithdrawalRequest} className="space-y-4 relative z-10">
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-ff-gray uppercase font-bold tracking-[0.2em] block mb-1.5 font-heading">WITHDRAW AMOUNT (₹)</label>
                    <input
                      type="number"
                      placeholder="ENTER AMOUNT"
                      min={1}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-background/80 border border-ff-border focus:border-ff-red focus:outline-none p-3 ff-card-cut-sm font-mono text-sm tracking-wider text-ff-text placeholder:text-ff-border"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-ff-gray uppercase font-bold tracking-[0.2em] block mb-1.5 font-heading">PAYMENT PHONE NUMBER (UPI)</label>
                    <input
                      type="tel"
                      placeholder="ENTER 10-DIGIT NUMBER"
                      maxLength={10}
                      value={withdrawUpi}
                      onChange={(e) => setWithdrawUpi(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-background/80 border border-ff-border focus:border-ff-red focus:outline-none p-3 ff-card-cut-sm font-mono text-sm text-ff-text placeholder:text-ff-border"
                      required
                    />
                  </div>
                </div>
                <button type="submit" 
                   className="w-full py-2 font-bold uppercase tracking-widest text-sm text-ff-text transition-all duration-200 font-heading shadow-[0_0_15px_rgba(204,17,0,0.3)] hover:shadow-[0_0_20px_rgba(204,17,0,0.6)]"
                   style={{background: 'linear-gradient(135deg, #CC1100, #7A0A00)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'}}>
                  SUBMIT WITHDRAWAL
                </button>
              </form>
            </div>

          </div>
        </div>

        {/* Right Column (Transactions History) */}
        <div className="space-y-4">
          <h3 className="ff-section-title">
            TRANSACTION LOGS
          </h3>

          <div className="bg-ff-panel border border-ff-border ff-card-cut overflow-hidden max-h-[380px] overflow-y-auto">
            {loadingHistory ? (
              <div className="p-8 text-center text-xs text-ff-orange animate-pulse font-mono font-bold tracking-widest">ACCESSING LOGS...</div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-ff-gray font-mono tracking-widest uppercase">NO LOGS FOUND</div>
            ) : (
              <div className="divide-y divide-ff-border">
                {transactions.map((tx) => {
                  const details = getTxTypeLabel(tx.type);
                  return (
                    <div key={tx._id} className="p-4 hover:bg-ff-orange/5 flex items-center justify-between text-xs transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 ff-card-cut-sm text-[8px] font-bold uppercase border ${details.style}`}>
                            {details.label}
                          </span>
                          <span className="font-mono text-ff-gray text-[10px] font-bold">
                            {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <span className="text-[9px] text-ff-gray font-mono block truncate max-w-[130px] uppercase tracking-wider">
                          REF: {tx.razorpayOrderId || tx.razorpayPaymentId || tx._id.slice(-8)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 font-mono">
                        <span className={`font-black text-sm tracking-widest ${
                          tx.type === 'deposit' || tx.type === 'winning' || tx.type === 'refund' ? 'text-ff-success-text' : 'text-ff-error-text'
                        }`}>
                          {tx.type === 'deposit' || tx.type === 'winning' || tx.type === 'refund' ? '+' : '-'}₹{tx.amount}
                        </span>
                        {getStatusIcon(tx.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
