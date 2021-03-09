import { VCS } from '..';
import { Log } from '../../Logger';
import { LogSeverity, LogType } from '../../Parser';
import { onlyIn, onlySeverity } from '../utils/filter.util';
import { MessageUtil } from '../utils/message.util';
import { CommentFileStructure, CommentStructure, Comment } from '../@types/CommentTypes';
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

      const comments = this.groupComments(touchedFileLog);

      const reviewResults = await Promise.all(
        comments.map((comment) => this.toCreateReviewComment(commitId, comment)),
      );
      const reviewedComments = reviewResults.filter((log): log is Comment => !!log);

      Log.info(
        `Create ${reviewedComments.length} review comments. (with ${
          comments.length - reviewedComments.length
        } failed)`,
      );
      const nOfErrors = reviewedComments.reduce(
        (sum, comment) => sum + comment.errors,
        0,
      );

      const nOfWarnings = reviewedComments.reduce(
        (sum, comment) => sum + comment.warnings,
        0,
      );

      if (nOfWarnings + nOfErrors > 0 || invalidLogs.length > 0) {
        const overview = MessageUtil.generateOverviewMessage(nOfErrors, nOfWarnings);
        const otherIssues = GitHub.createOtherIssue(invalidLogs);

        await this.prService.createComment(
          overview + (otherIssues ? `\n${otherIssues}` : ''),
        );
        Log.info('Create summary comment completed');
      }

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
    if (logs.length === 0) return null;

    const issuesTableContent = logs.map((l) => `| ${l.source} | ${l.msg} |`).join('\n');

    // Blank line required after </summary> to let markdown after it display correctly
    return `<details>
<summary><span>By the way, there are other issues those might not related to your code</span></summary>

| source | message |
|-|-|
${issuesTableContent}
</details>`;
  }

  private toCreateReviewComment = async (
    commitSha: string,
    comment: Comment,
  ): Promise<Comment | null> => {
    const { text, file, line } = comment;
    try {
      await this.prService.createReviewComment(commitSha, text, file, line);
      Log.debug('GitHub create review success', { text, file, line });
      return comment;
    } catch (e) {
      // todo: this is workaround; handle comment on restrict zone in github
      const { name, status } = e ?? {};
      Log.warn('GitHub create review failed', {
        comment,
        error: { name, status },
      });
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
      .filter((comment) => comment.user?.id === userId)
      .map((comment) => this.prService.deleteComment(comment.id));

    const deleteReviews = reviews
      .filter((review) => review.user?.id === userId)
      .map((review) => this.prService.deleteReviewComment(review.id));

    await Promise.all([...deleteComments, ...deleteReviews]);
    Log.debug('Delete CodeCoach comments completed');
  }

  private groupComments(logs: LogType[]): Comment[] {
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
