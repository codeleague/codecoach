import { VCS } from '../@interfaces/VCS';
import { LogSeverity, LogType } from '../../Parser';
import { Log } from '../../Logger';
import { MessageUtil } from '../utils/message.util';
import { onlyIn, onlySeverity } from '../utils/filter.util';
import { groupComments } from '../utils/commentUtil';
import { Comment } from '../@types/CommentTypes';
import { Diff } from '../@types/PatchTypes';
import { VCSEngineConfig } from '../@types/VCSEngineConfig';

export abstract class VCSEngine implements VCS {
  private touchedDiff: Diff[];
  private comments: Comment[];
  protected nWarning: number;
  protected nError: number;
  protected constructor(private readonly config: VCSEngineConfig) {}

  abstract vcsGetLatestCommitSha(): string;
  abstract vcsDiff(): Promise<Diff[]>;
  abstract vcsCreateComment(comment: string): Promise<void>;
  abstract vcsCreateReviewComment(
    text: string,
    file: string,
    line: number,
  ): Promise<void>;

  abstract vcsRemoveExistingComments(): Promise<void>;
  abstract vcsName(): string;

  async report(logs: LogType[]): Promise<boolean> {
    try {
      await this.setup(logs);

      if (this.config.removeOldComment) {
        await this.vcsRemoveExistingComments();
      }

      await Promise.all(this.comments.map((c) => this.createReviewComment(c)));
      await this.createSummaryComment();

      Log.info('Report commit status completed');
    } catch (err) {
      Log.error(`${this.vcsName()} report failed`, err);
      throw err;
    }
    return this.config.failOnWarnings
      ? this.nError + this.nWarning === 0
      : this.nError === 0;
  }

  private async createSummaryComment() {
    if (this.nWarning + this.nError > 0) {
      const overview = MessageUtil.generateOverviewMessage(this.nError, this.nWarning);
      await this.vcsCreateComment(overview);
      Log.info('Create summary comment completed');
    } else {
      Log.info('No summary comment needed');
    }
  }

  private async setup(logs: LogType[]) {
    this.touchedDiff = await this.vcsDiff();

    const touchedFileLog = logs
      .filter(onlySeverity(LogSeverity.error, LogSeverity.warning))
      .filter(onlyIn(this.touchedDiff));

    this.comments = groupComments(touchedFileLog);
    this.nError = this.comments.reduce((sum, comment) => sum + comment.errors, 0);
    this.nWarning = this.comments.reduce((sum, comment) => sum + comment.warnings, 0);

    Log.debug(`VCS Setup`, {
      sha: this.vcsGetLatestCommitSha(),
      diff: this.touchedDiff,
      comments: this.comments,
      err: this.nError,
      warning: this.nWarning,
    });
  }

  private async createReviewComment(comment: Comment): Promise<Comment> {
    const { text, file, line } = comment;

    await this.vcsCreateReviewComment(text, file, line);
    Log.debug(`${this.vcsName()} create review success`, { text, file, line });
    return comment;
  }
}
