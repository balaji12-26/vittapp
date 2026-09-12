import { Event, User, Booking } from '../types';

export const initialEvents: Event[] = [
  {
    id: 'e1',
    title: 'Tech Innovators Summit 2026',
    description: 'Join the biggest tech conference of the year, featuring talks from industry leaders, hands-on workshops, and networking opportunities. Discover the latest in AI, Web3, and Quantum Computing.',
    date: '2026-11-15T09:00:00Z',
    location: 'San Francisco, CA',
    category: 'Technology',
    organizerId: 'org1',
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80',
    seatCategories: [
      { id: 'sc1', name: 'General Admission', price: 299, capacity: 500, booked: 120 },
      { id: 'sc2', name: 'VIP Pass', price: 899, capacity: 50, booked: 48 },
    ]
  },
  {
    id: 'e2',
    title: 'Global Music Festival',
    description: 'A 3-day outdoor music festival featuring top artists from around the world across multiple stages. Food trucks, art installations, and unforgettable memories.',
    date: '2026-10-20T14:00:00Z',
    location: 'Austin, TX',
    category: 'Music',
    organizerId: 'org1',
    bannerImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80',
    seatCategories: [
      { id: 'sc3', name: '1-Day Pass', price: 120, capacity: 2000, booked: 1850 },
      { id: 'sc4', name: '3-Day Pass', price: 300, capacity: 1000, booked: 980 },
      { id: 'sc5', name: 'Backstage VIP', price: 1500, capacity: 100, booked: 100 },
    ]
  }
];

export const initialUsers: User[] = [
  { id: 'att1', name: 'Alice Attendee', email: 'alice@example.com', role: 'attendee' },
  { id: 'org1', name: 'Bob Organizer', email: 'bob@example.com', role: 'organizer' }
];

export const initialBookings: Booking[] = [];

// Initialize local storage if empty
export const initializeStorage = () => {
  if (!localStorage.getItem('eventease_events')) {
    localStorage.setItem('eventease_events', JSON.stringify(initialEvents));
  }
  if (!localStorage.getItem('eventease_users')) {
    localStorage.setItem('eventease_users', JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem('eventease_bookings')) {
    localStorage.setItem('eventease_bookings', JSON.stringify(initialBookings));
  }
};
