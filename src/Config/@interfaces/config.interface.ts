import { ConfigType } from '../@types/config.type';
import envType from '../@types/env.type';
import envEnum from '../@enums/env.enum';

export interface ConfigInterface {
  readonly env: envType;
  getProvider(): ConfigType['provider'];
  getAgent(): ConfigType['agent'];
  validate(configs: envType, ignoreKeys?: envEnum[]): boolean;
}
