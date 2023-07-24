#!/usr/bin/env node

import CodeCoachError from './CodeCoachError';
import { ConfigParser } from './Config';
import { Log } from './Logger';
import { App } from './app';

const cliOptions = ConfigParser(process.argv);

new App(cliOptions).start().catch((error) => {
  if (error instanceof CodeCoachError) {
    Log.error(error.message);
    process.exit(1);
  }

  if (error instanceof Error) {
    const { stack, message } = error;
    Log.error('Unexpected error', { stack, message });
  }

  Log.error('Unexpected error', { error });
  process.exit(2);
});
