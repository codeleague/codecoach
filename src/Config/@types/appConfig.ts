import { COMMAND } from '../constants/defaults';
import { BuildLogFile } from './buildLogFile';

export type AppConfig = {
  command: COMMAND;
  logFilePath: string;
  buildLogFiles: BuildLogFile[];
};
