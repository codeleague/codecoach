type Splitter = string | RegExp;
export class Parser<T> {
  private source: string;
  private lineSplitter: Splitter;

  private lineSplitted: string[];
  private lineLabled: T[];

  constructor(source: string) {
    this.source = source;
    this.lineSplitter = '\r\n';
    return this;
  }

  setLineSplitter(sep?: Splitter): Parser<T> {
    this.lineSplitter = sep || this.lineSplitter;
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
