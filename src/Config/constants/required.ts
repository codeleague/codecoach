import { ConfigArgumentGitlab } from '../@types/configArgument';
import { ConfigYAML } from '../@types/configYAML';

export type RequiredArgs = (keyof ConfigArgumentGitlab)[];
export const REQUIRED_ARGS_GITHUB: RequiredArgs = ['url', 'pr', 'buildLogFile', 'token'];
export const REQUIRED_ARGS_GITLAB: RequiredArgs = [
  'url',
  'pr',
  'buildLogFile',
  'token',
  'gitlabProjectId',
];

type RequiredYamlArgs = (keyof ConfigYAML)[];
export const REQUIRED_YAML_ARGS: RequiredYamlArgs = ['repo', 'buildLogFiles'];

export type RequiredYamlProviderArgs = (keyof ConfigYAML['repo'])[];
export const REQUIRED_GITHUB_YAML_PROVIDER_ARGS: RequiredYamlProviderArgs = [
  'url',
  'pr',
  'token',
];
export const REQUIRED_GITLAB_YAML_PROVIDER_ARGS: RequiredYamlProviderArgs = [
  'url',
  'pr',
  'token',
];
