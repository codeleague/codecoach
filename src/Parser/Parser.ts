import ParserInterface from './@interfaces/parser.interface';
import { SplitterType } from './@types/splitter.type';
import ParserLoaderType from './@types/parser.loader.type';
import lineBreakUtil from './utils/lineBreak.util';

export class Parser<T> implements ParserInterface<T> {
  source: string;
  lineSplitter: SplitterType;

  lineSplitted: string[];
  lineLabled: T[];

  constructor(loader: ParserLoaderType) {
    const { source } = loader;
    this.source = source;
    this.lineSplitter = '\r\n';
    return this;
  }

  setLineSplitter(sep?: SplitterType): Parser<T> {
    const detectedLineSplitter = lineBreakUtil(this.source);
    this.lineSplitter = sep || detectedLineSplitter;
    this.lineSplitted = this.source
      .split(this.lineSplitter)
      .map((e) => e.trim())
      .filter((e) => e !== '' && e !== this.lineSplitter);
    return this;
  }

  getLineSplit(): string[] {
    return this.lineSplitted;
  }

  mapLabel(parser: (line: string, index: number, arr: string[]) => T): Parser<T> {
    if (!this.lineSplitted) throw new Error('setLineSplitter first');
    this.lineLabled = this.lineSplitted.map(parser).filter((e) => e);
    return this;
  }

  getLabled(): T[] {
    return this.lineLabled;
  }
}
