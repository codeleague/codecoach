import { AgentConfig, AppConfig, ConfigArgument, ProviderConfig } from './@types';
import { TIME_ZONE, USER_AGENT } from './constants/defaults';
import { envEnum, ProjectType } from './@enums';

export const buildProviderConfig = (arg: ConfigArgument): ProviderConfig => ({
  token: arg.token,
  repoUrl: arg.url,
  prId: arg.pr,
  gitCloneBypass: arg.noClone,
  userAgent: USER_AGENT,
  timeZone: TIME_ZONE,
});

export const buildAgentConfig = (env: NodeJS.ProcessEnv): AgentConfig => ({
  execPath: env[envEnum.AGENT_PATH] as string,
  target: env[envEnum.AGENT_PROJECT_TARGET],
});

export const buildAppConfig = (arg: ConfigArgument): AppConfig => {
  return {
    logFilePath: arg.output,
    projectType: arg.type as ProjectType,
    buildLogFiles: arg.buildLogFile,
  };
};

const configKeys = Object.keys(envEnum) as envEnum[];

export const validateEnvConfig = (env: NodeJS.ProcessEnv): boolean =>
  configKeys.every((key) => env[key] !== '');
