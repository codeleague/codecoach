import dotenv from 'dotenv';
import envEnum from './@enums/env.enum';
import { ConfigInterface } from './@interfaces/config.interface';
import { ConfigLoaderType as ConfigConstructorLoaderType } from './@types/config.loader.type';
import { ConfigType } from './@types/config.type';
import envType from './@types/env.type';
import { AgentLogVerbosity } from 'src/Agent/Agent';

const DEFAULT_IGNORE_KEYS: envEnum[] = [
  envEnum.PROVIDER_API_URL,
  envEnum.PROVIDER_REPO_URL,
];
export default class Config implements ConfigInterface {
  env: envType;
  ignoreKeys?: envEnum[];

  constructor(options?: ConfigConstructorLoaderType) {
    const config = dotenv.config({ path: options?.path }).parsed as envType;
    this.env = config;
    this.ignoreKeys = options?.ignoreEnv || DEFAULT_IGNORE_KEYS;

    const valid = this.validate(config, this.ignoreKeys);
    if (!valid) throw new Error('.env file is not valid');
    return;
  }

  validate(configs: envType, ignoreKeys: envEnum[]): boolean {
    const keys = Object.keys(configs) as envEnum[];
    return keys.every((key) => {
      const isValid = configs[key] !== '';
      const isIgnored = ignoreKeys?.includes(key);
      return isValid || isIgnored;
    });
  }

  getProvider(): ConfigType['provider'] {
    return {
      owner: this.env.PROVIDER_OWNER,
      repo: this.env.PROVIDER_REPO,
      token: this.env.PROVIDER_TOKEN,
      apiUrl: this.env.PROVIDER_API_URL,
      repoUrl: this.env.PROVIDER_REPO_URL,
      prId: Number(this.env.PROVIDER_PR_NUMBER),
    };
  }

  getAgent(): ConfigType['agent'] {
    return {
      target: this.env.AGENT_PROJECT_TARGET,
      warnFilePath: this.env.AGENT_WARN_LOG_PATH,
      errorFilePath: this.env.AGENT_ERROR_LOG_PATH,
      verbosity: this.env.AGENT_VERBOSITY as AgentLogVerbosity,
      rebuild: Boolean(this.env.AGENT_REBUILD),
    };
  }
}
