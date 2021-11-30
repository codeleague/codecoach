import { BuildLogFile } from './buildLogFile';

export interface RepoDetailsYAML {
  url: string;
  pr: number;
  token: string;
  userAgent: string;
  timeZone: string;
  removeOldComment: boolean;
}

export interface RepoDetailsGitlabYAML extends RepoDetailsYAML {
  gitlabProjectId: string | number;
}

export type ConfigYAML = {
  repo: RepoDetailsGitlabYAML;
  buildLogFiles: BuildLogFile[];
  output: string;
};
