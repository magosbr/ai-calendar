import { Event } from '@models/Event';

export interface ICalendarRepository {
    createEvent(event: Event): Promise<string>;
    getEvents(startDate: string, endDate: string): Promise<Event[]>;
    updateEvent(eventId: string, event: Event): Promise<string>;
    deleteEvent(eventId: string): Promise<void>;
}
