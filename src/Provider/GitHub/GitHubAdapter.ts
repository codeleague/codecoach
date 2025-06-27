import { VCSAdapter } from '../@interfaces/VCSAdapter';
import { IGitHubPRService } from './IGitHubPRService';
import { Diff } from '../../Git/@types/PatchTypes';
import { CommitStatus } from './CommitStatus';
import { Log } from '../../Logger';
import { IAnalyzerBot } from '../../AnalyzerBot/@interfaces/IAnalyzerBot';
import { Comment } from '../../AnalyzerBot/@types/CommentTypes';

export class GitHubAdapter implements VCSAdapter {
  private commitId: string;
  private existingComments: Set<string> = new Set();
  private existingCommentIds: Map<string, number> = new Map();
  private existingReviewIds: Map<string, number> = new Map();

  constructor(private readonly prService: IGitHubPRService) {}

  async init(): Promise<void> {
    this.commitId = await this.prService.getLatestCommitSha();

    // Store existing comments for duplicate detection
    const [userId, comments, reviews] = await Promise.all([
      this.prService.getCurrentUserId(),
      this.prService.listAllComments(),
      this.prService.listAllReviewComments(),
    ]);

    // Store regular comments
    comments
      .filter((comment) => comment.user?.id === userId)
      .forEach((comment) => {
        if (comment.body) {
          this.existingComments.add(comment.body);
          this.existingCommentIds.set(comment.body, comment.id);
        }
      });

    // Store review comments
    reviews
      .filter((review) => review.user?.id === userId)
      .forEach((review) => {
        const key = this.generateCommentKey(
          review.path || '',
          review.line || 0,
          review.body,
        );
        this.existingComments.add(key);
        this.existingReviewIds.set(key, review.id);
      });
  }

  private generateCommentKey(file: string, line: number, text: string): string {
    return `${file}:${line}:${text}`;
  }

  async wrapUp(analyzer: IAnalyzerBot): Promise<boolean> {
    await this.setCommitStatus(analyzer);
    return true;
  }

  getName(): string {
    return 'GitHub';
  }

  getLatestCommitSha(): string {
    return this.commitId;
  }

  diff(): Promise<Diff[]> {
    return this.prService.diff();
  }

  createComment(comment: string): Promise<void> {
    if (!this.existingComments.has(comment)) {
      return this.prService.createComment(comment);
    } else {
      Log.debug('Skipped creating duplicate comment');
      return Promise.resolve();
    }
  }

  createReviewComment(
    text: string,
    file: string,
    line: number,
    nLines: number,
  ): Promise<void> {
    const commentKey = this.generateCommentKey(file, line, text);

    if (!this.existingComments.has(commentKey)) {
      return this.prService.createReviewComment(this.commitId, text, file, line, nLines);
    } else {
      Log.debug('Skipped creating duplicate review comment');
      return Promise.resolve();
    }
  }

  async removeExistingComments(currentComments: Comment[]): Promise<void> {
    // Create a set of current issue keys
    const currentIssueKeys = new Set<string>();
    currentComments.forEach((comment) => {
      const key = this.generateCommentKey(comment.file, comment.line, comment.text);
      currentIssueKeys.add(key);
    });

    // Delete comments that are no longer relevant
    const commentsToDelete: Promise<void>[] = [];

    // Check regular comments
    this.existingCommentIds.forEach((commentId, commentText) => {
      if (!currentIssueKeys.has(commentText)) {
        commentsToDelete.push(this.prService.deleteComment(commentId));
        this.existingComments.delete(commentText);
        this.existingCommentIds.delete(commentText);
      }
    });

    // Check review comments
    this.existingReviewIds.forEach((reviewId, commentKey) => {
      if (!currentIssueKeys.has(commentKey)) {
        commentsToDelete.push(this.prService.deleteReviewComment(reviewId));
        this.existingComments.delete(commentKey);
        this.existingReviewIds.delete(commentKey);
      }
    });

    if (commentsToDelete.length > 0) {
      await Promise.all(commentsToDelete);
      Log.debug(`Deleted ${commentsToDelete.length} outdated comments`);
    } else {
      Log.debug('No outdated comments to delete');
    }
  }

  private async setCommitStatus(analyzer: IAnalyzerBot) {
    const result = analyzer.isSuccess();
    const commitStatus = result ? CommitStatus.success : CommitStatus.failure;
    const description = analyzer.getCommitDescription();
    await this.prService.setCommitStatus(this.commitId, commitStatus, description);
  }
}
