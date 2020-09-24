import { ChildProcessWithoutNullStreams } from 'child_process';
import { AgentSettings } from '../Agent';

export default interface AgentInterface {
  execPath: string;
  buildBypass: boolean;
  settings: AgentSettings;
  parseSetting: string[];
  process: ChildProcessWithoutNullStreams;
  debug: boolean;

  runTask(): Promise<void>;
}
