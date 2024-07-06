import { google } from 'googleapis';
import { ICalendarRepository } from '../../repositories/ICalendarRepository';
import { Event } from '../../models/Event';
import fs from 'fs';
import path from 'path';
import "dotenv/config";

const CREDENTIALS_PATH = path.join(__dirname, '../../../../credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export class GoogleCalendarRepository implements ICalendarRepository {
    private auth: any;

    constructor() {
        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
        this.auth = new google.auth.GoogleAuth({
            credentials,
            scopes: SCOPES,
        });
    }

    async createEvent(event: Event): Promise<string> {
        const authClient = await this.auth.getClient();
        const calendar = google.calendar({ version: 'v3', auth: authClient });

        const response = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID || '',
            requestBody: event,
        });

        if (response.data.htmlLink) {
            return response.data.htmlLink;
        } else {
            throw new Error('Event creation failed: no link returned');
        }
    }

    async getEvents(startDate: string, endDate: string): Promise<Event[]> {
        const authClient = await this.auth.getClient();
        const calendar = google.calendar({ version: 'v3', auth: authClient });

        const response = await calendar.events.list({
            calendarId: process.env.GOOGLE_CALENDAR_ID || '',
            timeMin: new Date(startDate).toISOString(),
            timeMax: new Date(endDate).toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        if (response.data.items) {
            return response.data.items as Event[];
        } else {
            throw new Error('No events found');
        }
    }

    async updateEvent(eventId: string, event: Event): Promise<string> {
        const authClient = await this.auth.getClient();
        const calendar = google.calendar({ version: 'v3', auth: authClient });

        const response = await calendar.events.update({
            calendarId: process.env.GOOGLE_CALENDAR_ID || '',
            eventId: eventId,
            requestBody: event,
        });

        if (response.data.htmlLink) {
            return response.data.htmlLink;
        } else {
            throw new Error('Event update failed: no link returned');
        }
    }

    async deleteEvent(eventId: string): Promise<void> {
        const authClient = await this.auth.getClient();
        const calendar = google.calendar({ version: 'v3', auth: authClient });

        await calendar.events.delete({
            calendarId: process.env.GOOGLE_CALENDAR_ID || '',
            eventId: eventId,
        });
    }
}
