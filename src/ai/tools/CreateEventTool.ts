import {BaseToolWithCall, FunctionTool, JSONValue} from "llamaindex";
import { Event } from "../../core/models/Event";
import {
    GoogleCalendarRepository
} from "../../core/implementations/google_calendar/GoogleCalendarRepository";
import { JSONSchemaType } from "ajv";

const createEvent = async (parameters: Event): Promise<JSONValue> => {
    const calendarRepository = new GoogleCalendarRepository();

    try {
        const eventLink = await calendarRepository.createEvent(parameters);
        return { status: 'success', eventLink };
    } catch (error: any) {
        console.error('Error creating event:', error);
        return { status: 'error', message: error.message ?? 'An unknown error occurred' };
    }
};

export const createEventSchema: JSONSchemaType<Event> = {
    type: "object",
    properties: {
        summary: { type: "string", description: "Event summary" },
        location: { type: "string", description: "Event location (optional)", nullable: true },
        description: {
            type: "string", description: "Event description (optional)", nullable: true
        },
        start: {
            type: "object",
            properties: {
                dateTime: { type: "string", description: "Start date and time of the event in " +
                        "ISO 8601 format" },
                timeZone: { type: "string", description: "Time zone of the start date and time" }
            },
            required: ["dateTime", "timeZone"],
            description: "Start date and time of the event"
        },
        end: {
            type: "object",
            properties: {
                dateTime: { type: "string", description: "End date and time of the event in " +
                        "ISO 8601 format" },
                timeZone: { type: "string", description: "Time zone of the end date and time" }
            },
            required: ["dateTime", "timeZone"],
            description: "End date and time of the event"
        }
    },
    required: ["summary", "start", "end"],
    additionalProperties: false
};

export const createEventTool = FunctionTool.from(createEvent, {
        name: "createEvent",
        description: "create Event in Agenda",
        parameters: createEventSchema
});
