import AgentLoaderType from '../../Agent/@types/agent.loader.type';
import ProviderLoaderType from '../../Provider/@types/provider.loader.type';
export type ConfigType = {
  provider: ProviderLoaderType;
  agent: AgentLoaderType;
};
