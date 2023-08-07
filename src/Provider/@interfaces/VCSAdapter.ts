import { Diff } from '../../Git/@types/PatchTypes';
import { IAnalyzerBot } from '../../AnalyzerBot/@interfaces/IAnalyzerBot';

export interface VCSAdapter {
  init(): Promise<void>;
  wrapUp(analyzerBot: IAnalyzerBot): Promise<boolean>;
  getName(): string;
  getLatestCommitSha(): string;
  diff(): Promise<Diff[]>;
  createComment(comment: string): Promise<void>;
  createReviewComment(
    text: string,
    file: string,
    line: number,
    nLines?: number,
  ): Promise<void>;
  removeExistingComments(): Promise<void>;
}
