import { FunctionTool } from "llamaindex";
import { GoogleCalendarRepository } from "../../core/implementations/google_calendar/GoogleCalendarRepository";

export const deleteEventTool = (calendarRepository: GoogleCalendarRepository) => {
    return FunctionTool.from(
        async (parameters: { eventId: string }) => {
            try {
                await calendarRepository.deleteEvent(parameters.eventId);
                return { status: 'success', message: 'Event deleted' };
            } catch (error) {
                console.error('Error deleting event:', error);
                return { status: 'error', message: error.message };
            }
        },
        {
            name: "deleteEvent",
            description: "delete an event from the Agenda",
            parameters: {
                type: "object",
                properties: {
                    eventId: {
                        type: "string",
                        description: "ID of the event to be deleted"
                    }
                },
                required: ["eventId"]
            }
        }
    );
};
