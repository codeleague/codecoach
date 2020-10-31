import { VCS } from '..';
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
      const filteredLogs = logs
        .filter(onlyIn(touchedFiles))
        .filter(onlySeverity(LogSeverity.error, LogSeverity.warning));

      const reviews = filteredLogs
        .map((log) => {
          try {
            return this.toCreateReviewComment(commitId)(log);
          } catch (err) {
            console.trace(err);
            return null;
          }
        })
        .filter((el) => el);
      await Promise.all(reviews);

      const nOfErrors = filteredLogs.filter(onlySeverity(LogSeverity.error)).length;
      const nOfWarnings = filteredLogs.filter(onlySeverity(LogSeverity.warning)).length;

      if (filteredLogs.length > 0) {
        const comment = MessageUtil.generateOverviewMessage(nOfErrors, nOfWarnings);
        await this.prService.createComment(comment);
      }

      const commitStatus = nOfErrors ? CommitStatus.failure : CommitStatus.success;
      const description = MessageUtil.generateCommitDescription(nOfErrors);
      await this.prService.createCommitStatus(commitId, commitStatus, description);
    } catch (err) {
      console.trace(err);
      throw new Error('Github report error' + err);
    }
  }

  private toCreateReviewComment = (commitSha: string) => async (
    log: LogType,
  ): Promise<void> => {
    //todo: handle comment on restrict zone in github
    return this.prService.createReviewComment(
      commitSha,
      MessageUtil.createMessageWithEmoji(log.msg, log.severity),
      log.source,
      log.line,
    );
  };

  private async removeExistingComments(): Promise<void> {
    const [userId, comments, reviews] = await Promise.all([
      this.prService.getCurrentUserId(),
      this.prService.listAllComments(),
      this.prService.listAllReviewComments(),
    ]);

    const deleteComments = comments
      .filter((comment) => comment.user.id === userId)
      .map((comment) => this.prService.deleteComment(comment.id));

    const deleteReviews = reviews
      .filter((review) => review.user.id === userId)
      .map((review) => this.prService.deleteReviewComment(review.id));

    await Promise.all([...deleteComments, ...deleteReviews]);
  }
}
