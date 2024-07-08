import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { createCalendarAgent } from "./agents/CalendarAgent";

async function main() {
    const agent = await createCalendarAgent();

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
