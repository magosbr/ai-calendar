import { Request, Response } from 'express';
import { GoogleCalendarRepository } from '@implementations/google_calendar/GoogleCalendarRepository';
import { Event } from '@models/Event';

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

export const updateEvent = async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const event: Event = req.body;

    try {
        const eventLink = await calendarRepository.updateEvent(eventId, event);
        res.status(200).send(`Event updated: ${eventLink}`);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).send('Error updating event.');
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    const { eventId } = req.params;

    try {
        await calendarRepository.deleteEvent(eventId);
        res.status(200).send('Event deleted');
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).send('Error deleting event.');
    }
};
