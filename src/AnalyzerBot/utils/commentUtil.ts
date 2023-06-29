import { LogSeverity, LogType } from '../../Parser';
import { Comment, CommentStructure } from '../@types/CommentTypes';
import { MessageUtil } from './message.util';

export function groupComments(logs: LogType[]): Comment[] {
  const commentMap = logs.reduce((state: CommentStructure, log) => {
    const { source: file, line } = log;

    if (!line) return state;

    const currentComment = getOrInitComment(state, file, line);
    const updatedComment = updateComment(currentComment, log);
    return updateCommentStructure(state, updatedComment);
  }, {});

  return Object.values(commentMap).flatMap((file) => Object.values(file));
}

function getOrInitComment(map: CommentStructure, file: string, line: number): Comment {
  return (
    map?.[file]?.[line] ?? {
      text: '',
      errors: 0,
      warnings: 0,
      file,
      line,
    }
  );
}

function buildText(currentComment: Comment, log: LogType): string {
  const { severity, msg } = log;
  const { text: currentText } = currentComment;
  const text = MessageUtil.createMessageWithEmoji(msg, severity);
  return `${currentText}${text}  \n`;
}

function calculateErrors(currentComment: Comment, log: LogType): number {
  const { severity } = log;
  return currentComment.errors + (severity === LogSeverity.error ? 1 : 0);
}

function calculateWarnings(currentComment: Comment, log: LogType): number {
  const { severity } = log;
  return currentComment.warnings + (severity === LogSeverity.warning ? 1 : 0);
}

function updateComment(currentComment: Comment, log: LogType): Comment {
  return {
    text: buildText(currentComment, log),
    errors: calculateErrors(currentComment, log),
    warnings: calculateWarnings(currentComment, log),
    file: currentComment.file,
    line: currentComment.line,
  };
}

function updateCommentStructure(
  currentStructure: CommentStructure,
  updatedComment: Comment,
): CommentStructure {
  return {
    ...currentStructure,
    [updatedComment.file]: {
      ...currentStructure?.[updatedComment.file],
      [updatedComment.line]: updatedComment,
    },
  };
}
