import { AgentVerbosityEnum } from '../@enums/agent.verbosity.enum';

export type AgentSettings = {
  target: string;
  warnFilePath: string;
  errorFilePath: string;
  rebuild: boolean;
  verbosity: AgentVerbosityEnum;
  optional?: string[];
};
