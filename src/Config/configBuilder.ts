import { AppConfig, ConfigArgument, ProviderConfig } from './@types';
import { COMMAND } from './constants/defaults';
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
  return {
    token: configFile?.repo.token || arg.token,
    repoUrl: configFile?.repo.url || arg.url,
    runId: configFile?.repo.runId || arg.runId,
    latestCommit: configFile?.repo.latestCommit || arg.latestCommit,
    prId: configFile?.repo.pr || arg.pr,
    removeOldComment: configFile?.repo.removeOldComment || arg.removeOldComment,
  };
};

export const buildAppConfig = async (
  arg: ConfigArgument,
  command: COMMAND,
): Promise<AppConfig> => {
  const configFile = await buildYMLConfig(arg, command);
  return {
    command: command,
    logFilePath: configFile?.output || arg.output,
    buildLogFiles: configFile?.buildLogFiles || arg.buildLogFile,
  };
};
