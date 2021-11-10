import { BuildLogFile } from './buildLogFile';

type BaseConfigArgument = {
  url: string;
  buildLogFile: BuildLogFile[];
  output: string;
  token: string;
  config: string;
};

export type PrConfigArgument = {
  pr: number;
  removeOldComment: boolean;
} & BaseConfigArgument;

export type DataConfigArgument = {
  latestCommit: string;
  runId: number;
} & BaseConfigArgument;

export type ConfigArgument = PrConfigArgument | DataConfigArgument;