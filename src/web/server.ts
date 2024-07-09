import express from 'express';
import "dotenv/config";
import bodyParser from 'body-parser';
import { createEvent, getEvents, updateEvent, deleteEvent } from './api/controllers/CalendarController';
import { validateRequest } from './api/middlewares/ValidationMiddleware';
import { EventSchema } from './api/schemas/EventSchema';

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json());

app.post('/create', validateRequest(EventSchema), createEvent);
app.get('/events', getEvents);
app.put('/events/:eventId', validateRequest(EventSchema), updateEvent);
app.delete('/events/:eventId', deleteEvent);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
