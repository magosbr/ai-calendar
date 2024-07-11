import {
    GoogleCalendarRepository
} from '@implementations/google_calendar/GoogleCalendarRepository';
import { FunctionTool, JSONValue} from 'llamaindex';
import { JSONSchemaType } from 'ajv';

const deleteEvent = async (parameters: { eventId: string }): Promise<JSONValue> => {
    const calendarRepository = new GoogleCalendarRepository();

    try {
        await calendarRepository.deleteEvent(parameters.eventId);
        return { status: 'success', message: 'Event deleted' };
    } catch (error: any) {
        console.error('Error deleting event:', error);
        return { status: 'error', message: error.message ?? 'An unknown error occurred' };
    }
};

const deleteEventSchema: JSONSchemaType<{ eventId: string }> = {
    type: 'object',
    properties: {
        eventId: { type: 'string', description: 'ID of the event to be deleted' }
    },
    required: ['eventId'],
    additionalProperties: false
};

export const deleteEventTool = FunctionTool.from(deleteEvent, {
        name: 'deleteEvent',
        description: 'Deletes an event from the Agenda',
        parameters: deleteEventSchema
    });
