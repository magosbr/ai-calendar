import { Request, Response } from 'express';
import { GoogleCalendarRepository } from '../../../core/implementations/google_calendar/GoogleCalendarRepository';
import { Event } from '../../../core/models/Event';

const calendarRepository = new GoogleCalendarRepository();

export const createEvent = async (req: Request, res: Response) => {
    const event: Event = req.body;

    try {
        const eventLink = await calendarRepository.createEvent(event);
        res.status(200).send(`Event created: ${eventLink}`);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).send('Error creating event.');
    }
};

export const getEvents = async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        res.status(400).send('Please provide both startDate and endDate query parameters.');
        return;
    }

    try {
        const events: Event[] = await calendarRepository.getEvents(startDate as string, endDate as string);
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Error fetching events.');
    }
};
