import {z} from 'zod';

export const messageSchema = z.object({
  content: z
    .string()
    .min(1, { message: 'Message content must be at least 1 character long' })
    .max(500, { message: 'Message content must be at most 500 characters long' })
});

