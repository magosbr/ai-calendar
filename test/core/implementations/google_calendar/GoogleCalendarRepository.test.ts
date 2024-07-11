import { google } from 'googleapis';
import { GoogleCalendarRepository } from '@implementations/google_calendar/GoogleCalendarRepository';
import { Event } from '@models/Event';

jest.mock('googleapis', () => {
    const mAuth = {
        getClient: jest.fn(),
    };
    const mCalendar = {
        events: {
            insert: jest.fn(),
            list: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };
    return {
        google: {
            auth: {
                GoogleAuth: jest.fn(() => mAuth),
            },
            calendar: jest.fn(() => mCalendar),
        },
    };
});

describe('GoogleCalendarRepository', () => {
    let mAuth: any;
    let mCalendar: any;
    let repository: GoogleCalendarRepository;

    beforeEach(() => {
        // Correctly initialize mocks with necessary arguments
        mAuth = new google.auth.GoogleAuth();
        mCalendar = google.calendar('v3');
        repository = new GoogleCalendarRepository();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createEvent', () => {
        it('should create an event', async () => {
            const mockEvent: Event = {
                summary: 'Test Event',
                start: { dateTime: '2024-07-10T10:00:00Z', timeZone: 'UTC' },
                end: { dateTime: '2024-07-10T12:00:00Z', timeZone: 'UTC' },
            };
            const mockResponse = { data: { htmlLink: 'http://test-link.com' } };
            mCalendar.events.insert.mockResolvedValue(mockResponse);

            const result = await repository.createEvent(mockEvent);

            expect(mAuth.getClient).toHaveBeenCalledTimes(1);
            expect(mCalendar.events.insert).toHaveBeenCalledWith({
                auth: await mAuth.getClient(),
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                requestBody: mockEvent,
            });
            expect(result).toBe('http://test-link.com');
        });
    });

    describe('getEvents', () => {
        it('should get events', async () => {
            const mockEvents: Event[] = [
                { summary: 'Event 1', start: { dateTime: '2024-07-10T10:00:00Z', timeZone: 'UTC' }, end: { dateTime: '2024-07-10T12:00:00Z', timeZone: 'UTC' } },
            ];
            const mockResponse = { data: { items: mockEvents } };
            mCalendar.events.list.mockResolvedValue(mockResponse);

            const result = await repository.getEvents('2024-07-01', '2024-07-31');

            expect(mAuth.getClient).toHaveBeenCalledTimes(1);
            expect(mCalendar.events.list).toHaveBeenCalledWith({
                auth: await mAuth.getClient(),
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                timeMin: new Date('2024-07-01').toISOString(),
                timeMax: new Date('2024-07-31').toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            });
            expect(result).toEqual(mockEvents);
        });
    });

    describe('updateEvent', () => {
        it('should update an event', async () => {
            const mockEvent: Event = {
                summary: 'Updated Event',
                start: { dateTime: '2024-07-10T10:00:00Z', timeZone: 'UTC' },
                end: { dateTime: '2024-07-10T12:00:00Z', timeZone: 'UTC' },
            };
            const mockResponse = { data: { htmlLink: 'http://updated-link.com' } };
            mCalendar.events.update.mockResolvedValue(mockResponse);

            const result = await repository.updateEvent('event-id', mockEvent);

            expect(mAuth.getClient).toHaveBeenCalledTimes(1);
            expect(mCalendar.events.update).toHaveBeenCalledWith({
                auth: await mAuth.getClient(),
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                eventId: 'event-id',
                requestBody: mockEvent,
            });
            expect(result).toBe('http://updated-link.com');
        });
    });

    describe('deleteEvent', () => {
        it('should delete an event', async () => {
            mCalendar.events.delete.mockResolvedValue({});

            await repository.deleteEvent('event-id');

            expect(mAuth.getClient).toHaveBeenCalledTimes(1);
            expect(mCalendar.events.delete).toHaveBeenCalledWith({
                auth: await mAuth.getClient(),
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                eventId: 'event-id',
            });
        });
    });
});
