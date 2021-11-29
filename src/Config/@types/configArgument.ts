import { BuildLogFile } from './buildLogFile';

type BaseConfigArgument = {
  url: string;
  buildLogFile: BuildLogFile[];
  output: string;
  config: string;
};

export type PrConfigArgument = {
  pr: number;
  removeOldComment: boolean;
  token: string;
  apiServer: never;
} & BaseConfigArgument;

export type DataConfigArgument = {
  headCommit: string;
  runId: number;
  branch: string;
  apiServer: string;
} & BaseConfigArgument;

export type ConfigArgument = PrConfigArgument | DataConfigArgument;
