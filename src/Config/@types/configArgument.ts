import { BuildLogFile } from './buildLogFile';

export type ConfigArgument = {
  vcs: 'gitlab' | 'github';
  githubRepoUrl: string;
  githubPr: number;
  githubToken: string;
  gitlabHost: string;
  gitlabProjectId: number;
  gitlabMrIid: number;
  gitlabToken: string;
  buildLogFile: BuildLogFile[];
  output: string; // =logFilePath
  outputFormat: 'default' | 'gitlab';
  removeOldComment: boolean;
  failOnWarnings: boolean;
  suppressRules: string[];
  dryRun: boolean;
  silent: boolean;
};
