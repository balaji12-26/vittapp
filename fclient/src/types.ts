export type UserRole = 'attendee' | 'organizer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface SeatCategory {
  id: string;
  name: string; // e.g., 'General', 'VIP'
  price: number;
  capacity: number;
  booked: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  organizerId: string;
  bannerImage: string;
  seatCategories: SeatCategory[];
}

export interface BookingTicket {
  seatCategoryId: string;
  quantity: number;
}

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  tickets: BookingTicket[];
  totalAmount: number;
  status: 'confirmed' | 'cancelled';
  bookingDate: string;
}
