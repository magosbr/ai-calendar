import {BaseToolWithCall, FunctionTool, JSONValue} from 'llamaindex';
import { JSONSchemaType } from 'ajv';
import {
    GoogleCalendarRepository
} from '../../core/implementations/google_calendar/GoogleCalendarRepository';
import { Event } from '../../core/models/Event';

const getEvents = async ({ startDate, endDate }: { startDate: string, endDate: string }): Promise<JSONValue> => {
    const calendarRepository = new GoogleCalendarRepository();

    try {
        const events: Event[] = await calendarRepository.getEvents(startDate, endDate);
        const eventsJson: JSONValue[] = events.map(event => eventToJson(event));
        return { status: 'success', events: eventsJson };
    } catch (error: any) {
        console.error('Error fetching events:', error);
        return { status: 'error', message: error.message ?? 'An unknown error occurred' };
    }
};

const eventToJson = (event: Event): JSONObject => {
    const eventJson: JSONObject = {
        summary: event.summary,
        start: {
            dateTime: event.start.dateTime,
            timeZone: event.start.timeZone
        },
        end: {
            dateTime: event.end.dateTime,
            timeZone: event.end.timeZone
        }
    };
    if (event.location) {
        eventJson.location = event.location;
    }
    if (event.description) {
        eventJson.description = event.description;
    }
    return eventJson;
};

interface JSONObject { [key: string]: JSONValue; }

const getEventsSchema: JSONSchemaType<{ startDate: string; endDate: string }> = {
    type: 'object',
    properties: {
        startDate: { type: 'string', description: 'Start date of the events in ISO 8601 format' },
        endDate: { type: 'string', description: 'End date of the events in ISO 8601 format ' +
                'must be at least one day more than start date' }
    },
    required: ['startDate', 'endDate'],
    additionalProperties: false
};

export const getEventsTool = FunctionTool.from(getEvents, {
        name: 'getEvents',
        description: 'get Events in Agenda given a date range',
        parameters: getEventsSchema
    });