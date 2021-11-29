import { BuildLogFile } from './buildLogFile';

type BaseConfigYAML = {
  repo: {
    url: string;
    userAgent: string;
    timeZone: string;
  };
  buildLogFiles: BuildLogFile[];
  output: string;
};

export type PrConfigYAML = {
  repo: {
    token: string;
    pr: number;
    removeOldComment: boolean;
  };
  apiServer: never;
} & BaseConfigYAML;

export type DataConfigYAML = {
  repo: {
    headCommit: string;
    runId: number;
    branch: string;
  };
  apiServer: string;
} & BaseConfigYAML;

export type ConfigYAML = PrConfigYAML | DataConfigYAML;
