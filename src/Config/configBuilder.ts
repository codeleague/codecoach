import { AppConfig, ConfigArgument, ProviderConfig } from './@types';
import { ConfigArgumentGitlab } from './@types/configArgument';
import { YML } from './YML';

const buildYMLConfig = async (args: ConfigArgument) => {
  if (!args.config) return;
  return YML.parse(args.config);
};

export const buildProviderConfig = async (
  arg: ConfigArgumentGitlab,
): Promise<ProviderConfig> => {
  const configFile = await buildYMLConfig(arg);

  return {
    token: configFile?.repo.token || arg.token,
    repoUrl: configFile?.repo.url || arg.url,
    prId: configFile?.repo.pr || arg.pr,
    removeOldComment: configFile?.repo.removeOldComment || arg.removeOldComment,
    gitlabProjectId: configFile?.repo.gitlabProjectId || arg.gitlabProjectId,
  };
};

export const buildAppConfig = async (arg: ConfigArgument): Promise<AppConfig> => {
  const configFile = await buildYMLConfig(arg);
  return {
    logFilePath: configFile?.output || arg.output,
    buildLogFiles: configFile?.buildLogFiles || arg.buildLogFile,
  };
};
