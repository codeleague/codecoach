import { VCS } from '..';
import { Log } from '../../Logger';
import { LogSeverity, LogType } from '../../Parser';
import { Diff } from '../@types/PatchTypes';
import { onlyIn, onlySeverity } from '../utils/filter.util';
import { MessageUtil } from '../utils/message.util';
import { CommentFileStructure, CommentStructure, Comment } from '../@types/CommentTypes';
import { CommitStatus } from './CommitStatus';
import { IGitHubPRService } from './IGitHubPRService';

export class GitHub implements VCS {
  private commitId: string;
  private touchedDiff: Diff[];
  private invalidLogs: LogType[];
  private comments: Comment[];
  private nWarning: number;
  private nError: number;

  constructor(
    private readonly prService: IGitHubPRService,
    private readonly removeOldComment: boolean = false,
  ) {}

  async report(logs: LogType[]): Promise<void> {
    try {
      await this.setup(logs);

      if (this.removeOldComment) {
        await this.removeExistingComments();
      }

      await Promise.all(this.comments.map((c) => this.createReviewComment(c)));
      await this.createSummaryComment();
      await this.setCommitStatus();

      Log.info('Report commit status completed');
    } catch (err) {
      Log.error('GitHub report failed', err);
      throw err;
    }
  }

  private async createSummaryComment() {
    if (this.nWarning + this.nError > 0 || this.invalidLogs.length > 0) {
      const overview = MessageUtil.generateOverviewMessage(this.nError, this.nWarning);
      const other = MessageUtil.createOtherIssueReport(this.invalidLogs);

      await this.prService.createComment(overview + (other ? `\n${other}` : ''));
      Log.info('Create summary comment completed');
    } else {
      Log.info('No summary comment needed');
    }
  }

  private async setCommitStatus() {
    const commitStatus = this.nError > 0 ? CommitStatus.failure : CommitStatus.success;
    const description = MessageUtil.generateCommitDescription(this.nError);

    await this.prService.setCommitStatus(this.commitId, commitStatus, description);
  }

  private async setup(logs: LogType[]) {
    this.commitId = await this.prService.getLatestCommitSha();
    this.touchedDiff = await this.prService.diff();
    this.invalidLogs = logs.filter((l) => !l.valid);

    const touchedFileLog = logs
      .filter(onlySeverity(LogSeverity.error, LogSeverity.warning))
      .filter(onlyIn(this.touchedDiff));

    this.comments = GitHub.groupComments(touchedFileLog);
    this.nError = this.comments.reduce((sum, comment) => sum + comment.errors, 0);
    this.nWarning = this.comments.reduce((sum, comment) => sum + comment.warnings, 0);

    Log.debug(`VCS Setup`, {
      sha: this.commitId,
      diff: this.touchedDiff,
      comments: this.comments,
      err: this.nError,
      warning: this.nWarning,
    });
  }

  private async createReviewComment(comment: Comment): Promise<Comment> {
    const { text, file, line } = comment;

    await this.prService.createReviewComment(this.commitId, text, file, line);
    Log.debug('GitHub create review success', { text, file, line });
    return comment;
  }

  private async removeExistingComments(): Promise<void> {
    const [userId, comments, reviews] = await Promise.all([
      this.prService.getCurrentUserId(),
      this.prService.listAllComments(),
      this.prService.listAllReviewComments(),
    ]);
    Log.debug('Get existing CodeCoach comments completed');

    const deleteComments = comments
      .filter((comment) => comment.user?.id === userId)
      .map((comment) => this.prService.deleteComment(comment.id));

    const deleteReviews = reviews
      .filter((review) => review.user?.id === userId)
      .map((review) => this.prService.deleteReviewComment(review.id));

    await Promise.all([...deleteComments, ...deleteReviews]);
    Log.debug('Delete CodeCoach comments completed');
  }

  private static groupComments(logs: LogType[]): Comment[] {
    const commentMap = logs.reduce((map: CommentStructure, log) => {
      const { source: file, line, severity, msg } = log;
      const text = MessageUtil.createMessageWithEmoji(msg, severity);

      if (!line) return map;

      const currentWarnings = map?.[file]?.[line]?.warnings ?? 0;
      const currentErrors = map?.[file]?.[line]?.errors ?? 0;
      const currentText = map?.[file]?.[line]?.text ?? '';

      const nextObject: Comment = {
        text: `${currentText}\n${text}`,
        errors: currentErrors + (severity === LogSeverity.error ? 1 : 0),
        warnings: currentWarnings + (severity === LogSeverity.warning ? 1 : 0),
        file,
        line,
      };

      const fileCommentUpdater: CommentFileStructure = { [line]: nextObject };
      const updatedFileComment = Object.assign({}, map?.[file], fileCommentUpdater);

      const mapUpdater: CommentStructure = { [file]: updatedFileComment };
      return Object.assign({}, map, mapUpdater);
    }, {});

    return Object.values(commentMap).flatMap((file) => Object.values(file));
  }
}
