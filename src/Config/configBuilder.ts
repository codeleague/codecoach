import { COMMAND } from './@enums';
import {
  AppConfig,
  ConfigArgument,
  ProviderConfig,
  DataConfigArgument,
  PrConfigArgument,
  DataConfigYAML,
  PrConfigYAML,
  PrProviderConfig,
  DataProviderConfig,
} from './@types';
import { YML } from './YML';

const buildYMLConfig = async (args: ConfigArgument, command: COMMAND) => {
  if (!args.config) return;
  return YML.parse(args.config, command);
};

export const buildProviderConfig = async (
  arg: ConfigArgument,
  command: COMMAND,
): Promise<ProviderConfig> => {
  const configFile = await buildYMLConfig(arg, command);
  switch (command) {
    case COMMAND.COLLECT:
      return buildDataProviderConfig(
        arg as DataConfigArgument,
        configFile as DataConfigYAML,
      );
    case COMMAND.DEFAULT:
      return buildPrProviderConfig(arg as PrConfigArgument, configFile as PrConfigYAML);
    default:
      throw new Error(`Command ${command} is invalid`);
  }
};

const buildPrProviderConfig = (
  arg: PrConfigArgument,
  configFile: PrConfigYAML,
): PrProviderConfig => ({
  token: configFile?.repo.token || arg.token,
  repoUrl: configFile?.repo.url || arg.url,
  prId: configFile?.repo.pr || arg.pr,
  removeOldComment: configFile?.repo.removeOldComment || arg.removeOldComment,
});

const buildDataProviderConfig = (
  arg: DataConfigArgument,
  configFile: DataConfigYAML,
): DataProviderConfig => ({
  repoUrl: configFile?.repo.url || arg.url,
  runId: configFile?.repo.runId || arg.runId,
  headCommit: configFile?.repo.headCommit || arg.headCommit,
  branch: configFile?.repo.branch || arg.branch,
});

export const buildAppConfig = async (
  arg: ConfigArgument,
  command: COMMAND,
): Promise<AppConfig> => {
  const configFile = await buildYMLConfig(arg, command);
  return {
    command: command,
    logFilePath: configFile?.output || arg.output,
    buildLogFiles: configFile?.buildLogFiles || arg.buildLogFile,
    apiServer: configFile?.apiServer || arg.apiServer,
  };
};
