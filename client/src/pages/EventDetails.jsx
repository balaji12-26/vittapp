import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Cart state: { seatCategoryId: quantity }
  const [cart, setCart] = useState({});

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Event not found');
    } finally {
      setLoading(false);
    }
  };

  const updateCart = (categoryId, quantity, maxAvailable) => {
    if (quantity < 0) return;
    if (quantity > maxAvailable) return;
    
    setCart(prev => ({
      ...prev,
      [categoryId]: quantity
    }));
  };

  const handleCheckout = () => {
    // Convert cart map to array format for checkout state
    const ticketsToBook = Object.entries(cart)
      .filter(([_, qty]) => qty > 0)
      .map(([categoryId, quantity]) => {
        const cat = event.seatCategories.find(c => c.id === categoryId);
        return {
          seatCategoryId: categoryId,
          categoryName: cat.name,
          quantity,
          price: cat.price
        };
      });

    if (ticketsToBook.length === 0) return;

    navigate('/checkout', { state: { event, tickets: ticketsToBook } });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!event) return null;

  const totalSelectedTickets = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalAmount = Object.entries(cart).reduce((sum, [catId, qty]) => {
    const cat = event.seatCategories.find(c => c.id === catId);
    return sum + (cat ? cat.price * qty : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="glass sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-sm">
        <Link to="/events" className="text-indigo-600 font-medium hover:underline">
          &larr; Back to Events
        </Link>
        <span className="font-bold text-slate-800">Event Details</span>
      </nav>

      <main className="max-w-4xl mx-auto p-6 mt-6">
        <div className="glass bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="h-64 bg-gradient-to-r from-purple-500 to-indigo-600 p-8 flex items-end">
            <div className="text-white">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold mb-4">
                {event.category}
              </span>
              <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
              <p className="text-white/90">Organized by {event.organizerId?.name}</p>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">About this event</h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-6 border-t border-slate-100">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 mb-1">Date & Time</h4>
                    <p className="text-slate-900 font-medium">{new Date(event.date).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 mb-1">Location</h4>
                    <p className="text-slate-900 font-medium">{event.location}</p>
                  </div>
                </div>
              </div>

              {/* Ticketing / Cart Sidebar */}
              {user?.role === 'attendee' && (
                <div className="w-full md:w-80 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-xl text-slate-900 mb-4">Select Tickets</h3>
                  
                  <div className="space-y-4 mb-6">
                    {event.seatCategories.map(cat => {
                      const available = cat.capacity - cat.bookedCount;
                      const selected = cart[cat.id] || 0;
                      const isSoldOut = available === 0;

                      return (
                        <div key={cat.id} className={`p-4 rounded-xl border ${isSoldOut ? 'bg-slate-100 border-slate-200 opacity-70' : 'bg-white border-purple-100 shadow-sm'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-slate-800">{cat.name}</h4>
                              <p className="text-sm text-slate-500">
                                {isSoldOut ? (
                                  <span className="text-red-500 font-medium">Sold Out</span>
                                ) : (
                                  `${available} tickets left`
                                )}
                              </p>
                            </div>
                            <span className="font-bold text-lg text-indigo-600">${cat.price.toFixed(2)}</span>
                          </div>

                          {!isSoldOut && (
                            <div className="flex items-center justify-between mt-4 bg-slate-50 rounded-lg p-1">
                              <button 
                                onClick={() => updateCart(cat.id, selected - 1, available)}
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-50"
                                disabled={selected === 0}
                              >
                                -
                              </button>
                              <span className="font-medium w-8 text-center">{selected}</span>
                              <button 
                                onClick={() => updateCart(cat.id, selected + 1, available)}
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-50"
                                disabled={selected === available}
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-600">Total ({totalSelectedTickets} tickets)</span>
                      <span className="font-bold text-2xl text-slate-900">${totalAmount.toFixed(2)}</span>
                    </div>
                    
                    <button
                      onClick={handleCheckout}
                      disabled={totalSelectedTickets === 0}
                      className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transform transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
