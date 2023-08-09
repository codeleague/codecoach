import { VCSAdapter } from '../@interfaces/VCSAdapter';
import { IGitHubPRService } from './IGitHubPRService';
import { Diff } from '../../Git/@types/PatchTypes';
import { CommitStatus } from './CommitStatus';
import { Log } from '../../Logger';
import { IAnalyzerBot } from '../../AnalyzerBot/@interfaces/IAnalyzerBot';

export class GitHubAdapter implements VCSAdapter {
  private commitId: string;
  constructor(private readonly prService: IGitHubPRService) {}

  async init(): Promise<void> {
    this.commitId = await this.prService.getLatestCommitSha();
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
    return this.prService.createComment(comment);
  }

  createReviewComment(
    text: string,
    file: string,
    line: number,
    nLines: number,
  ): Promise<void> {
    return this.prService.createReviewComment(this.commitId, text, file, line, nLines);
  }

  async removeExistingComments(): Promise<void> {
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

  private async setCommitStatus(analyzer: IAnalyzerBot) {
    const result = analyzer.isSuccess();
    const commitStatus = result ? CommitStatus.success : CommitStatus.failure;
    const description = analyzer.getCommitDescription();
    await this.prService.setCommitStatus(this.commitId, commitStatus, description);
  }
}
