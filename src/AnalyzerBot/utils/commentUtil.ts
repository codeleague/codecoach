import { LogSeverity, LogType } from '../../Parser';
import { Comment, CommentStructure } from '../@types/CommentTypes';
import { MessageUtil } from './message.util';

export function groupComments(logs: LogType[], suppressRules: Array<string>): Comment[] {
  const commentMap = logs.reduce((state: CommentStructure, log) => {
    const { source: file, line } = log;

    if (!line) return state;

    const currentComment = getOrInitComment(state, file, line);
    const updatedComment = updateComment(currentComment, log, suppressRules);
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
      suppresses: 0,
      file,
      line,
    }
  );
}

function buildText(currentComment: Comment, log: LogType, isSuppressed: boolean): string {
  const { severity, msg } = log;
  const { text: currentText } = currentComment;
  const msgWithSuppression = isSuppressed ? `(SUPPRESSED) ${msg}` : msg;
  const text = MessageUtil.createMessageWithEmoji(msgWithSuppression, severity);
  return `${currentText}${text}  \n`;
}

function calculateErrors(
  currentComment: Comment,
  log: LogType,
  isSuppressed: boolean,
): number {
  if (isSuppressed) return currentComment.errors;
  const { severity } = log;
  return currentComment.errors + (severity === LogSeverity.error ? 1 : 0);
}

function calculateWarnings(
  currentComment: Comment,
  log: LogType,
  isSuppressed: boolean,
): number {
  if (isSuppressed) return currentComment.warnings;
  const { severity } = log;
  return currentComment.warnings + (severity === LogSeverity.warning ? 1 : 0);
}

function calculateSuppresses(currentComment: Comment, isSuppressed: boolean): number {
  return currentComment.suppresses + (isSuppressed ? 1 : 0);
}

function shouldBeSuppressed(log: LogType, suppressRules: Array<string>): boolean {
  const suppressRegexps: Array<RegExp> = suppressRules.map((rule) => new RegExp(rule));
  return suppressRegexps.some((regexp) => regexp.test(log.ruleId));
}

function updateComment(
  currentComment: Comment,
  log: LogType,
  suppressRules: Array<string>,
): Comment {
  const isSuppressed = shouldBeSuppressed(log, suppressRules);
  return {
    text: buildText(currentComment, log, isSuppressed),
    errors: calculateErrors(currentComment, log, isSuppressed),
    warnings: calculateWarnings(currentComment, log, isSuppressed),
    suppresses: calculateSuppresses(currentComment, isSuppressed),
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
