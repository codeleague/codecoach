import { BuildLogFile } from './buildLogFile';

export type AppConfig = {
  logFilePath: string;
  buildLogFiles: BuildLogFile[];
};
