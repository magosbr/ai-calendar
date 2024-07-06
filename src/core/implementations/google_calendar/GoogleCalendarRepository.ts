import { google, calendar_v3 } from 'googleapis';
import { ICalendarRepository } from '../../repositories/ICalendarRepository';
import { Event } from '../../models/Event';
import fs from 'fs';
import path from 'path';
import "dotenv/config";

const CREDENTIALS_PATH = path.join(__dirname, '../../../../credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || '';

export class GoogleCalendarRepository implements ICalendarRepository {
    private auth: any;
    private calendar: calendar_v3.Calendar;

    constructor() {
        this.auth = this.initializeAuth();
        this.calendar = google.calendar({ version: 'v3', auth: this.auth });
    }

    private initializeAuth() {
        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
        return new google.auth.GoogleAuth({
            credentials,
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
