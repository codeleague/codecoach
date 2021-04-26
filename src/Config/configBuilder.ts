import { AppConfig, ConfigArgument, ProviderConfig } from './@types';
import { TIME_ZONE, USER_AGENT } from './constants/defaults';

export const buildProviderConfig = async (
  arg: ConfigArgument,
): Promise<ProviderConfig> => ({
  token: arg.token,
  repoUrl: arg.url,
  prId: arg.pr,
  removeOldComment: arg.removeOldComment,
  userAgent: USER_AGENT,
  timeZone: TIME_ZONE,
});

export const buildAppConfig = async (arg: ConfigArgument): Promise<AppConfig> => {
  return {
    logFilePath: arg.output,
    buildLogFiles: arg.buildLogFile,
  };
};
