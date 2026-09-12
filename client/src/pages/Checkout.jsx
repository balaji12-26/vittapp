import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { event, tickets } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successId, setSuccessId] = useState(null);

  if (!event || !tickets || tickets.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h2 className="text-2xl font-bold mb-4">No tickets selected</h2>
        <Link to="/events" className="text-indigo-600 hover:underline">Browse Events</Link>
      </div>
    );
  }

  const totalAmount = tickets.reduce((sum, t) => sum + (t.price * t.quantity), 0);
  const totalTickets = tickets.reduce((sum, t) => sum + t.quantity, 0);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/bookings', {
        eventId: event.id,
        tickets: tickets.map(t => ({
          seatCategoryId: t.seatCategoryId,
          quantity: t.quantity
        }))
      });
      
      setSuccessId(res.data.booking.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Tickets may have sold out.');
    } finally {
      setLoading(false);
    }
  };

  if (successId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="glass bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
          <p className="text-slate-600 mb-6">You're going to {event.title}.</p>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
            <span className="text-sm font-semibold text-slate-500 block mb-1">Booking ID</span>
            <span className="font-mono font-bold text-indigo-700 tracking-wider text-lg">{successId.slice(-8).toUpperCase()}</span>
          </div>
          
          <Link to="/dashboard" className="w-full inline-block py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors">
            View My Tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-indigo-600 font-medium mb-6 hover:underline">
          &larr; Back to Event
        </button>

        <div className="glass bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Checkout Summary</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100 flex items-start">
              <span className="text-xl mr-3">⚠️</span>
              <div>
                <h4 className="font-bold">Transaction Failed</h4>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="mb-8 pb-8 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-2">{event.title}</h3>
            <p className="text-slate-600">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
          </div>

          <div className="space-y-4 mb-8">
            {tickets.map(t => (
              <div key={t.seatCategoryId} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block">{t.categoryName}</span>
                  <span className="text-sm text-slate-500">{t.quantity} × ${t.price.toFixed(2)}</span>
                </div>
                <span className="font-bold text-slate-900">${(t.quantity * t.price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-end mb-8 pt-4 border-t border-slate-100">
            <div>
              <span className="block text-slate-500 mb-1">Total Due</span>
              <span className="text-sm text-slate-400">{totalTickets} ticket(s)</span>
            </div>
            <span className="text-4xl font-bold text-slate-900">${totalAmount.toFixed(2)}</span>
          </div>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full py-4 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg font-bold rounded-2xl shadow-lg shadow-emerald-500/30 transform transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : `Confirm & Pay $${totalAmount.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
