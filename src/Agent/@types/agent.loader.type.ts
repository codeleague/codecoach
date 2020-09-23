import { AgentSettings } from '../Agent';

type AgentLoaderType = {
  execPath: string;
  settings: AgentSettings;
  debug?: boolean;
};

export default AgentLoaderType;
