import { OpenAIAgent, Settings, OpenAI } from "llamaindex";
import "dotenv/config";
import { GoogleCalendarRepository } from "../../core/implementations/google_calendar/GoogleCalendarRepository";
import { createEventTool } from "../tools/CreateEventTool";
import { getEventsTool } from "../tools/GetEventsTool";
import { updateEventTool } from "../tools/UpdateEventTool";
import { deleteEventTool } from "../tools/DeleteEventTool";
import { getCurrentDateTool } from "../tools/GetCurrentDateTool";

export const createCalendarAgent = async () => {
    Settings.llm = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-4o",
    });

    Settings.callbackManager.on("llm-tool-call", (event) => {
        console.log(event.detail.payload);
    });
    Settings.callbackManager.on("llm-tool-result", (event) => {
        console.log(event.detail.payload);
    });

    const calendarRepository = new GoogleCalendarRepository();

    const tools = [
        createEventTool(calendarRepository),
        getEventsTool(calendarRepository),
        updateEventTool(calendarRepository),
        deleteEventTool(calendarRepository),
        getCurrentDateTool(),
    ];

    return new OpenAIAgent({ tools });
};
