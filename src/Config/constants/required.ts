import { ConfigArgument } from '..';
import { ConfigYAML } from '../@types/configYAML';

type DataRequiredArgs = (keyof ConfigArgument)[];
export const DATA_REQUIRED_ARGS: DataRequiredArgs = [
  'url',
  'latestCommit',
  'runId',
  'buildLogFile',
  'token',
];

type PrRequiredArgs = (keyof ConfigArgument)[];
export const PR_REQUIRED_ARGS: PrRequiredArgs = ['pr', 'buildLogFile', 'token', 'url'];

type RequiredYamlArgs = (keyof ConfigYAML)[];
export const REQUIRED_YAML_ARGS: RequiredYamlArgs = ['repo', 'buildLogFiles'];

type RequiredYamlProviderArgs = (keyof ConfigYAML['repo'])[];
export const PR_REQUIRED_YAML_PROVIDER_ARGS: RequiredYamlProviderArgs = [
  'url',
  'pr',
  'token',
];
export const DATA_REQUIRED_YAML_PROVIDER_ARGS: RequiredYamlProviderArgs = [
  'url',
  'latestCommit',
  'token',
];
