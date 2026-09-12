import { Router } from 'express';
import { createBooking, getMyBookings, getEventBookings, cancelBooking } from '../controllers/bookingController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('attendee'), createBooking);
router.get('/me', getMyBookings);
router.post('/:id/cancel', cancelBooking);

router.get('/event/:eventId', requireRole('organizer'), getEventBookings);

export default router;
