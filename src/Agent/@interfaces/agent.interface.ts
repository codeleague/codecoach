import { ChildProcessWithoutNullStreams } from 'child_process';
import { AgentSettings } from '../@types/agentSettings';

export default interface AgentInterface {
  execPath: string;
  settings: AgentSettings;
  parseSetting: string[];
  process: ChildProcessWithoutNullStreams;
  debug: boolean;

  runTask(): Promise<void>;
}
