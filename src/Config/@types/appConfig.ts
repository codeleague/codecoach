import { COMMAND } from '../@enums';
import { BuildLogFile } from './buildLogFile';

export type AppConfig = {
  command: COMMAND;
  logFilePath: string;
  buildLogFiles: BuildLogFile[];
  apiServer: string;
};
