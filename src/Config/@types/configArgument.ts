import { BuildLogFile } from './buildLogFile';

export interface ConfigArgument {
  url: string;
  pr: number;
  buildLogFile: BuildLogFile[];
  output: string;
  token: string;
  removeOldComment: boolean;
  config: string;
}

export interface ConfigArgumentGitlab extends ConfigArgument {
  gitlabProjectId: string | number;
}
