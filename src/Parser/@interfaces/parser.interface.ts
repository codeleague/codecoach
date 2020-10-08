import { LogType } from '..';

export interface Parser {
  withContent(content: string): Parser;
  getLogs(): LogType[];
}
