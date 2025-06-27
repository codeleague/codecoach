import { VCS } from '../@interfaces/VCS';
import { LintItem } from '../../Parser';
import { Log } from '../../Logger';
import { Comment } from '../../AnalyzerBot/@types/CommentTypes';
import { VCSEngineConfig } from '../@interfaces/VCSEngineConfig';
import { VCSAdapter } from '../@interfaces/VCSAdapter';
import { IAnalyzerBot } from '../../AnalyzerBot/@interfaces/IAnalyzerBot';

export class VCSEngine implements VCS {
  constructor(
    private readonly config: VCSEngineConfig,
    private readonly analyzerBot: IAnalyzerBot,
    private readonly adapter: VCSAdapter,
  ) {}

  async report(items: LintItem[]): Promise<boolean> {
    try {
      await this.adapter.init();
      await this.setup(items);

      if (this.config.removeOldComment) {
        await this.adapter.removeExistingComments(this.analyzerBot.comments);
      }

      if (!this.config.silent) {
        await Promise.all(
          this.analyzerBot.comments.map((c) => this.createReviewComment(c)),
        );
        await this.createSummaryComment();

        Log.info('Report commit status completed');
      } else {
        Log.info('Silent mode is on. No inline comment nor summary will be produced.');
      }
    } catch (err) {
      Log.error(`${this.adapter.getName()} report failed`, err);
      throw err;
    }
    return await this.adapter.wrapUp(this.analyzerBot);
  }

  private async setup(items: LintItem[]) {
    const touchedDiff = await this.adapter.diff();
    this.analyzerBot.analyze(items, touchedDiff);

    Log.debug(`VCS Setup`, {
      sha: this.adapter.getLatestCommitSha(),
      diff: touchedDiff,
      comments: this.analyzerBot.comments,
      err: this.analyzerBot.nError,
      warning: this.analyzerBot.nWarning,
    });
  }

  private async createSummaryComment() {
    if (this.analyzerBot.shouldGenerateOverview()) {
      await this.adapter.createComment(this.analyzerBot.getOverviewMessage());
      Log.info('Create summary comment completed');
    } else {
      Log.info('No summary comment needed');
    }
  }

  private async createReviewComment(comment: Comment): Promise<Comment> {
    const { text, file, line, nLines } = comment;
    await this.adapter.createReviewComment(text, file, line, nLines);
    Log.debug(`${this.adapter.getName()} create review success`, {
      text,
      file,
      line,
      nLines,
    });
    return comment;
  }
}
