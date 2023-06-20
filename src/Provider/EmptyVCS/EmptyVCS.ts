import { VCS } from '../@interfaces/VCS';
import { LogSeverity, LogType } from '../../Parser';
import { Comment } from '../@types/CommentTypes';
import { Log } from '../../Logger';
import { onlySeverity } from '../utils/filter.util';
import { groupComments } from '../utils/commentUtil';

export class EmptyVCS implements VCS {
  private comments: Comment[];
  private nWarning: number;
  private nError: number;

  constructor(private readonly failOnWarnings: boolean = false) {}

  async report(logs: LogType[]): Promise<boolean> {
    try {
      await this.setup(logs);
      return this.failOnWarnings ? this.nError + this.nWarning === 0 : this.nError === 0; // fail the process if there's error/warnings
    } catch (err) {
      Log.error('EmptyVCS report failed', err);
      throw err;
    }
  }

  private async setup(logs: LogType[]) {
    const touchedFileLog = logs.filter(
      onlySeverity(LogSeverity.error, LogSeverity.warning),
    );

    this.comments = groupComments(touchedFileLog);
    this.nError = this.comments.reduce((sum, comment) => sum + comment.errors, 0);
    this.nWarning = this.comments.reduce((sum, comment) => sum + comment.warnings, 0);

    Log.debug(`VCS Setup`, {
      comments: this.comments,
      err: this.nError,
      warning: this.nWarning,
    });
  }
}
