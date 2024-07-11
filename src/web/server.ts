import express, { Request, Response } from 'express';
import 'dotenv/config';
import bodyParser from 'body-parser';
import path from 'path';
import { createEvent, getEvents, updateEvent, deleteEvent } from './api/controllers/CalendarController';
import { validateRequest } from './api/middlewares/ValidationMiddleware';
import { EventSchema } from './api/schemas/EventSchema';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../..', 'public')));

app.post('/create', validateRequest(EventSchema), createEvent);
app.get('/events', getEvents);
app.put('/events/:eventId', validateRequest(EventSchema), updateEvent);
app.delete('/events/:eventId', deleteEvent);

const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;

// Define interfaces for the webhook payload
interface Message {
    from: string;
    id: string;
    text: { body: string };
    type: string;
}

interface Entry {
    changes: Array<{
        value: {
            messages?: Message[];
            metadata?: {
                phone_number_id: string;
            };
        };
    }>;
}

interface WebhookPayload {
    entry: Entry[];
}

app.post("/webhook", async (req: Request, res: Response) => {
    // log incoming messages
    console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));

    const payload = req.body as WebhookPayload;

    // check if the webhook request contains a message
    const message = payload.entry?.[0]?.changes[0]?.value?.messages?.[0];

    // check if the incoming message contains text
    if (message?.type === "text") {
        // extract the business number to send the reply from it
        const business_phone_number_id = payload.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

        if (!business_phone_number_id) {
            res.sendStatus(400);
            return;
        }

        try {
            // send a reply message as per the docs
            await axios({
                method: "POST",
                url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
                headers: {
                    Authorization: `Bearer ${GRAPH_API_TOKEN}`,
                },
                data: {
                    messaging_product: "whatsapp",
                    to: message.from,
                    text: { body: "Echo: " + message.text.body },
                    context: {
                        message_id: message.id, // shows the message as a reply to the original user message
                    },
                },
            });

            // mark incoming message as read
            await axios({
                method: "POST",
                url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
                headers: {
                    Authorization: `Bearer ${GRAPH_API_TOKEN}`,
                },
                data: {
                    messaging_product: "whatsapp",
                    status: "read",
                    message_id: message.id,
                },
            });

            res.sendStatus(200);
        } catch (error) {
            console.error('Error processing webhook:', error);
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(400);
    }
});

app.get("/webhook", (req: Request, res: Response) => {
    const mode = req.query["hub.mode"] as string;
    const token = req.query["hub.verify_token"] as string;
    const challenge = req.query["hub.challenge"] as string;

    // check the mode and token sent are correct
    if (mode === "subscribe" && token === "hello") {
        // respond with 200 OK and challenge token from the request
        res.status(200).send(challenge);
        console.log("Webhook verified successfully!");
    } else {
        // respond with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
    }
});

app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../..', 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
