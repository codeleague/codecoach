import { BuildLogFile } from './buildLogFile';

export type ConfigArgument = {
  url: string;
  buildLogFile: BuildLogFile[];
  output: string;
  token: string;
  config: string;
  pr?: number;
  latestCommit?: string;
  runId?: number;
  removeOldComment: boolean;
};
