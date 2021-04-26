import { ConfigArgument } from '..';
import { ConfigYAML } from '../@types/configYAML';

type RequiredArgs = (keyof ConfigArgument)[];
export const REQUIRED_ARGS: RequiredArgs = ['url', 'pr', 'buildLogFile', 'token'];

type RequiredYamlArgs = (keyof ConfigYAML)[];
export const REQUIRED_YAML_ARGS: RequiredYamlArgs = ['provider', 'buildLogFiles'];

type RequiredYamlProviderArgs = (keyof ConfigYAML['provider'])[];
export const REQUIRED_YAML_PROVIDER_ARGS: RequiredYamlProviderArgs = [
  'url',
  'pr',
  'token',
];
