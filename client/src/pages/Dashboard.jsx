import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        if (user.role === 'organizer') {
          const res = await apiClient.get('/events/organizer/me');
          setData(res.data);
        } else {
          const res = await apiClient.get('/bookings/me');
          setData(res.data);
        }
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await apiClient.post(`/bookings/${bookingId}/cancel`);
      // Update local state
      setData(data.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="glass sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
          EventEase
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600">
            {user.name} ({user.role})
          </span>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 mt-8">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome, {user.name}!</h2>
            <p className="text-slate-500">Here's your personalized {user.role} dashboard.</p>
          </div>
          {user.role === 'organizer' ? (
            <Link 
              to="/create-event" 
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:-translate-y-0.5"
            >
              + Create Event
            </Link>
          ) : (
            <Link 
              to="/events" 
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:-translate-y-0.5"
            >
              Browse Events
            </Link>
          )}
        </header>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        {loading ? (
          <div className="text-center text-slate-500 py-10">Loading...</div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-800">
              {user.role === 'organizer' ? 'Your Published Events' : 'Your Bookings'}
            </h3>

            {data.length === 0 ? (
              <div className="glass bg-white p-10 rounded-2xl shadow-sm border border-slate-100 text-center">
                <p className="text-slate-500">
                  {user.role === 'organizer' 
                    ? "You haven't created any events yet." 
                    : "You haven't booked any tickets yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.role === 'organizer' ? (
                  data.map(event => (
                    <div key={event.id} className="glass bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                      <div className="flex-1">
                        <span className="inline-block px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg mb-3">
                          {event.category}
                        </span>
                        <h4 className="font-bold text-lg text-slate-900 mb-1">{event.title}</h4>
                        <p className="text-sm text-slate-500 mb-4">
                          {new Date(event.date).toLocaleDateString()} • {event.location}
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          {event.seatCategories.map(sc => (
                            <div key={sc.id} className="flex justify-between text-sm bg-slate-50 p-2 rounded-lg">
                              <span className="font-medium text-slate-700">{sc.name}</span>
                              <span className="text-slate-600">
                                {sc.bookedCount} / {sc.capacity} booked
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  data.map(booking => (
                    <div key={booking.id} className="glass bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative">
                      {booking.status === 'cancelled' && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
                          <span className="px-4 py-2 border-2 border-red-500 text-red-600 font-bold rounded-lg rotate-[-15deg] text-lg">CANCELLED</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                            ID: {booking.id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">
                          ${booking.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-lg text-slate-900 mb-1">
                        {booking.eventId?.title || 'Unknown Event'}
                      </h4>
                      <p className="text-sm text-slate-500 mb-4">
                        {booking.eventId ? new Date(booking.eventId.date).toLocaleDateString() : 'N/A'} • {booking.eventId?.location || 'N/A'}
                      </p>
                      
                      <div className="space-y-2 mb-6 flex-1">
                        {booking.tickets.map(ticket => (
                          <div key={ticket.id} className="flex justify-between text-sm bg-slate-50 p-2 rounded-lg">
                            <span className="font-medium text-slate-700">{ticket.quantity}x {ticket.categoryName}</span>
                            <span className="text-slate-600">${ticket.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {booking.status === 'active' && (
                        <button 
                          onClick={() => handleCancelBooking(booking.id)}
                          className="w-full py-2 border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors text-sm"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
