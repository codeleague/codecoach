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
} & BaseConfigYAML;

export type DataConfigYAML = {
  repo: {
    headCommit: string;
    runId: number;
    branch: string;
  };
} & BaseConfigYAML;

export type ConfigYAML = PrConfigYAML | DataConfigYAML;
