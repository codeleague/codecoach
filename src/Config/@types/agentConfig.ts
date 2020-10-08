import { AgentSettings } from '../../Agent/@types/agentSettings';

export type AgentConfig = {
  execPath: string;
  settings: AgentSettings;
  buildBypass?: boolean;
  debug?: boolean;
};
