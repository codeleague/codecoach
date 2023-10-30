import { LintSeverity, LintItem } from '../../Parser';
import { Comment, CommentStructure } from '../@types/CommentTypes';
import { MessageUtil } from './message.util';

export function groupComments(
  items: LintItem[],
  suppressRules: Array<string>,
): Comment[] {
  const commentMap = items.reduce((state: CommentStructure, item) => {
    const { source: file, line, nLines } = item;

    if (!line) return state;

    const currentComment = getOrInitComment(state, file, line, nLines);
    const updatedComment = updateComment(currentComment, item, suppressRules);
    return updateCommentStructure(state, updatedComment);
  }, {});

  return Object.values(commentMap).flatMap((file) => Object.values(file));
}

function getOrInitComment(
  map: CommentStructure,
  file: string,
  line: number,
  nLines = 1,
): Comment {
  return (
    map?.[file]?.[line] ?? {
      text: '',
      errors: 0,
      warnings: 0,
      suppresses: 0,
      file,
      line,
      nLines,
    }
  );
}

function buildText(
  currentComment: Comment,
  item: LintItem,
  isSuppressed: boolean,
): string {
  const { severity, msg } = item;
  const { text: currentText } = currentComment;
  const msgWithSuppression = isSuppressed ? `(SUPPRESSED) ${msg}` : msg;
  const msgWithRuleId = MessageUtil.addRuleIdToMessage(msgWithSuppression, item.ruleId);
  const text = MessageUtil.createMessageWithEmoji(msgWithRuleId, severity);
  return `${currentText}${text}  \n`;
}

function calculateErrors(
  currentComment: Comment,
  item: LintItem,
  isSuppressed: boolean,
): number {
  if (isSuppressed) return currentComment.errors;
  const { severity } = item;
  return currentComment.errors + (severity === LintSeverity.error ? 1 : 0);
}

function calculateWarnings(
  currentComment: Comment,
  item: LintItem,
  isSuppressed: boolean,
): number {
  if (isSuppressed) return currentComment.warnings;
  const { severity } = item;
  return currentComment.warnings + (severity === LintSeverity.warning ? 1 : 0);
}

function calculateSuppresses(currentComment: Comment, isSuppressed: boolean): number {
  return currentComment.suppresses + (isSuppressed ? 1 : 0);
}

function shouldBeSuppressed(item: LintItem, suppressRules: Array<string>): boolean {
  const suppressRegexps: Array<RegExp> = suppressRules.map((rule) => new RegExp(rule));
  return suppressRegexps.some((regexp) => regexp.test(item.ruleId));
}

function updateComment(
  currentComment: Comment,
  item: LintItem,
  suppressRules: Array<string>,
): Comment {
  const isSuppressed = shouldBeSuppressed(item, suppressRules);
  return {
    text: buildText(currentComment, item, isSuppressed),
    errors: calculateErrors(currentComment, item, isSuppressed),
    warnings: calculateWarnings(currentComment, item, isSuppressed),
    suppresses: calculateSuppresses(currentComment, isSuppressed),
    file: currentComment.file,
    line: currentComment.line,
    nLines: currentComment.nLines,
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
