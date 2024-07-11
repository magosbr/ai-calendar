import { google, calendar_v3 } from 'googleapis';
import { ICalendarRepository } from '@repositories/ICalendarRepository';
import { Event } from '@models/Event';
import 'dotenv/config';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

const CREDENTIALS = {
    'type': 'service_account',
    'project_id': 'ai-calendar-161920',
    'private_key_id': process.env.GOOGLE_PRIVATE_KEY_ID,
    'private_key': process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    'client_email': 'ai-calendar@ai-calendar-161920.iam.gserviceaccount.com',
    'client_id': process.env.GOOGLE_CLIENT_ID,
    'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
    'token_uri': 'https://oauth2.googleapis.com/token',
    'auth_provider_x509_cert_url': 'https://www.googleapis.com/oauth2/v1/certs',
    'client_x509_cert_url': 'https://www.googleapis.com/robot/v1/metadata/x509/ai-calendar%40ai-calendar-161920.iam.gserviceaccount.com',
    'universe_domain': 'googleapis.com'
};

export class GoogleCalendarRepository implements ICalendarRepository {
    private auth: any;
    private calendar: calendar_v3.Calendar;

    constructor() {
        this.auth = this.initializeAuth();
        this.calendar = google.calendar({ version: 'v3', auth: this.auth });
    }

    private initializeAuth() {
        return new google.auth.GoogleAuth({
            credentials: CREDENTIALS,
            scopes: SCOPES,
        });
    }

    private async getAuthClient() {
        return await this.auth.getClient();
    }

    private handleResponse<T>(response: any, errorMessage: string): T {
        if (response.data) {
            return response.data;
        } else {
            throw new Error(errorMessage);
        }
    }

    async createEvent(event: Event): Promise<string> {
        const authClient = await this.getAuthClient();
        const response = await this.calendar.events.insert({
            auth: authClient,
            calendarId: CALENDAR_ID,
            requestBody: event,
        });

        const data = this.handleResponse<{ htmlLink: string }>(response, 'Event creation failed: no link returned');
        return data.htmlLink;
    }

    async getEvents(startDate: string, endDate: string): Promise<Event[]> {
        const authClient = await this.getAuthClient();
        const response = await this.calendar.events.list({
            auth: authClient,
            calendarId: CALENDAR_ID,
            timeMin: new Date(startDate).toISOString(),
            timeMax: new Date(endDate).toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        const data = this.handleResponse<{ items: Event[] }>(response, 'No events found');
        return data.items;
    }

    async updateEvent(eventId: string, event: Event): Promise<string> {
        const authClient = await this.getAuthClient();
        const response = await this.calendar.events.update({
            auth: authClient,
            calendarId: CALENDAR_ID,
            eventId: eventId,
            requestBody: event,
        });

        const data = this.handleResponse<{ htmlLink: string }>(response, 'Event update failed: no link returned');
        return data.htmlLink;
    }

    async deleteEvent(eventId: string): Promise<void> {
        const authClient = await this.getAuthClient();
        await this.calendar.events.delete({
            auth: authClient,
            calendarId: CALENDAR_ID,
            eventId: eventId,
        });
    }
}
