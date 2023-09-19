import { LintItem } from '../../Parser';

export interface VCS {
  // returns boolean indicating process return code. true = zero (pass), false = non-zero (failure)
  report(items: LintItem[]): Promise<boolean>;
}
