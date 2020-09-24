import AgentLoaderType from '../../Agent/@types/agent.loader.type';
import { AppConfigLoader } from '../../app';
import ProviderLoaderType from '../../Provider/@types/provider.loader.type';
export type ConfigType = {
  app: AppConfigLoader;
  provider: ProviderLoaderType;
  agent: AgentLoaderType;
};
