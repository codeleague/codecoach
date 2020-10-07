import { AgentConfig } from './agentConfig';
import { AppConfig } from './appConfig';
import { ProviderConfig } from './providerConfig';

export type ConfigObject = {
  app: AppConfig;
  provider: ProviderConfig;
  agent: AgentConfig;
};
