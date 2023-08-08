import { createLogger, format, transports } from 'winston';

const { combine, prettyPrint, timestamp, simple } = format;

export const Log = createLogger({
  silent: process.env['NODE_ENV'] === 'test', // set by jest
  transports: [
    new transports.Console({ level: 'info', format: simple() }),
    new transports.File({
      filename: 'debug.log',
      level: 'debug',
      format: combine(timestamp(), prettyPrint()),
    }),
  ],
});
