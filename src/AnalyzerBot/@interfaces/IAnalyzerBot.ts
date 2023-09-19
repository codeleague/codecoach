import { LintItem } from '../../Parser';
import { Comment } from '../@types/CommentTypes';
import { Diff } from '../../Git/@types/PatchTypes';

export interface IAnalyzerBot {
  touchedFileItem: LintItem[];
  comments: Comment[];
  nError: number;
  nWarning: number;

  analyze(items: LintItem[], touchedDiff: Diff[]): void;

  shouldGenerateOverview(): boolean;

  getOverviewMessage(): string;

  getCommitDescription(): string;

  isSuccess(): boolean;
}
