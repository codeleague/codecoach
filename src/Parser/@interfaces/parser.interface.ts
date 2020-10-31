import { LogType } from '..';

export abstract class Parser {
  protected logs: LogType[] = [];
  public getLogs(): LogType[] {
    return this.logs;
  }

  constructor(protected readonly cwd: string) {}

  abstract withContent(content: string): Parser;
}
