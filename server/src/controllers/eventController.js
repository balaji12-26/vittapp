import { Event } from '../models/Event.js';

export async function createEvent(req, res, next) {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can create events.' });
    }

    const { title, description, date, location, category, seatCategories } = req.body;

    const event = new Event({
      title,
      description,
      date,
      location,
      category,
      organizerId: req.user.id,
      seatCategories
    });

    await event.save();
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (err) {
    next(err);
  }
}

export async function getEvents(req, res, next) {
  try {
    const { search, category, location } = req.query;
    
    const query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const events = await Event.find(query).sort({ date: 1 }).populate('organizerId', 'name');
    res.json(events);
  } catch (err) {
    next(err);
  }
}

export async function getEventDetails(req, res, next) {
  try {
    const event = await Event.findById(req.params.id).populate('organizerId', 'name');
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    res.json(event);
  } catch (err) {
    next(err);
  }
}

export async function getOrganizerEvents(req, res, next) {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can access this.' });
    }
    const events = await Event.find({ organizerId: req.user.id }).sort({ date: -1 });
    res.json(events);
  } catch (err) {
    next(err);
  }
}
