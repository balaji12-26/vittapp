import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Booking, Event } from '../types';
import { getBookingsByUser, cancelBooking } from '../api/bookingApi';
import { getEvents } from '../api/eventsApi';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Ticket, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AttendeeDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<Record<string, Event>>({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (user) {
      const userBookings = await getBookingsByUser(user.id);
      const allEvents = await getEvents();
      
      const eventMap = allEvents.reduce((acc, ev) => {
        acc[ev.id] = ev;
        return acc;
      }, {} as Record<string, Event>);

      setBookings(userBookings.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()));
      setEvents(eventMap);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCancel = async (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      await cancelBooking(bookingId);
      await loadData();
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">My Tickets</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">No bookings yet</h2>
          <p className="text-gray-500 mb-6">You haven't booked any tickets yet. Explore events to get started!</p>
          <Link to="/" className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking, idx) => {
            const event = events[booking.eventId];
            if (!event) return null;
            
            const isCancelled = booking.status === 'cancelled';

            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={booking.id} 
                className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col sm:flex-row ${isCancelled ? 'border-red-200' : 'border-gray-100'}`}
              >
                <div className="w-full sm:w-48 h-32 sm:h-auto flex-shrink-0">
                  <img src={event.bannerImage} alt={event.title} className={`w-full h-full object-cover ${isCancelled ? 'grayscale opacity-50' : ''}`} />
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${isCancelled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {booking.status}
                        </span>
                        <span className="text-sm text-gray-500">Booking #{booking.id}</span>
                      </div>
                      <Link to={`/event/${event.id}`} className="text-xl font-bold text-gray-900 hover:text-primary-600 transition">
                        {event.title}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">{format(new Date(event.date), 'MMM dd, yyyy • h:mm a')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">${booking.totalAmount}</p>
                      <p className="text-sm text-gray-500">{booking.tickets.reduce((sum, t) => sum + t.quantity, 0)} tickets</p>
                    </div>
                  </div>
                  
                  {!isCancelled && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                      <button 
                        onClick={() => handleCancel(booking.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center transition"
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Cancel Booking
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AttendeeDashboard;
