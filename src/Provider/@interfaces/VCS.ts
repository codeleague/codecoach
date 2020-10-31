import { LogType } from '../../Parser';

export interface VCS {
  report(logs: LogType[]): Promise<void>;
}
