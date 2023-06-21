import { VCS } from '..';
import { Log } from '../../Logger';
import { LogType } from '../../Parser';
import { Diff } from '../../Git/@types/PatchTypes';
import { CommitStatus } from './CommitStatus';
import { IGitHubPRService } from './IGitHubPRService';
import { VCSEngine } from '../CommonVCS/VCSEngine';
import { VCSEngineConfig } from '../@types/VCSEngineConfig';

export class GitHub extends VCSEngine implements VCS {
  private commitId: string;

  constructor(private readonly prService: IGitHubPRService, config: VCSEngineConfig) {
    super(config);
  }

  async report(logs: LogType[]): Promise<boolean> {
    await this.prSetup();
    const result = await super.report(logs);
    await this.setCommitStatus(result);
    return true;
  }

  private async setCommitStatus(result: boolean) {
    const commitStatus = result ? CommitStatus.success : CommitStatus.failure;
    const description = this.analyzerBot.getCommitDescription();
    await this.prService.setCommitStatus(this.commitId, commitStatus, description);
  }

  private async prSetup(): Promise<void> {
    this.commitId = await this.prService.getLatestCommitSha();
  }

  vcsCreateComment(comment: string): Promise<void> {
    return this.prService.createComment(comment);
  }

  vcsCreateReviewComment(text: string, file: string, line: number): Promise<void> {
    return this.prService.createReviewComment(this.commitId, text, file, line);
  }

  vcsDiff(): Promise<Diff[]> {
    return this.prService.diff();
  }

  vcsGetLatestCommitSha(): string {
    return this.commitId;
  }

  vcsName(): string {
    return 'GitHub';
  }

  async vcsRemoveExistingComments(): Promise<void> {
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
}
