import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Event } from '../models/Event.js';

export async function createBooking(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { eventId, tickets } = req.body;
    
    // Find the event inside the transaction
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Event not found' });
    }

    let totalAmount = 0;
    const bookingTickets = [];

    for (const ticketReq of tickets) {
      // Find the specific seat category
      const seatCat = event.seatCategories.id(ticketReq.seatCategoryId);
      if (!seatCat) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Invalid seat category: ${ticketReq.seatCategoryId}` });
      }

      // Check availability
      const available = seatCat.capacity - seatCat.bookedCount;
      if (ticketReq.quantity > available) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          message: `Not enough tickets available for ${seatCat.name}. Requested: ${ticketReq.quantity}, Available: ${available}` 
        });
      }

      // Update the booked count
      seatCat.bookedCount += ticketReq.quantity;
      
      const price = seatCat.price * ticketReq.quantity;
      totalAmount += price;
      
      bookingTickets.push({
        seatCategoryId: seatCat._id,
        categoryName: seatCat.name,
        quantity: ticketReq.quantity,
        price
      });
    }

    // Save the updated event inside the transaction
    await event.save({ session });

    // Create the booking record
    const booking = new Booking({
      userId: req.user.id,
      eventId,
      tickets: bookingTickets,
      totalAmount,
      status: 'active'
    });

    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Booking successful', booking });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
}

export async function getMyBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('eventId', 'title date location');
      
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

export async function getEventBookings(req, res, next) {
  try {
    // Only organizers should access this, and only for their events
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view bookings for this event' });
    }

    const bookings = await Booking.find({ eventId: req.params.eventId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');
      
    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

export async function cancelBooking(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.userId.toString() !== req.user.id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    
    if (booking.status === 'cancelled') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    const event = await Event.findById(booking.eventId).session(session);
    if (event) {
      // Revert the booked counts
      for (const ticket of booking.tickets) {
        const seatCat = event.seatCategories.id(ticket.seatCategoryId);
        if (seatCat) {
          seatCat.bookedCount = Math.max(0, seatCat.bookedCount - ticket.quantity);
        }
      }
      await event.save({ session });
    }

    booking.status = 'cancelled';
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
}
