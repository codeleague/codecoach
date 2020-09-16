import dotenv from 'dotenv';
import envEnum from './@enums/env.enum';
import { ConfigInterface } from './@interfaces/config.interface';
import { ConfigConstructorType } from './@types/config.constructor.type';
import { ConfigType } from './@types/config.type';
import envType from './@types/env.type';
import { AgentLogVerbosity } from 'src/Agent/Agent';

export default class Config implements ConfigInterface {
  env: envType;
  ignoreKeys?: envEnum[];

  constructor(options?: ConfigConstructorType) {
    const config = dotenv.config({ path: options?.path }).parsed as envType;
    this.env = config;
    this.ignoreKeys = options?.ignoreEnv;

    const valid = this.validate(config, this.ignoreKeys);
    if (!valid) throw new Error('.env file is not valid');
    return;
  }

  validate(configs: envType, ignoreKeys?: envEnum[]): boolean {
    const keys = Object.keys(configs) as envEnum[];
    const invalid = keys.some((key) => {
      const isInvalid = configs[key] === '';
      const isIgnored = ignoreKeys?.includes(key);
      if (isInvalid && isIgnored) return false;
      return isInvalid;
    });
    if (invalid) return false;
    return true;
  }

  getProvider(): ConfigType['provider'] {
    return {
      owner: this.env.PROVIDER_OWNER,
      repo: this.env.PROVIDER_REPO,
      token: this.env.PROVIDER_TOKEN,
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
