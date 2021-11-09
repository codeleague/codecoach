import { File } from '../File';
import yaml from 'js-yaml';
import {
  REQUIRED_YAML_ARGS,
  PR_REQUIRED_YAML_PROVIDER_ARGS,
  DATA_REQUIRED_YAML_PROVIDER_ARGS,
} from './constants/required';
import { ConfigYAML } from './@types/configYAML';
import { COMMAND } from './constants/defaults';

export class YML {
  private static transform(config: ConfigYAML, command: COMMAND): ConfigYAML {
    // required types
    const validRequiredArgs = REQUIRED_YAML_ARGS.every(
      (el) => config[el] != undefined || config[el] != null,
    );
    if (!validRequiredArgs)
      throw new Error(`please fill all required fields ${REQUIRED_YAML_ARGS.join(', ')}`);

    if (command === COMMAND.COLLECT) return this.transformDataConfig(config);
    else if (command === COMMAND.DEFAULT) return this.transformPrConfig(config);
    throw new Error(`Command ${command} is invalid`);
  }

  private static transformDataConfig(config: ConfigYAML): ConfigYAML {
    if (!config.repo.runId || !Number.isInteger(config.repo.runId))
      throw new Error('provider.runId is required or invalid number type');

    const validRequiredProviderArgs = DATA_REQUIRED_YAML_PROVIDER_ARGS.every(
      (el) => config.repo[el] != undefined || config.repo[el] != null,
    );
    if (!validRequiredProviderArgs)
      throw new Error(
        `please fill all required fields ${DATA_REQUIRED_YAML_PROVIDER_ARGS.join(', ')}`,
      );

    return {
      ...config,
      repo: {
        ...config.repo,
        runId: Number(config.repo.runId),
      },
    };
  }

  private static transformPrConfig(config: ConfigYAML): ConfigYAML {
    if (!config.repo.pr || !Number.isInteger(config.repo.pr))
      throw new Error('provider.pr is required or invalid number type');

    const validRequiredProviderArgs = PR_REQUIRED_YAML_PROVIDER_ARGS.every(
      (el) => config.repo[el] != undefined || config.repo[el] != null,
    );
    if (!validRequiredProviderArgs)
      throw new Error(
        `please fill all required fields ${PR_REQUIRED_YAML_PROVIDER_ARGS.join(', ')}`,
      );

    return {
      ...config,
      repo: {
        ...config.repo,
        pr: Number(config.repo.pr),
        removeOldComment: Boolean(config.repo.removeOldComment),
      },
    };
  }

  static async parse(path: string, command: COMMAND): Promise<ConfigYAML> {
    const file = await File.readFileHelper(path);
    const ymlFile = yaml.loadAll(file);
    const transformed = this.transform(ymlFile[0], command);
    return transformed;
  }
}
