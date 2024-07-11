import express, { Request, Response } from 'express';
import axios from 'axios';
import { createCalendarAgent } from '@agents/CalendarAgent';

const router = express.Router();

const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;

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

router.post("/", async (req: Request, res: Response) => {
    console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));

    const payload = req.body as WebhookPayload;
    const message = payload.entry?.[0]?.changes[0]?.value?.messages?.[0];

    if (message?.type === "text") {
        const business_phone_number_id = payload.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

        if (!business_phone_number_id) {
            console.error("No business phone number ID found.");
            res.sendStatus(400);
            return;
        }

        try {
            const agent = await createCalendarAgent();
            const aiResponse = await agent.chat({
                message: message.text.body
            });

            console.log("AI Response:", aiResponse);

            const aiMessageContent = aiResponse.message?.content || "Desculpe, não consegui processar sua solicitação.";

            const replyResponse = await axios({
                method: "POST",
                url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
                headers: {
                    Authorization: `Bearer ${GRAPH_API_TOKEN}`,
                },
                data: {
                    messaging_product: "whatsapp",
                    to: message.from,
                    text: { body: aiMessageContent },
                    context: {
                        message_id: message.id,
                    },
                },
            });

            console.log("Reply Response:", replyResponse.data);

            const markReadResponse = await axios({
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

            console.log("Mark Read Response:", markReadResponse.data);

            res.sendStatus(200);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error processing webhook:', error.response ? error.response.data : error.message);
            } else {
                console.error('Unexpected error processing webhook:', error);
            }
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(400);
    }
});

router.get("/", (req: Request, res: Response) => {
    const mode = req.query["hub.mode"] as string;
    const token = req.query["hub.verify_token"] as string;
    const challenge = req.query["hub.challenge"] as string;

    if (mode === "subscribe" && token === "hello") {
        res.status(200).send(challenge);
        console.log("Webhook verified successfully!");
    } else {
        res.sendStatus(403);
    }
});

export default router;
