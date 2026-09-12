import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Ticket, AlertCircle } from 'lucide-react';
import { Event } from '../types';
import { getEventById } from '../api/eventsApi';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../api/bookingApi';

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      getEventById(id).then(data => {
        setEvent(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleTicketChange = (categoryId: string, delta: number, available: number) => {
    setSelectedTickets(prev => {
      const current = prev[categoryId] || 0;
      const next = current + delta;
      if (next < 0 || next > Math.min(10, available)) return prev;
      return { ...prev, [categoryId]: next };
    });
  };

  const totalTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0);
  const totalAmount = event ? event.seatCategories.reduce((total, cat) => {
    return total + (selectedTickets[cat.id] || 0) * cat.price;
  }, 0) : 0;

  const handleBook = async () => {
    if (!user) {
      navigate('/login', { state: { returnTo: `/event/${id}` } });
      return;
    }
    
    if (user.role === 'organizer') {
      setError('Organizers cannot book tickets. Please login as an attendee.');
      return;
    }

    if (totalTickets === 0) {
      setError('Please select at least one ticket.');
      return;
    }

    try {
      setBookingLoading(true);
      setError('');
      const tickets = Object.entries(selectedTickets)
        .filter(([_, qty]) => qty > 0)
        .map(([seatCategoryId, quantity]) => ({ seatCategoryId, quantity }));
        
      const booking = await createBooking(user.id, event!.id, tickets, totalAmount);
      navigate(`/booking-confirmation/${booking.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to book tickets');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!event) {
    return <div className="text-center py-20 text-2xl font-bold">Event not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-64 md:h-96 relative">
          <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
            <div className="p-8 text-white w-full">
              <span className="inline-block bg-primary-600 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                {event.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-2">{event.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm md:text-base opacity-90">
                <div className="flex items-center"><Calendar className="h-5 w-5 mr-2" /> {format(new Date(event.date), 'MMMM dd, yyyy • h:mm a')}</div>
                <div className="flex items-center"><MapPin className="h-5 w-5 mr-2" /> {event.location}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this Event</h2>
              <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">{event.description}</p>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Ticket className="h-5 w-5 mr-2 text-primary-600" />
                Select Tickets
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className="space-y-4 mb-6">
                {event.seatCategories.map(cat => {
                  const available = cat.capacity - cat.booked;
                  const selected = selectedTickets[cat.id] || 0;
                  const isSoldOut = available === 0;

                  return (
                    <div key={cat.id} className={`p-4 rounded-lg border ${isSoldOut ? 'bg-gray-100 border-gray-200 opacity-75' : 'bg-white border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{cat.name}</h4>
                          <p className="text-sm text-gray-500">${cat.price} • {isSoldOut ? 'Sold Out' : `${available} left`}</p>
                        </div>
                      </div>
                      
                      {!isSoldOut && (
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-sm font-medium text-gray-700">Quantity</span>
                          <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-1 border">
                            <button 
                              onClick={() => handleTicketChange(cat.id, -1, available)}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                              disabled={selected === 0}
                            >-</button>
                            <span className="w-4 text-center font-semibold">{selected}</span>
                            <button 
                              onClick={() => handleTicketChange(cat.id, 1, available)}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                              disabled={selected >= Math.min(10, available)}
                            >+</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>${totalAmount}</span>
                </div>
              </div>

              <button
                onClick={handleBook}
                disabled={totalTickets === 0 || bookingLoading}
                className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {bookingLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  `Book ${totalTickets > 0 ? `${totalTickets} Tickets` : ''}`
                )}
              </button>
              
              {!user && (
                <p className="text-xs text-center text-gray-500 mt-3">
                  You will be prompted to login/signup.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
