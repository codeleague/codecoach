import { Diff } from '../../Git/@types/PatchTypes';
import { AnalyzerBot } from '../../AnalyzerBot/AnalyzerBot';

export interface VCSAdapter {
  init(): Promise<void>;
  wrapUp(analyzerBot: AnalyzerBot): Promise<boolean>;
  getName(): string;
  getLatestCommitSha(): string;
  diff(): Promise<Diff[]>;
  createComment(comment: string): Promise<void>;
  createReviewComment(text: string, file: string, line: number): Promise<void>;

  removeExistingComments(): Promise<void>;
}
