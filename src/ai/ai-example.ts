// noinspection TypeScriptValidateTypes

import { OpenAI, FunctionTool, OpenAIAgent, Settings } from "llamaindex";
import "dotenv/config";
import { GoogleCalendarRepository } from "../core/implementations/google_calendar/GoogleCalendarRepository";
import { Event } from "../core/models/Event";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

async function main() {
    Settings.llm = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-4o",
    });

    const createEvent = async (parameters: Event) => {
        const calendarRepository = new GoogleCalendarRepository();

        try {
            const eventLink = await calendarRepository.createEvent(parameters);
            return { status: 'success', eventLink };
        } catch (error) {
            console.error('Error creating event:', error);
            return { status: 'error', message: error.message };
        }
    }

    const getEvents = async (parameters: { startDate: string, endDate: string }) => {
        const calendarRepository = new GoogleCalendarRepository();

        try {
            const events: Event[] = await calendarRepository.getEvents(parameters.startDate, parameters.endDate);
            return { status: 'success', events };
        } catch (error) {
            console.error('Error fetching events:', error);
            return { status: 'error', message: error.message };
        }
    }

    const updateEvent = async (parameters: { eventId: string, event: Event }) => {
        const calendarRepository = new GoogleCalendarRepository();

        try {
            const eventLink = await calendarRepository.updateEvent(parameters.eventId, parameters.event);
            return { status: 'success', eventLink };
        } catch (error) {
            console.error('Error updating event:', error);
            return { status: 'error', message: error.message };
        }
    }

    const deleteEvent = async (parameters: { eventId: string }) => {
        const calendarRepository = new GoogleCalendarRepository();

        try {
            await calendarRepository.deleteEvent(parameters.eventId);
            return { status: 'success', message: 'Event deleted' };
        } catch (error) {
            console.error('Error deleting event:', error);
            return { status: 'error', message: error.message };
        }
    }

    const getCurrentDate = async () => {
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
    }

    const tools = [
        FunctionTool.from(
            createEvent,
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
        ),
        FunctionTool.from(
            getEvents,
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
                            description: "End date of the events to fetch in ISO 8601 format " +
                                "(if same day as startDate must pick the next day)"
                        }
                    },
                    required: ["startDate", "endDate"]
                }
            }
        ),
        FunctionTool.from(
            updateEvent,
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
        ),
        FunctionTool.from(
            deleteEvent,
            {
                name: "deleteEvent",
                description: "Deletes an event from the Agenda",
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
        ),
        FunctionTool.from(
            getCurrentDate,
            {
                name: "getCurrentDate",
                description: "get current date and time in Brazilian format DAY/MONTH/YEAR",
                parameters: {}
            }
        )
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
