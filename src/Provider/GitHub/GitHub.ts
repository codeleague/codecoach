import { VCS } from '..';
import { Log } from '../../Logger';
import { LogSeverity, LogType } from '../../Parser';
import { onlyIn, onlySeverity } from '../utils/filter.util';
import { MessageUtil } from '../utils/message.util';
import { CommitStatus } from './CommitStatus';
import { IGitHubPRService } from './IGitHubPRService';

export class GitHub implements VCS {
  constructor(private readonly prService: IGitHubPRService) {}

  async report(logs: LogType[]): Promise<void> {
    try {
      await this.removeExistingComments();
      const commitId = await this.prService.getLatestCommitSha();
      const touchedFiles = await this.prService.files();
      const invalidLogs = logs.filter((l) => !l.valid);

      const touchedFileLog = logs
        .filter(onlyIn(touchedFiles))
        .filter(onlySeverity(LogSeverity.error, LogSeverity.warning));

      Log.debug(`Commit SHA ${commitId}`);
      Log.debug('Touched files', touchedFiles);
      Log.debug('Touched file log', touchedFileLog);

      const reviewResults = await Promise.all(
        touchedFileLog.map((log) => this.toCreateReviewComment(commitId, log)),
      );
      const reviewedLogs = reviewResults.filter((log) => log);

      Log.info(
        `Create ${reviewedLogs.length} review comments. (with ${
          reviewResults.length - reviewedLogs.length
        } failed)`,
      );
      const nOfErrors = reviewedLogs.filter(onlySeverity(LogSeverity.error)).length;
      const nOfWarnings = reviewedLogs.filter(onlySeverity(LogSeverity.warning)).length;

      const overview = MessageUtil.generateOverviewMessage(nOfErrors, nOfWarnings);
      const otherIssues = GitHub.createOtherIssue(invalidLogs);

      await this.prService.createComment(
        overview + otherIssues ? `\n${otherIssues}` : '',
      );
      Log.info('Create summary comment completed');

      const commitStatus = nOfErrors ? CommitStatus.failure : CommitStatus.success;
      const description = MessageUtil.generateCommitDescription(nOfErrors);
      await this.prService.createCommitStatus(commitId, commitStatus, description);
      Log.info('Report commit status completed');
    } catch (err) {
      Log.error('GitHub report failed', err);
      throw err;
    }
  }

  private static createOtherIssue(logs: LogType[]): string | null {
    return logs.length > 0
      ? `<details><summary><span style="color:blue">Other issues not related to your code</span></summary> ${logs
          .map((l) => `${l.source} ${l.msg}`)
          .join('\n\n')} </details>`
      : null;
  }

  private toCreateReviewComment = async (
    commitSha: string,
    log: LogType,
  ): Promise<LogType | null> => {
    try {
      await this.prService.createReviewComment(
        commitSha,
        MessageUtil.createMessageWithEmoji(log.msg, log.severity),
        log.source,
        log.line,
      );
      return log;
    } catch (e) {
      // todo: this is workaround; handle comment on restrict zone in github
      Log.warn('GitHub create review failed', e);
      return null;
    }
  };

  private async removeExistingComments(): Promise<void> {
    const [userId, comments, reviews] = await Promise.all([
      this.prService.getCurrentUserId(),
      this.prService.listAllComments(),
      this.prService.listAllReviewComments(),
    ]);
    Log.debug('Get existing CodeCoach comments completed');

    const deleteComments = comments
      .filter((comment) => comment.user.id === userId)
      .map((comment) => this.prService.deleteComment(comment.id));

    const deleteReviews = reviews
      .filter((review) => review.user.id === userId)
      .map((review) => this.prService.deleteReviewComment(review.id));

    await Promise.all([...deleteComments, ...deleteReviews]);
    Log.debug('Delete CodeCoach comments completed');
  }
}
