import { LogType } from '../../Parser';

export interface VCS {
  // returns boolean indicating process return code. true = zero (pass), false = non-zero (failure)
  report(logs: LogType[]): Promise<boolean>;
}
