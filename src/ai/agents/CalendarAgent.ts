import {BaseToolWithCall, OpenAI, OpenAIAgent, Settings} from "llamaindex";
import { createEventTool } from "../tools/CreateEventTool";
import { deleteEventTool } from "../tools/DeleteEventTool";
import { updateEventTool } from "../tools/UpdateEventTool";
import { getEventsTool } from "../tools/GetEventsTool";
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

    const tools: BaseToolWithCall[] = [
        createEventTool,
        getEventsTool,
        updateEventTool,
        deleteEventTool,
        getCurrentDateTool,
    ];

    return new OpenAIAgent({ tools });
};
