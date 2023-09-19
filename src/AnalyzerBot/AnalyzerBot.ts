import { LintSeverity, LintItem } from '../Parser';
import { Diff } from '../Git/@types/PatchTypes';
import { onlyIn, onlySeverity } from './utils/filter.util';
import { groupComments } from './utils/commentUtil';
import { MessageUtil } from './utils/message.util';
import { AnalyzerBotConfig } from './@interfaces/AnalyzerBotConfig';
import { Comment } from './@types/CommentTypes';
import { IAnalyzerBot } from './@interfaces/IAnalyzerBot';

export class AnalyzerBot implements IAnalyzerBot {
  touchedFileItem: LintItem[];
  comments: Comment[];
  nError: number;
  nWarning: number;

  constructor(private readonly config: AnalyzerBotConfig) {}

  analyze(items: LintItem[], touchedDiff: Diff[]): void {
    this.touchedFileItem = items
      .filter(onlySeverity(LintSeverity.error, LintSeverity.warning))
      .filter(onlyIn(touchedDiff));
    this.comments = groupComments(this.touchedFileItem, this.config.suppressRules);
    this.nError = this.comments.reduce((sum, comment) => sum + comment.errors, 0);
    this.nWarning = this.comments.reduce((sum, comment) => sum + comment.warnings, 0);
  }

  shouldGenerateOverview(): boolean {
    return this.nError + this.nWarning > 0;
  }

  getOverviewMessage(): string {
    return MessageUtil.generateOverviewMessage(this.nError, this.nWarning);
  }

  getCommitDescription(): string {
    return MessageUtil.generateCommitDescription(this.nError);
  }

  isSuccess(): boolean {
    return this.config.failOnWarnings
      ? this.nError + this.nWarning === 0
      : this.nError === 0;
  }
}
