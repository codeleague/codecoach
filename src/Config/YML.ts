import { File } from '../File';
import yaml from 'js-yaml';
import { REQUIRED_YAML_ARGS, REQUIRED_YAML_PROVIDER_ARGS } from './constants/required';
import { ConfigYAML } from './@types/configYAML';

export class YML {
  private static transform(config: ConfigYAML): ConfigYAML {
    if (!config.provider.pr || !Number.isInteger(config.provider.pr))
      throw 'provider.pr is required or invalid number type';

    // required types
    const validRequiredArgs = REQUIRED_YAML_ARGS.every(
      (el) => config[el] != undefined || config[el] != null,
    );
    if (!validRequiredArgs)
      throw `please fill all required fields ${REQUIRED_YAML_ARGS.join(', ')}`;
    const validRequiredProviderArgs = REQUIRED_YAML_PROVIDER_ARGS.every(
      (el) => config.provider[el] != undefined || config.provider[el] != null,
    );
    if (!validRequiredProviderArgs)
      throw `please fill all required fields ${REQUIRED_YAML_PROVIDER_ARGS.join(', ')}`;

    return {
      ...config,
      provider: {
        ...config.provider,
        pr: Number(config.provider.pr),
        removeOldComment: Boolean(config.provider.removeOldComment),
      },
    };
  }

  static async parse(path: string): Promise<ConfigYAML> {
    const file = await File.readFileHelper(path);
    const ymlFile = yaml.loadAll(file);
    const transformed = this.transform(ymlFile[0]);
    return transformed;
  }
}
