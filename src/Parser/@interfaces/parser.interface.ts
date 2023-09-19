import { LintItem } from '..';

export abstract class Parser {
  constructor(protected readonly cwd: string) {}

  abstract parse(content: string): LintItem[];
}
