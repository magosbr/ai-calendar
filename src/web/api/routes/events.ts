import express from 'express';
import { createEvent, getEvents, updateEvent, deleteEvent } from '../controllers/CalendarController';
import { validateRequest } from '../middlewares/ValidationMiddleware';
import { EventSchema } from '../schemas/EventSchema';

const router = express.Router();

router.post('/create', validateRequest(EventSchema), createEvent);
router.get('/', getEvents);
router.put('/:eventId', validateRequest(EventSchema), updateEvent);
router.delete('/:eventId', deleteEvent);

export default router;
