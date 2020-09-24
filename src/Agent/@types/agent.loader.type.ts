import { AgentSettings } from '../Agent';

type AgentLoaderType = {
  execPath: string;
  settings: AgentSettings;
  buildBypass?: boolean;
  debug?: boolean;
};

export default AgentLoaderType;
