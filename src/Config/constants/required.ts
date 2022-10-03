import { ConfigArgument } from '..';

type RequiredArgs = (keyof ConfigArgument)[];
export const GITHUB_ARGS: RequiredArgs = ['githubPr', 'githubToken', 'githubRepoUrl'];
export const GITLAB_ARGS: RequiredArgs = [
  'gitlabMrIid',
  'gitlabHost',
  'gitlabProjectId',
  'gitlabToken',
];
