import { z } from 'zod';
import { configSchema } from '../Config';

export type ConfigArgument = z.infer<typeof configSchema>;
