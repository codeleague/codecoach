import dotenv from 'dotenv';
import { AgentVerbosityEnum } from '../Agent/@enums/agent.verbosity.enum';
import envEnum from './@enums/env.enum';
import { AgentConfig, AppConfig, ConfigObject, ProviderConfig } from './@types';
import {
  DEFAULT_ERR_FILE,
  DEFAULT_LOG_FILE,
  DEFAULT_WARN_FILE,
  GITHUB_API_URL,
  GITHUB_REPO_URL,
  TIME_ZONE,
  USER_AGENT,
} from './constants/defaults';
import { TRUE } from './constants/literals';

// todo: make configs command line arguments
dotenv.config();

const DEFAULT_IGNORE_KEYS: envEnum[] = [
  envEnum.PROVIDER_API_URL,
  envEnum.PROVIDER_REPO_URL,
  envEnum.AGENT_BUILD_BYPASS,
  envEnum.PROVIDER_GIT_CLONE_BYPASS,
];

const configKeys = Object.keys(envEnum) as envEnum[];

export const validateConfig = (
  env: NodeJS.ProcessEnv,
  ignoreKeys: envEnum[] = DEFAULT_IGNORE_KEYS,
): boolean =>
  configKeys.every((key) => {
    const isValid = env[key] !== '';
    const isIgnored = ignoreKeys?.includes(key) ?? false;
    return isValid || isIgnored;
  });

export const buildProviderConfig = (env: NodeJS.ProcessEnv): ProviderConfig => ({
  owner: env[envEnum.PROVIDER_OWNER] as string,
  repo: env[envEnum.PROVIDER_REPO] as string,
  token: env[envEnum.PROVIDER_TOKEN] as string,
  baseUrl: env[envEnum.PROVIDER_API_URL] || GITHUB_API_URL,
  repoUrl: env[envEnum.PROVIDER_REPO_URL] || GITHUB_REPO_URL,
  prId: Number(env[envEnum.PROVIDER_PR_NUMBER]),
  gitCloneBypass: env[envEnum.PROVIDER_GIT_CLONE_BYPASS] === TRUE,
  userAgent: USER_AGENT,
  timeZone: TIME_ZONE,
});

export const buildAgentConfig = (env: NodeJS.ProcessEnv): AgentConfig => ({
  execPath: env[envEnum.AGENT_PATH] as string,
  buildBypass: env[envEnum.AGENT_BUILD_BYPASS] === TRUE,
  settings: {
    target: env[envEnum.AGENT_PROJECT_TARGET] as string,
    warnFilePath: env[envEnum.WARN_FILE] || DEFAULT_WARN_FILE,
    errorFilePath: env[envEnum.ERR_FILE] || DEFAULT_ERR_FILE,
    verbosity: env[envEnum.AGENT_VERBOSITY] as AgentVerbosityEnum,
    rebuild: env[envEnum.AGENT_REBUILD] === TRUE,
  },
});

export const buildAppConfig = (env: NodeJS.ProcessEnv): AppConfig => {
  const warnFilePath = env[envEnum.WARN_FILE] || DEFAULT_WARN_FILE;
  const errFilePath = env[envEnum.ERR_FILE] || DEFAULT_ERR_FILE;
  const logFilePath = env[envEnum.LOG_FILE] || DEFAULT_LOG_FILE;

  return { warnFilePath, errFilePath, logFilePath };
};

if (!validateConfig(process.env)) {
  throw new Error('.env file is not valid');
}

const config: ConfigObject = Object.freeze({
  agent: buildAgentConfig(process.env),
  app: buildAppConfig(process.env),
  provider: buildProviderConfig(process.env),
});

export default config;
