import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Ticket as TicketIcon, Calendar, MapPin, Download } from 'lucide-react';
import { Booking, Event } from '../types';
import { getBookingsByUser } from '../api/bookingApi';
import { getEventById } from '../api/eventsApi';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const BookingConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (user && id) {
        const userBookings = await getBookingsByUser(user.id);
        const currentBooking = userBookings.find(b => b.id === id);
        
        if (currentBooking) {
          setBooking(currentBooking);
          const eventData = await getEventById(currentBooking.eventId);
          setEvent(eventData);
        }
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [user, id]);

  if (loading) return <div className="h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!booking || !event) return <div className="text-center py-20">Booking not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="bg-green-500 p-8 text-center text-white">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="inline-block bg-white text-green-500 rounded-full p-2 mb-4 shadow-lg"
          >
            <CheckCircle className="h-12 w-12" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-green-100">Your tickets have been successfully booked.</p>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Booking ID</p>
              <p className="text-xl font-mono font-bold text-gray-900">{booking.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Date</p>
              <p className="font-medium text-gray-900">{format(new Date(booking.bookingDate), 'MMM dd, yyyy')}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h2>
            <div className="space-y-3 text-gray-600 mb-6">
              <div className="flex items-center"><Calendar className="h-5 w-5 mr-3 text-gray-400" /> {format(new Date(event.date), 'EEEE, MMMM dd, yyyy • h:mm a')}</div>
              <div className="flex items-center"><MapPin className="h-5 w-5 mr-3 text-gray-400" /> {event.location}</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <TicketIcon className="h-5 w-5 mr-2 text-primary-600" /> Ticket Summary
              </h3>
              <div className="space-y-3 mb-4">
                {booking.tickets.map(ticket => {
                  const cat = event.seatCategories.find(c => c.id === ticket.seatCategoryId);
                  return (
                    <div key={ticket.seatCategoryId} className="flex justify-between items-center text-gray-700">
                      <span>{cat?.name} x {ticket.quantity}</span>
                      <span className="font-medium">${(cat?.price || 0) * ticket.quantity}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between items-center font-bold text-lg text-gray-900">
                <span>Total Paid</span>
                <span>${booking.totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/attendee/dashboard"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg text-center transition-colors"
            >
              View My Dashboard
            </Link>
            <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors flex justify-center items-center">
              <Download className="h-5 w-5 mr-2" /> Download Tickets
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingConfirmation;
