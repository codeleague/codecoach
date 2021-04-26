import { AppConfig, ConfigArgument, ProviderConfig } from './@types';
import { TIME_ZONE, USER_AGENT } from './constants/defaults';
import { YML } from './YML';

const buildYMLConfig = async (args: ConfigArgument) => {
  if (!args.config) return;
  const parsed = await YML.parse(args.config);
  return parsed;
};

export const buildProviderConfig = async (
  arg: ConfigArgument,
): Promise<ProviderConfig> => {
  const configFile = await buildYMLConfig(arg);

  return {
    token: configFile?.provider.token || arg.token,
    repoUrl: configFile?.provider.url || arg.url,
    prId: configFile?.provider.pr || arg.pr,
    removeOldComment: configFile?.provider.removeOldComment || arg.removeOldComment,
    userAgent: configFile?.provider.userAgent || USER_AGENT,
    timeZone: configFile?.provider.timeZone || TIME_ZONE,
  };
};

export const buildAppConfig = async (arg: ConfigArgument): Promise<AppConfig> => {
  const configFile = await buildYMLConfig(arg);
  return {
    logFilePath: configFile?.output || arg.output,
    buildLogFiles: configFile?.buildLogFiles || arg.buildLogFile,
  };
};
