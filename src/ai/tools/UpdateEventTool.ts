import { FunctionTool } from "llamaindex";
import { Event } from "../../core/models/Event";
import { GoogleCalendarRepository } from "../../core/implementations/google_calendar/GoogleCalendarRepository";

export const updateEventTool = (calendarRepository: GoogleCalendarRepository) => {
    return FunctionTool.from(
        async (parameters: { eventId: string, event: Event }) => {
            try {
                const eventLink = await calendarRepository.updateEvent(parameters.eventId, parameters.event);
                return { status: 'success', eventLink };
            } catch (error) {
                console.error('Error updating event:', error);
                return { status: 'error', message: error.message };
            }
        },
        {
            name: "updateEvent",
            description: "update an existing event in the Agenda",
            parameters: {
                type: "object",
                properties: {
                    eventId: {
                        type: "string",
                        description: "ID of the event to be updated"
                    },
                    event: {
                        type: "object",
                        properties: {
                            summary: {
                                type: "string",
                                description: "Event summary"
                            },
                            location: {
                                type: "string",
                                description: "Event location (optional)"
                            },
                            description: {
                                type: "string",
                                description: "Event description (optional)"
                            },
                            start: {
                                type: "object",
                                properties: {
                                    dateTime: {
                                        type: "string",
                                        description: "Start date and time of the event in ISO 8601 format"
                                    },
                                    timeZone: {
                                        type: "string",
                                        description: "Time zone of the start date and time"
                                    }
                                },
                                required: ["dateTime", "timeZone"],
                                description: "Start date and time of the event"
                            },
                            end: {
                                type: "object",
                                properties: {
                                    dateTime: {
                                        type: "string",
                                        description: "End date and time of the event in ISO 8601 format"
                                    },
                                    timeZone: {
                                        type: "string",
                                        description: "Time zone of the end date and time"
                                    }
                                },
                                required: ["dateTime", "timeZone"],
                                description: "End date and time of the event"
                            }
                        },
                        required: ["summary", "start", "end"]
                    }
                },
                required: ["eventId", "event"]
            }
        }
    );
};
