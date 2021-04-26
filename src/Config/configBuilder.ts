import { YML } from '.';
import { AppConfig, ConfigArgument, ProviderConfig } from './@types';
import { ConfigYAML } from './@types/configYAML';
import { TIME_ZONE, USER_AGENT } from './constants/defaults';

const buildYMLConfig = async (args: ConfigArgument) => {
  const parsed = await YML.parse<ConfigYAML>(args.config);
  return parsed;
};

export const buildProviderConfig = async (
  arg: ConfigArgument,
): Promise<ProviderConfig> => {
  const configFile = await buildYMLConfig(arg);

  return {
    token: arg.token || configFile.provider.token,
    repoUrl: arg.url || configFile.provider.url,
    prId: arg.pr || configFile.provider.pr,
    removeOldComment: arg.removeOldComment || configFile.provider.removeOldComment,
    userAgent: configFile.provider.userAgent || USER_AGENT,
    timeZone: configFile.provider.timeZone || TIME_ZONE,
  };
};

export const buildAppConfig = async (arg: ConfigArgument): Promise<AppConfig> => {
  const configFile = await buildYMLConfig(arg);
  return {
    logFilePath: arg.output || configFile.output,
    buildLogFiles: arg.buildLogFile || configFile.buildLogFiles,
  };
};
