import {z} from 'zod';

export const verifySchema = z.object({
  acceptMessages: z
    .boolean(),
});