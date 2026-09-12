import { Booking, Event } from '../types';

export const createBooking = async (
  userId: string,
  eventId: string,
  tickets: { seatCategoryId: string, quantity: number }[],
  totalAmount: number
): Promise<Booking> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Verify availability
  const eventsStr = localStorage.getItem('eventease_events');
  const events: Event[] = eventsStr ? JSON.parse(eventsStr) : [];
  const eventIndex = events.findIndex(e => e.id === eventId);
  
  if (eventIndex === -1) throw new Error('Event not found');
  
  const event = events[eventIndex];
  
  // Check availability
  for (const ticket of tickets) {
    const category = event.seatCategories.find(c => c.id === ticket.seatCategoryId);
    if (!category) throw new Error('Seat category not found');
    if (category.capacity - category.booked < ticket.quantity) {
      throw new Error(`Not enough seats available for ${category.name}`);
    }
  }
  
  // Update availability
  for (const ticket of tickets) {
    const category = event.seatCategories.find(c => c.id === ticket.seatCategoryId)!;
    category.booked += ticket.quantity;
  }
  
  localStorage.setItem('eventease_events', JSON.stringify(events));
  
  // Create booking
  const bookingsStr = localStorage.getItem('eventease_bookings');
  const bookings: Booking[] = bookingsStr ? JSON.parse(bookingsStr) : [];
  
  const newBooking: Booking = {
    id: 'bkg_' + Math.random().toString(36).substr(2, 9),
    userId,
    eventId,
    tickets,
    totalAmount,
    status: 'confirmed',
    bookingDate: new Date().toISOString()
  };
  
  bookings.push(newBooking);
  localStorage.setItem('eventease_bookings', JSON.stringify(bookings));
  
  return newBooking;
};

export const getBookingsByUser = async (userId: string): Promise<Booking[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const bookingsStr = localStorage.getItem('eventease_bookings');
  const bookings: Booking[] = bookingsStr ? JSON.parse(bookingsStr) : [];
  return bookings.filter(b => b.userId === userId);
};

export const getBookingsByEvent = async (eventId: string): Promise<Booking[]> => {
  const bookingsStr = localStorage.getItem('eventease_bookings');
  const bookings: Booking[] = bookingsStr ? JSON.parse(bookingsStr) : [];
  return bookings.filter(b => b.eventId === eventId);
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const bookingsStr = localStorage.getItem('eventease_bookings');
  let bookings: Booking[] = bookingsStr ? JSON.parse(bookingsStr) : [];
  
  const bookingIndex = bookings.findIndex(b => b.id === bookingId);
  if (bookingIndex === -1) throw new Error('Booking not found');
  
  const booking = bookings[bookingIndex];
  if (booking.status === 'cancelled') return;
  
  booking.status = 'cancelled';
  localStorage.setItem('eventease_bookings', JSON.stringify(bookings));
  
  // Restore availability
  const eventsStr = localStorage.getItem('eventease_events');
  if (eventsStr) {
    const events: Event[] = JSON.parse(eventsStr);
    const event = events.find(e => e.id === booking.eventId);
    if (event) {
      for (const ticket of booking.tickets) {
        const category = event.seatCategories.find(c => c.id === ticket.seatCategoryId);
        if (category) {
          category.booked -= ticket.quantity;
        }
      }
      localStorage.setItem('eventease_events', JSON.stringify(events));
    }
  }
};
