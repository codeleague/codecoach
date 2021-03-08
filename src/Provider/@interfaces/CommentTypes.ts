export interface Comment {
  file: string;
  line: number;
  text: string;
  errors: number;
  warnings: number;
}

export interface CommentStructure {
  [filename: string]: CommentFileStructure;
}

export interface CommentFileStructure {
  [lineNumber: number]: Comment;
}
