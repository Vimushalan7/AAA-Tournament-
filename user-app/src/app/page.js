'use client';

import React, { useState } from 'react';
import { api } from '../utils/api';
import { useUser } from '../components/ClientWrapper';
import { ShieldAlert, CheckCircle2, Heart } from 'lucide-react';

export default function FreeFireHistory() {
  const { user } = useUser();
  const [donationAmount, setDonationAmount] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDonation = async (e) => {
    e.preventDefault();
    if (!donationAmount || Number(donationAmount) <= 0) {
      return setError('Please enter a valid donation amount.');
    }
    setError('');
    setSuccess('');

    try {
      // Re-using the same payment logic as deposit
      const order = await api.post('/payments/razorpay-order', { amount: Number(donationAmount) });
      
      const options = {
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency,
        name: "Free Fire History Initiative",
        description: "Donation Support",
        order_id: order.orderId,
        handler: async function (response) {
          try {
            setProcessingPayment(true);
            await api.post('/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            setSuccess('Thank you for your generous donation!');
            setDonationAmount('');
          } catch (err) {
            setError(err.message || 'Payment verification failed.');
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.mobile || ''
        },
        theme: {
          color: "#2563eb"
        }
      };

      if (!window.Razorpay) {
        throw new Error('Payment gateway offline');
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError('Payment failed: ' + response.error.description);
      });
      rzp.open();

    } catch (err) {
      setError(err.message || 'Failed to initiate donation.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-8 animate-fade-in bg-white text-gray-900 rounded-lg shadow-xl font-sans mt-8">
      <header className="border-b pb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 font-serif">Free Fire: A History of Mobile Battle Royale</h1>
        <p className="text-gray-500 text-sm">An informational guide to the evolution of mobile esports.</p>
      </header>

      <section className="space-y-4 text-gray-700 leading-relaxed">
        <p>
          <strong>Free Fire</strong> (also known as <em>Garena Free Fire</em>) is a battle royale game developed by 111dots Studio and published by Garena for Android and iOS. 
          It became the most downloaded mobile game globally in 2019. In August 2021, Free Fire set a record with over 150 million daily active users globally.
        </p>

        <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-3 font-serif">Gameplay Overview</h2>
        <p>
          In Free Fire, players drop onto an island in search of weapons and equipment to defeat other players. Players are free to choose their starting position and take weapons and supplies to extend their battle life. 
          The ultimate goal is to survive on the island with a maximum of 50 players online; this requires eliminating all opponents players encounter along the way and ensuring they are the only survivor remaining.
        </p>

        <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-3 font-serif">The Rise of Custom Rooms</h2>
        <p>
          A prominent feature in the Free Fire community is the creation of <strong>Custom Rooms</strong>. These allow players and content creators to host their own private matches, often called "Room Matches". 
          These custom lobbies became the foundation of grassroots esports tournaments. Communities gather to play friendly scrimmages or organized local tournaments with specific rules, showcasing their teamwork and strategic prowess.
        </p>

        <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-3 font-serif">Esports and Community</h2>
        <p>
          The competitive scene in Free Fire has grown immensely, with international tournaments featuring large prize pools. The community aspect is vital, with players forming guilds and participating in large-scale virtual events.
          Our platform aims to chronicle these events and provide a historical archive of major tournament milestones and legendary room match strategies.
        </p>
      </section>

      {/* Donation Section */}
      <section className="bg-blue-50 border border-blue-100 rounded-xl p-8 mt-12">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="text-blue-500" size={28} />
          <h3 className="text-2xl font-bold text-gray-900 font-serif">Support Our Project</h3>
        </div>
        <p className="text-gray-600 mb-6">
          If you enjoy reading our historical archives and insights into the Free Fire community, consider supporting our efforts. Your donations help us maintain the servers and continue our research.
        </p>

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-200 text-green-800 rounded-lg flex items-center gap-2 font-medium">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-800 rounded-lg flex items-center gap-2 font-medium">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleDonation} className="max-w-md flex gap-4">
          <input
            type="number"
            placeholder="Amount (₹)"
            min={1}
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
          />
          <button 
            type="submit" 
            disabled={processingPayment} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            {processingPayment ? 'Processing...' : 'Donate Now'}
          </button>
        </form>
      </section>
    </div>
  );
}
