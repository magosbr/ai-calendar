import express from 'express';
import 'dotenv/config';
import bodyParser from 'body-parser';
import path from 'path';
import { createEvent, getEvents, updateEvent, deleteEvent } from './api/controllers/CalendarController';
import { validateRequest } from './api/middlewares/ValidationMiddleware';
import { EventSchema } from './api/schemas/EventSchema';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../..', 'public')));

app.post('/create', validateRequest(EventSchema), createEvent);
app.get('/events', getEvents);
app.put('/events/:eventId', validateRequest(EventSchema), updateEvent);
app.delete('/events/:eventId', deleteEvent);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../..', 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
