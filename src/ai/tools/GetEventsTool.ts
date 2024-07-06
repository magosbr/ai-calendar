import { FunctionTool } from "llamaindex";
import { GoogleCalendarRepository } from "../../core/implementations/google_calendar/GoogleCalendarRepository";

export const getEventsTool = (calendarRepository: GoogleCalendarRepository) => {
    return FunctionTool.from(
        async (parameters: { startDate: string, endDate: string }) => {
            try {
                const events = await calendarRepository.getEvents(parameters.startDate, parameters.endDate);
                return { status: 'success', events };
            } catch (error) {
                console.error('Error fetching events:', error);
                return { status: 'error', message: error.message };
            }
        },
        {
            name: "getEvents",
            description: "get Events in Agenda given a date range",
            parameters: {
                type: "object",
                properties: {
                    startDate: {
                        type: "string",
                        description: "Start date of the events to fetch in ISO 8601 format"
                    },
                    endDate: {
                        type: "string",
                        description: "End date of the events to fetch in ISO 8601 format (if same day as startDate must pick the next day)"
                    }
                },
                required: ["startDate", "endDate"]
            }
        }
    );
};
