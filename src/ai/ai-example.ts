import { OpenAI, FunctionTool, OpenAIAgent, Settings, JSONValue } from "llamaindex";
import "dotenv/config";
import { JSONSchemaType } from "ajv";
import { GoogleCalendarRepository } from "../core/implementations/google_calendar/GoogleCalendarRepository";
import { Event } from "../core/models/Event";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

interface JSONObject { [key: string]: JSONValue; }

async function main() {
    Settings.llm = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-4o",
    });

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

    const updateEvent = async (parameters: { eventId: string, event: Event }): Promise<JSONValue> => {
        const calendarRepository = new GoogleCalendarRepository();

        try {
            const eventLink = await calendarRepository.updateEvent(parameters.eventId, parameters.event);
            return { status: 'success', eventLink };
        } catch (error: any) {
            console.error('Error updating event:', error);
            return { status: 'error', message: error.message ?? 'An unknown error occurred' };
        }
    };

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

    const getCurrentDate = async (): Promise<JSONValue> => {
        const currentDate = new Date();
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'America/Sao_Paulo'
        };
        return currentDate.toLocaleString('pt-BR', options);
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

    const createEventSchema: JSONSchemaType<Event> = {
        type: "object",
        properties: {
            summary: { type: "string", description: "Event summary" },
            location: { type: "string", description: "Event location (optional)", nullable: true },
            description: { type: "string", description: "Event description (optional)", nullable: true },
            start: {
                type: "object",
                properties: {
                    dateTime: { type: "string", description: "Start date and time of the event in ISO 8601 format" },
                    timeZone: { type: "string", description: "Time zone of the start date and time" }
                },
                required: ["dateTime", "timeZone"],
                description: "Start date and time of the event"
            },
            end: {
                type: "object",
                properties: {
                    dateTime: { type: "string", description: "End date and time of the event in ISO 8601 format" },
                    timeZone: { type: "string", description: "Time zone of the end date and time" }
                },
                required: ["dateTime", "timeZone"],
                description: "End date and time of the event"
            }
        },
        required: ["summary", "start", "end"],
        additionalProperties: false
    };

    const getEventsSchema: JSONSchemaType<{ startDate: string; endDate: string }> = {
        type: "object",
        properties: {
            startDate: { type: "string", description: "Start date of the events in ISO 8601 format" },
            endDate: { type: "string", description: "End date of the events in ISO 8601 format" }
        },
        required: ["startDate", "endDate"],
        additionalProperties: false
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

    const deleteEventSchema: JSONSchemaType<{ eventId: string }> = {
        type: "object",
        properties: {
            eventId: { type: "string", description: "ID of the event to be deleted" }
        },
        required: ["eventId"],
        additionalProperties: false
    };

    const emptySchema: JSONSchemaType<{}> = {
        type: "object",
        properties: {},
        additionalProperties: false
    };

    const tools = [
        FunctionTool.from(createEvent, {
            name: "createEvent",
            description: "create Event in Agenda",
            parameters: createEventSchema
        }),
        FunctionTool.from(getEvents, {
            name: "getEvents",
            description: "get Events in Agenda given a date range",
            parameters: getEventsSchema
        }),
        FunctionTool.from(updateEvent, {
            name: "updateEvent",
            description: "update an existing event in the Agenda",
            parameters: updateEventSchema
        }),
        FunctionTool.from(deleteEvent, {
            name: "deleteEvent",
            description: "Deletes an event from the Agenda",
            parameters: deleteEventSchema
        }),
        FunctionTool.from(getCurrentDate, {
            name: "getCurrentDate",
            description: "get current date and time in Brazilian format DAY/MONTH/YEAR",
            parameters: emptySchema
        })
    ];

    const agent = new OpenAIAgent({ tools });

    const rl = readline.createInterface({ input, output });

    while (true) {
        const query = await rl.question("Query: ");
        const response = await agent.chat({
            message: query
        });
        console.log(response);
    }
}

main().catch(console.error);
