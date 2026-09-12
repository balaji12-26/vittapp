import { Router } from 'express';
import { createEvent, getEvents, getEventDetails, getOrganizerEvents } from '../controllers/eventController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getEvents);
router.get('/organizer/me', requireAuth, requireRole('organizer'), getOrganizerEvents);
router.get('/:id', getEventDetails);

router.post('/', requireAuth, requireRole('organizer'), createEvent);

export default router;
