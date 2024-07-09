import {BaseToolWithCall, FunctionTool, JSONValue} from "llamaindex";
import { JSONSchemaType } from "ajv";
import { Event } from "../../core/models/Event";
import { createEventSchema } from "./CreateEventTool";
import {
    GoogleCalendarRepository
} from "../../core/implementations/google_calendar/GoogleCalendarRepository";

const updateEvent = async (parameters: { eventId: string, event: Event }): Promise<JSONValue> => {
    const calendarRepository = new GoogleCalendarRepository();

    try {
        const eventLink =
            await calendarRepository.updateEvent(parameters.eventId, parameters.event);
        return { status: 'success', eventLink };
    } catch (error: any) {
        console.error('Error updating event:', error);
        return { status: 'error', message: error.message ?? 'An unknown error occurred' };
    }
};

const updateEventSchema: JSONSchemaType<{ eventId: string; event: Event }> = {
    type: "object",
    properties: {
        eventId: { type: "string", description: "ID of the event to be updated" },
        event: createEventSchema
    },
    required: ["eventId", "event"],
    additionalProperties: false
};

export const updateEventTool = () => {
    return FunctionTool.from(updateEvent, {
        name: "updateEvent",
        description: "update an existing event in the Agenda",
        parameters: updateEventSchema
    })
}