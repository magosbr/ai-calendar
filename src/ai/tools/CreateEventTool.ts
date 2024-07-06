import { FunctionTool } from "llamaindex";
import { Event } from "../../core/models/Event";
import { GoogleCalendarRepository } from "../../core/implementations/google_calendar/GoogleCalendarRepository";

export const createEventTool = (calendarRepository: GoogleCalendarRepository) => {
    return FunctionTool.from(
        async (parameters: Event) => {
            try {
                const eventLink = await calendarRepository.createEvent(parameters);
                return { status: 'success', eventLink };
            } catch (error) {
                console.error('Error creating event:', error);
                return { status: 'error', message: error.message };
            }
        },
        {
            name: "createEvent",
            description: "create Event in Agenda",
            parameters: {
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
        }
    );
};
