import { AgentSettings } from 'src/Agent/Agent';
import { ProviderCustomConfigType } from 'src/Provider/ProviderCustomConfigType';
export type ConfigType = {
  provider: ProviderCustomConfigType;
  agent: AgentSettings;
};
