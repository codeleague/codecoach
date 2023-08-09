import type { JsonReporter } from '@jscpd/finder';

export type JscpdLog = ReturnType<JsonReporter['generateJson']>;
