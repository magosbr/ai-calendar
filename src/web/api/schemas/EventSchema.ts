import { z } from 'zod';

export const eventSchema = z.object({
    summary: z.string(),
    location: z.string().optional(),
    description: z.string().optional(),
    start: z.object({
        dateTime: z.string(),
        timeZone: z.string(),
    }),
    end: z.object({
        dateTime: z.string(),
        timeZone: z.string(),
    }),
});
