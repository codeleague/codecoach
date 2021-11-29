import {
  PrConfigYAML,
  DataConfigYAML,
  ConfigYAML,
  PrConfigArgument,
  DataConfigArgument,
} from '../@types';

type PrRequiredArgs = (keyof PrConfigArgument)[];
export const PR_REQUIRED_ARGS: PrRequiredArgs = ['pr', 'buildLogFile', 'token', 'url'];

type DataRequiredArgs = (keyof DataConfigArgument)[];
export const DATA_REQUIRED_ARGS: DataRequiredArgs = [
  'url',
  'headCommit',
  'runId',
  'buildLogFile',
  'branch',
  'apiServer',
];

type RequiredYamlArgs = (keyof ConfigYAML)[];
export const REQUIRED_YAML_ARGS: RequiredYamlArgs = ['repo', 'buildLogFiles'];

type PrRequiredYamlProviderArgs = (keyof PrConfigYAML['repo'])[];
export const PR_REQUIRED_YAML_PROVIDER_ARGS: PrRequiredYamlProviderArgs = [
  'url',
  'pr',
  'token',
];

type DataRequiredYamlProviderArgs = (keyof DataConfigYAML['repo'])[];
export const DATA_REQUIRED_YAML_PROVIDER_ARGS: DataRequiredYamlProviderArgs = [
  'branch',
  'headCommit',
  'runId',
];

export const DATA_REQUIRED_YAML_ARGS: (keyof DataConfigYAML)[] = [
  ...REQUIRED_YAML_ARGS,
  'apiServer',
];
