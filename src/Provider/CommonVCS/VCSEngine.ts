import { VCS } from '../@interfaces/VCS';
import { LogType } from '../../Parser';
import { Log } from '../../Logger';
import { Comment } from '../../AnalyzerBot/@types/CommentTypes';
import { Diff } from '../../Git/@types/PatchTypes';
import { VCSEngineConfig } from '../@types/VCSEngineConfig';
import { AnalyzerBot } from '../../AnalyzerBot/AnalyzerBot';

export abstract class VCSEngine implements VCS {
  protected analyzerBot: AnalyzerBot;
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

      await Promise.all(
        this.analyzerBot.comments.map((c) => this.createReviewComment(c)),
      );
      await this.createSummaryComment();

      Log.info('Report commit status completed');
    } catch (err) {
      Log.error(`${this.vcsName()} report failed`, err);
      throw err;
    }
    return this.analyzerBot.isSuccess();
  }

  private async setup(logs: LogType[]) {
    const touchedDiff = await this.vcsDiff();
    this.analyzerBot = new AnalyzerBot(this.config, logs, touchedDiff);

    Log.debug(`VCS Setup`, {
      sha: this.vcsGetLatestCommitSha(),
      diff: touchedDiff,
      comments: this.analyzerBot.comments,
      err: this.analyzerBot.nError,
      warning: this.analyzerBot.nWarning,
    });
  }

  private async createSummaryComment() {
    if (this.analyzerBot.shouldGenerateOverview()) {
      await this.vcsCreateComment(this.analyzerBot.getOverviewMessage());
      Log.info('Create summary comment completed');
    } else {
      Log.info('No summary comment needed');
    }
  }

  private async createReviewComment(comment: Comment): Promise<Comment> {
    const { text, file, line } = comment;

    await this.vcsCreateReviewComment(text, file, line);
    Log.debug(`${this.vcsName()} create review success`, { text, file, line });
    return comment;
  }
}
