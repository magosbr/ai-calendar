import express from 'express';
import 'dotenv/config';
import bodyParser from 'body-parser';
import path from 'path';
import webhooksRouter from './api/routes/webhooks';
import eventsRouter from './api/routes/events';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../..', 'public')));

app.use('/webhook', webhooksRouter);
app.use('/events', eventsRouter);

app.get('*', (req, res) => {
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
