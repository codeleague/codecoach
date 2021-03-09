export interface Patch {
  from: number;
  to: number;
}

export interface Diff {
  file: string;
  patch: Patch[];
}
