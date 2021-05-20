import { BuildLogFile } from './buildLogFile';

export type ConfigYAML = {
  repo: {
    url: string;
    pr: number;
    token: string;
    userAgent: string;
    timeZone: string;
    removeOldComment: boolean;
  };
  buildLogFiles: BuildLogFile[];
  output: string;
};
