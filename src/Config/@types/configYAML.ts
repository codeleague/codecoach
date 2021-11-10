import { BuildLogFile } from './buildLogFile';

type BaseConfigYAML = {
  repo: {
    url: string;
    token: string;
    userAgent: string;
    timeZone: string;
  };
  buildLogFiles: BuildLogFile[];
  output: string;
};

export type PrConfigYAML = {
  repo: {
    pr: number;
    removeOldComment: boolean;
  };
} & BaseConfigYAML;

export type DataConfigYAML = {
  repo: {
    latestCommit: string;
    runId: number;
  };
} & BaseConfigYAML;

export type ConfigYAML = PrConfigYAML | DataConfigYAML;
