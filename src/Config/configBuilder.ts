import { AppConfig, ConfigArgument, ProviderConfig } from './@types';
import { TIME_ZONE, USER_AGENT } from './constants/defaults';
import { YML } from './YML';

const buildYMLConfig = async (args: ConfigArgument) => {
  if (!args.config) return;
  return YML.parse(args.config);
};

export const buildProviderConfig = async (
  arg: ConfigArgument,
): Promise<ProviderConfig> => {
  const configFile = await buildYMLConfig(arg);

  return {
    token: configFile?.repo.token || arg.token,
    repoUrl: configFile?.repo.url || arg.url,
    prId: configFile?.repo.pr || arg.pr,
    removeOldComment: configFile?.repo.removeOldComment || arg.removeOldComment,
    userAgent: configFile?.repo.userAgent || USER_AGENT,
    timeZone: configFile?.repo.timeZone || TIME_ZONE,
  };
};

export const buildAppConfig = async (arg: ConfigArgument): Promise<AppConfig> => {
  const configFile = await buildYMLConfig(arg);
  return {
    logFilePath: configFile?.output || arg.output,
    buildLogFiles: configFile?.buildLogFiles || arg.buildLogFile,
  };
};
