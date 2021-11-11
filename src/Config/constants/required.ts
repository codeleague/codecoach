import {
  PrConfigYAML,
  DataConfigYAML,
  ConfigYAML,
  PrConfigArgument,
  DataConfigArgument,
} from '../@types';

type DataRequiredArgs = (keyof DataConfigArgument)[];
export const DATA_REQUIRED_ARGS: DataRequiredArgs = [
  'url',
  'headCommit',
  'runId',
  'buildLogFile',
];

type PrRequiredArgs = (keyof PrConfigArgument)[];
export const PR_REQUIRED_ARGS: PrRequiredArgs = ['pr', 'buildLogFile', 'token', 'url'];

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
  'url',
  'headCommit',
];
