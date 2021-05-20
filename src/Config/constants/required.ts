import { ConfigArgument } from '..';
import { ConfigYAML } from '../@types/configYAML';

type RequiredArgs = (keyof ConfigArgument)[];
export const REQUIRED_ARGS: RequiredArgs = ['url', 'pr', 'buildLogFile', 'token'];

type RequiredYamlArgs = (keyof ConfigYAML)[];
export const REQUIRED_YAML_ARGS: RequiredYamlArgs = ['repo', 'buildLogFiles'];

type RequiredYamlProviderArgs = (keyof ConfigYAML['repo'])[];
export const REQUIRED_YAML_PROVIDER_ARGS: RequiredYamlProviderArgs = [
  'url',
  'pr',
  'token',
];
