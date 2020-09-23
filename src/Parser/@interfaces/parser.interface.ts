import { SplitterType } from '../@types/splitter.type';

interface ParserInterface<T> {
  source: string;
  lineSplitter: SplitterType;
  lineSplitted: string[];
  lineLabled: T[];

  setLineSplitter(sep?: SplitterType): ParserInterface<T>;
  getLineSplit(): string[];
  mapLabel(parser: (line: string, index: number, arr: string[]) => T): ParserInterface<T>;
  getLabled(): T[];
}

export default ParserInterface;
