import { BuildLogFile } from './buildLogFile';

export type ConfigArgument = {
  url: string;
  pr: number;
  buildLogFile: BuildLogFile[];
  output: string;
  token: string;
  removeOldComment: boolean;
};
