import { AppConfig, ConfigArgument, ProviderConfig } from './@types';
import { TIME_ZONE, USER_AGENT } from './constants/defaults';
import { ProjectType } from './@enums';

export const buildProviderConfig = (arg: ConfigArgument): ProviderConfig => ({
  token: arg.token,
  repoUrl: arg.url,
  prId: arg.pr,
  userAgent: USER_AGENT,
  timeZone: TIME_ZONE,
});

export const buildAppConfig = (arg: ConfigArgument): AppConfig => {
  return {
    logFilePath: arg.output,
    projectType: arg.type as ProjectType,
    buildLogFiles: arg.buildLogFile,
  };
};
