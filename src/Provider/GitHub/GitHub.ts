import { LogSeverity, LogType } from '../../Parser';
import { VCS } from '..';
import { IGitHubPRService } from './IGitHubPRService';
import { onlyIn, onlySeverity } from '../utils/filter.util';
import { MessageUtil } from '../utils/message.util';

export class GitHub implements VCS {
  constructor(private readonly prService: IGitHubPRService) {}

  async report(logs: LogType[]): Promise<boolean> {
    try {
      await this.removeExistingComments();
      const latestCommitSha = await this.prService.getLatestCommitSha();
      const touchedFiles = await this.prService.files();
      const filteredLogs = logs
        .filter(onlyIn(touchedFiles))
        .filter(onlySeverity(LogSeverity.error, LogSeverity.warning));

      if (filteredLogs.length > 0) {
        const reviews = filteredLogs
          .map((log) => {
            try {
              return this.toCreateReviewComment(latestCommitSha)(log);
            } catch (err) {
              console.trace(err);
              return null;
            }
          })
          .filter((el) => el);
        await Promise.all(reviews);

        const nOfErrors = filteredLogs.filter((log) => log.severity === LogSeverity.error)
          .length;
        const nOfWarnings = filteredLogs.filter(
          (log) => log.severity === LogSeverity.warning,
        ).length;
        const comment = GitHub.generateOverviewMessage(nOfErrors, nOfWarnings);

        await this.prService.createComment(comment);

        return nOfErrors === 0;
      }

      return true;
    } catch (err) {
      console.trace(err);
      throw new Error('Github report error' + err);
    }
  }

  private static generateOverviewMessage(nOfErrors: number, nOfWarnings: number): string {
    return `CodeCoach reports ${nOfErrors + nOfWarnings} issue(s)
${MessageUtil.createMessageWithEmoji(`${nOfErrors} error(s)`, LogSeverity.error)}
${MessageUtil.createMessageWithEmoji(`${nOfWarnings} warning(s)`, LogSeverity.warning)}`;
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
